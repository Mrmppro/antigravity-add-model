import { app, BrowserWindow, dialog, ipcMain, Menu, Notification, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import { broadcastState, checkForUpdates, getLastState } from './updater';
import log from 'electron-log/main';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { extensionAuthorities } from './customScheme';
import { updateTrayAgentCount } from './tray';
import { StorageManager } from './storage';
import { getAutoSwitchConfigPath, loadAutoSwitchPolicy, saveAutoSwitchPolicy } from './autoSwitch/config';
import { AutoSwitchPolicy, AutoSwitchRoute } from './autoSwitch/types';
import { VerifiableModel, verifyModel } from './autoSwitch/verifier';
import { getIdeInstallPath } from './ideInstall/constants';
import {
  distroToWindowsPath,
  getActiveWslDistro,
  getDistroHome,
  isWslAvailable,
  listWslDistros,
  windowsToDistroPath,
} from './wsl';
import { relaunchWithWslDistro } from './menu';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cryptoStore = require('./cryptoStore');

interface ContextMenuItemParam {
  id: string;
  label?: string;
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  checked?: boolean;
  disabled?: boolean;
  accelerator?: string;
  submenu?: ContextMenuItemParam[];
}

function buildContextMenuTemplate(
  items: ContextMenuItemParam[],
  onSelect: (id: string) => void,
): Electron.MenuItemConstructorOptions[] {
  return items.map((item) => {
    if (item.type === 'separator') {
      return { type: 'separator' };
    }
    if (item.type === 'submenu' || (item.submenu && item.submenu.length > 0)) {
      return {
        id: item.id,
        label: item.label ?? '',
        type: 'submenu',
        enabled: !item.disabled,
        submenu: buildContextMenuTemplate(item.submenu ?? [], onSelect),
      };
    }
    return {
      id: item.id,
      label: item.label ?? '',
      type: item.type ?? 'normal',
      checked: item.checked,
      enabled: !item.disabled,
      accelerator: item.accelerator,
      click: () => {
        onSelect(item.id);
      },
    };
  });
}

/**
 * Registers all IPC handlers for the main process.
 */
export function registerIpcHandlers(storageManager: StorageManager): void {
  // Dialog
  // In WSL mode, start the folder dialog in the distro's home directory.
  async function dialogDefaultPath(): Promise<string | undefined> {
    const distro = getActiveWslDistro();
    if (!distro) {
      return undefined;
    }
    try {
      return distroToWindowsPath(await getDistroHome(distro), distro);
    } catch {
      return undefined;
    }
  }

  // In WSL mode, translate a picked Windows path to the distro's view.
  // Returns undefined when the path is unusable (e.g. another distro).
  function mapPickedPath(picked: string): string | undefined {
    const distro = getActiveWslDistro();
    if (!distro) {
      return picked;
    }
    const t = windowsToDistroPath(picked, distro);
    if (t.error) {
      dialog.showErrorBox('Cannot open folder', t.error);
      return undefined;
    }
    if (t.warning) {
      void dialog.showMessageBox({
        type: 'warning',
        message: 'Folder is on the Windows filesystem',
        detail: t.warning,
      });
    }
    return t.path;
  }

  ipcMain.handle('dialog:open-workspace', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Open workspace',
      defaultPath: await dialogDefaultPath(),
    });
    if (result.canceled || result.filePaths.length === 0) {
      return undefined;
    }
    return mapPickedPath(result.filePaths[0]);
  });

  // Like 'dialog:open-workspace' but allows selecting multiple folders,
  // returning an array of paths (empty if cancelled).
  ipcMain.handle('dialog:open-workspaces', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory', 'multiSelections'],
      title: 'Open workspaces',
      defaultPath: await dialogDefaultPath(),
    });
    if (result.canceled || result.filePaths.length === 0) {
      return [];
    }
    return result.filePaths
      .map(mapPickedPath)
      .filter((p): p is string => p !== undefined);
  });

  // Auto-updater
  ipcMain.handle('updater:apply', async () => {
    broadcastState({ type: 'ready' });
  });
  ipcMain.handle('updater:quit-and-install', () => {
    if (!app.isPackaged) {
      console.log('[AutoUpdater] Skipping quitAndInstall (requires a packaged app).');
      return;
    }
    autoUpdater.quitAndInstall();
  });
  ipcMain.handle('updater:get-state', async () => {
    return getLastState();
  });

  // Notifications
  ipcMain.handle(
    'notification:send',
    (_event, options: { title: string; body: string; silent?: boolean; payload?: unknown }) => {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        silent: options.silent ?? false,
      });
      notification.on('click', () => {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
          if (win.isMinimized()) {
            win.restore();
          }
          win.show();
          win.focus();
          if (options.payload) {
            win.webContents.send('notification:clicked', options.payload);
          }
        }
      });
      notification.show();
    },
  );

  // Note: copied from our desktop AGY implementation:
  // vs/platform/nativeNotification/electron-main/electronNotificationService.ts
  ipcMain.handle('notification:open-system-preferences', async () => {
    if (process.platform === 'darwin') {
      void shell.openExternal('x-apple.systempreferences:com.apple.preference.notifications');
    } else if (process.platform === 'win32') {
      void shell.openExternal('ms-settings:notifications');
    } else if (process.platform === 'linux') {
      const { exec } = await import('child_process');
      const commands = [
        'gnome-control-center notifications',
        'systemsettings kcm_notifications',
        'xfce4-notifyd-config',
        'gnome-control-center',
        'systemsettings',
      ];
      for (const command of commands) {
        try {
          exec(command);
          return; // If one command executes without immediate error, assume success for now
        } catch {
          // Try next
        }
      }
    }
  });

  // Storage
  ipcMain.handle('storage:get-items', async () => {
    return storageManager.getItems();
  });
  ipcMain.handle('storage:update-items', async (_event, changes: Record<string, string | null>) => {
    await storageManager.updateItems(changes);
  });
  ipcMain.handle('storage:get-custom-models', async () => {
    const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
    const filePath = path.join(geminiDir, 'custom_models.json');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
      const models = parsed.models || [];

      // Return models with masked API keys and keyValid flag to UI
      return models.map((m) => {
        let maskedKey: string = m.apiKey;
        let keyValid = true;
        if (m.apiKey && m.apiKey !== 'none') {
          const decrypted = cryptoStore.decryptString(m.apiKey) as string;
          if (!decrypted || decrypted === 'DECRYPTION_FAILED' || decrypted.startsWith('DECRYPTION_FAILED')) {
            keyValid = false;
            maskedKey = 'Key needs update';
          } else if (decrypted.length <= 8) {
            maskedKey = '********';
          } else {
            maskedKey = decrypted.substring(0, 4) + '...' + decrypted.substring(decrypted.length - 4);
          }
        }
        return {
          ...m,
          apiKey: maskedKey,
          keyValid,
        };
      });
    } catch {
      return [];
    }
  });

  ipcMain.handle(
    'storage:save-custom-model',
    async (_event, newModel: CustomModelFileEntry & { apiKey?: string; originalModelName?: string }) => {
      const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
      const filePath = path.join(geminiDir, 'custom_models.json');
      try {
        let models: CustomModelFileEntry[] = [];
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
          models = parsed.models || [];
        } catch {
          // Ignore if file doesn't exist
        }

        // Sanitize model identifier (clean leading models/ prefix)
        const rawId = (newModel.externalModelName || newModel.name || '').trim();
        const cleanId = rawId.replace(/^models\//, '').trim();
        newModel.name = 'models/' + cleanId;
        newModel.externalModelName = cleanId;

        // Auto-fill friendly display name if empty
        if (!newModel.displayName || !newModel.displayName.trim()) {
          newModel.displayName = cleanId;
        }

        // Handle rename if originalModelName is provided and different from newModel.name
        const originalIdx =
          newModel.originalModelName && newModel.originalModelName !== newModel.name
            ? models.findIndex((m) => m.name === newModel.originalModelName || m.name === 'models/' + newModel.originalModelName!.replace(/^models\//, ''))
            : -1;

        // Check if model already exists under target name
        const existingIdx = models.findIndex((m) => m.name === newModel.name);
        const targetOld = originalIdx !== -1 ? models[originalIdx] : existingIdx !== -1 ? models[existingIdx] : undefined;

        // Edit collision protection: If new key is masked/empty and old record exists, preserve old encrypted key
        const isMaskedOrEmpty =
          !newModel.apiKey ||
          newModel.apiKey === 'none' ||
          newModel.apiKey.includes('...') ||
          newModel.apiKey.startsWith('***') ||
          newModel.apiKey.includes('••') ||
          newModel.apiKey === '********' ||
          newModel.apiKey === 'Key needs update';

        if (isMaskedOrEmpty && targetOld && targetOld.apiKey && targetOld.apiKey !== 'none') {
          newModel.apiKey = targetOld.apiKey;
          newModel.encrypted = targetOld.encrypted;
        } else {
          if (newModel.apiKey && newModel.apiKey !== 'none') {
            newModel.apiKey = cryptoStore.encryptString(newModel.apiKey);
            newModel.encrypted = true;
          }
        }

        // Clean up original entry if renamed
        if (originalIdx !== -1) {
          models.splice(originalIdx, 1);
        }

        // Clean up helper property
        delete (newModel as { originalModelName?: string }).originalModelName;

        const updatedIdx = models.findIndex((m) => m.name === newModel.name);
        if (updatedIdx !== -1) {
          models[updatedIdx] = newModel;
        } else {
          models.push(newModel);
        }

        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify({ models }, null, 2), 'utf-8');
        return { success: true };
      } catch (err) {
        console.error('[IPC] Failed to save custom model:', err);
        return { success: false, error: (err as Error).message };
      }
    },
  );

  ipcMain.handle('storage:delete-custom-model', async (_event, modelName: string) => {
    const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
    const filePath = path.join(geminiDir, 'custom_models.json');
    try {
      let models: CustomModelFileEntry[] = [];
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
        models = parsed.models || [];
      } catch {
        // Ignore if file doesn't exist
      }

      const cleanTarget = modelName.replace(/^models\//, '').trim();
      models = models.filter((m) => {
        const mClean = (m.name || '').replace(/^models\//, '').trim();
        return mClean !== cleanTarget && m.name !== modelName;
      });

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify({ models }, null, 2), 'utf-8');
      return { success: true };
    } catch (err) {
      console.error('[IPC] Failed to delete custom model:', err);
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('storage:update-provider-keys', async (_event, provider: string, newApiKey: string) => {
    const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
    const filePath = path.join(geminiDir, 'custom_models.json');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
      const models = parsed.models || [];
      const encryptedKey = cryptoStore.encryptString(newApiKey.trim());
      let updatedCount = 0;
      for (const m of models) {
        if (m.provider === provider || (provider === 'openrouter' && (m.apiUrl?.includes('openrouter') || m.provider === 'openrouter'))) {
          m.apiKey = encryptedKey;
          m.encrypted = true;
          updatedCount++;
        }
      }
      await fs.writeFile(filePath, JSON.stringify({ models }, null, 2), 'utf-8');
      return { success: true, updatedCount };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  // Gravity Auto Switch policy. The detailed policy is intentionally separate from
  // custom_models.json so routing preferences never expose or duplicate API keys.
  ipcMain.handle('autoSwitch:get-policy', async () => {
    return loadAutoSwitchPolicy(getAutoSwitchConfigPath(app.getPath('home')));
  });
  ipcMain.handle('autoSwitch:save-policy', async (_event, policy: AutoSwitchPolicy) => {
    return saveAutoSwitchPolicy(getAutoSwitchConfigPath(app.getPath('home')), policy);
  });
  ipcMain.handle('autoSwitch:set-enabled', async (_event, enabled: boolean) => {
    const filePath = getAutoSwitchConfigPath(app.getPath('home'));
    const policy = loadAutoSwitchPolicy(filePath);
    policy.enabled = enabled === true;
    return saveAutoSwitchPolicy(filePath, policy);
  });

  /**
   * Probes one of the user's own models and reports what it can actually do.
   *
   * This runs in main because the stored API key is encrypted and the renderer
   * only ever sees a masked version of it.
   */
  ipcMain.handle(
    'autoSwitch:verify-model',
    async (_event, modelName: string): Promise<VerifyModelResult> => {
      try {
        const model = await findStoredModel(modelName);
        if (!model) {
          return { ok: false, messages: ['That model is no longer saved. Add it again and retry.'] };
        }

        const apiKey = await decryptStoredKey(model);

        const verifiable: VerifiableModel = {
          name: model.name,
          displayName: model.displayName,
          provider: model.provider,
          apiKey,
          apiUrl: model.apiUrl,
          externalModelName: model.externalModelName,
          allowUnauthorized: model.allowUnauthorized,
        };

        const result = await verifyModel(verifiable, apiKey);
        // A passing probe is the only thing that may enable a route, which is
        // what makes "Save" safe for someone who does not know these providers.
        const route: AutoSwitchRoute = { ...result.route, enabled: result.ok };
        if (result.ok) await upsertRoute(route);
        return { ok: result.ok, route, messages: result.messages };
      } catch (err) {
        log.error('[Auto Switch] Verification handler failed:', err);
        return { ok: false, messages: ['Verification could not be completed. Check the model details and try again.'] };
      }
    },
  );

  ipcMain.handle('autoSwitch:reverify-stale', async (): Promise<ReverifyResult> => reverifyStaleRoutes());

  // P3-17: Test model connectivity — sends a lightweight HEAD/GET to the model endpoint
  ipcMain.handle('storage:test-model-connection', async (_event, model: TestModelParams) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const https = require('https');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const http = require('http');

    return new Promise<ConnectionTestResult>((resolve) => {
      try {
        let urlStr = model.apiUrl;
        // Normalize URL for chat API endpoints
        if (model.provider === 'openai' || model.provider === 'custom' || model.provider === 'ollama') {
          if (!urlStr.toLowerCase().includes('/chat/completions') && !urlStr.toLowerCase().includes('/completions')) {
            if (urlStr.endsWith('/v1')) {
              urlStr += '/chat/completions';
            } else if (!urlStr.endsWith('/')) {
              urlStr += '/v1/chat/completions';
            } else {
              urlStr += 'v1/chat/completions';
            }
          }
        }

        const url = new URL(urlStr);
        const client = url.protocol === 'https:' ? https : http;

        interface RequestOptions {
          method: string;
          hostname: string;
          port: number;
          path: string;
          timeout: number;
          rejectUnauthorized: boolean;
          headers?: Record<string, string>;
        }

        const options: RequestOptions = {
          method: 'HEAD',
          hostname: url.hostname,
          port: parseInt(url.port || (url.protocol === 'https:' ? '443' : '80'), 10),
          path: url.pathname + url.search,
          timeout: 10000,
          rejectUnauthorized: !model.allowUnauthorized,
        };

        // Add auth header
        let key = model.apiKey;
        const isMaskedOrEmpty =
          !key ||
          key === 'none' ||
          key.includes('...') ||
          key.startsWith('***') ||
          key.includes('••') ||
          key === '********';

        if (isMaskedOrEmpty && (model as { name?: string }).name) {
          try {
            const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
            const filePath = path.join(geminiDir, 'custom_models.json');
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const content = require('fs').readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
            const found = parsed.models?.find((m) => m.name === (model as { name?: string }).name);
            if (found?.apiKey && found.apiKey !== 'none') {
              key = cryptoStore.decryptString(found.apiKey) || found.apiKey;
            }
          } catch {
            /* key lookup fallback */
          }
        } else if (key && key !== 'none') {
          try {
            key = cryptoStore.decryptString(key);
          } catch {
            /* key might not be encrypted */
          }
        }

        if (key && key !== 'none' && !key.includes('...')) {
          if (model.provider === 'anthropic') {
            options.headers = {
              'x-api-key': key,
              'anthropic-version': '2023-06-01',
            };
            const wsId =
              (model as unknown as { workspaceId?: string; anthropicWorkspaceId?: string }).workspaceId ||
              (model as unknown as { workspaceId?: string; anthropicWorkspaceId?: string }).anthropicWorkspaceId ||
              process.env.ANTHROPIC_WORKSPACE_ID;
            if (wsId) {
              (options.headers as Record<string, string>)['anthropic-workspace-id'] = wsId;
            }
          } else if (model.provider === 'google') {
            options.headers = {
              'x-goog-api-key': key,
            };
          } else {
            options.headers = {
              Authorization: `Bearer ${key}`,
            };
          }
        }

        const req = client.request(options, (res: { statusCode?: number; resume: () => void }) => {
          const code = res.statusCode || 0;
          if (code === 401) {
            resolve({
              success: false,
              status: code,
              error: 'Invalid API Key (HTTP 401 Unauthorized)',
            });
          } else if (code === 403) {
            resolve({
              success: false,
              status: code,
              error: 'Access Forbidden (HTTP 403 Forbidden)',
            });
          } else if (code >= 200 && code < 400) {
            resolve({
              success: true,
              status: code,
              message: `Connected & Authenticated (HTTP ${code}) ✓`,
            });
          } else if (code === 405) {
            // Method Not Allowed on chat completions endpoint (normal for HEAD/GET on POST-only endpoints)
            resolve({
              success: true,
              status: code,
              message: `Endpoint reachable (HTTP 405) ✓`,
            });
          } else {
            resolve({
              success: false,
              status: code,
              error: `Server returned HTTP ${code}`,
            });
          }
          res.resume(); // consume response to free memory
        });

        req.setTimeout(10000, () => {
          req.destroy();
          resolve({ success: false, error: 'Connection timed out after 10 seconds' });
        });

        req.on('error', (err: NodeJS.ErrnoException) => {
          let message = err.message;
          if (message.includes('ECONNREFUSED')) {
            message = 'Connection refused — server may not be running';
          } else if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
            message = 'Host not found — check the API URL';
          } else if (message.includes('CERT') || message.includes('certificate') || message.includes('SSL')) {
            message = 'SSL/TLS error — try enabling "allowUnauthorized" for self-signed certs';
          }
          resolve({ success: false, error: message });
        });

        req.end();
      } catch (err) {
        resolve({ success: false, error: `Invalid URL: ${(err as Error).message}` });
      }
    });
  });

  // Logs
  ipcMain.handle('logs:electron', async () => {
    try {
      const logPath = log.transports.file.getFile().path;
      const contents = await fs.readFile(logPath, 'utf-8');
      return contents;
    } catch (err) {
      return `Failed to read logs: ${String(err)}`;
    }
  });

  // Sidecar extension custom scheme
  ipcMain.handle('extensions:send-authorities', async (_event, authorities: Record<string, string>) => {
    extensionAuthorities.clear();
    for (const [key, value] of Object.entries(authorities)) {
      extensionAuthorities.set(key, value);
    }
  });

  // Agent
  ipcMain.handle('agent:update-active-count', async (_event, count: number) => {
    updateTrayAgentCount(count);
  });

  // Window
  ipcMain.handle('window:set-title-bar-overlay', async (_event, options: { color: string; symbolColor: string }) => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win && process.platform === 'win32') {
      win.setTitleBarOverlay({
        color: options.color,
        symbolColor: options.symbolColor,
        height: 30,
      });
    }
  });
  ipcMain.handle('window:minimize', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      win.minimize();
    }
  });
  ipcMain.handle('window:maximize', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      win.maximize();
    }
  });
  ipcMain.handle('window:unmaximize', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      win.unmaximize();
    }
  });
  ipcMain.handle('window:is-maximized', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    return win ? win.isMaximized() : false;
  });
  ipcMain.handle('window:close', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      win.close();
    }
  });
  ipcMain.handle('window:toggle-devtools', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.toggleDevTools();
    }
  });

  let activeContextMenu: Electron.Menu | null = null;
  ipcMain.handle('window:show-context-menu', async (_event, items: ContextMenuItemParam[]) => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (!win || !Array.isArray(items) || items.length === 0) {
      return null;
    }
    activeContextMenu?.closePopup?.(win);
    return new Promise((resolve) => {
      let settled = false;
      const template = buildContextMenuTemplate(items, (id) => {
        if (!settled) {
          settled = true;
          activeContextMenu = null;
          resolve(id);
        }
      });
      const menu = Menu.buildFromTemplate(template);
      activeContextMenu = menu;
      menu.popup({
        window: win,
        callback: () => {
          setImmediate(() => {
            if (activeContextMenu === menu) {
              activeContextMenu = null;
            }
            if (!settled) {
              settled = true;
              resolve(null);
            }
          });
        },
      });
    });
  });

  ipcMain.handle('window:close-context-menu', () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    activeContextMenu?.closePopup?.(win);
    activeContextMenu = null;
  });

  // Zoom — main-process source of truth so the level is reliably persisted
  // across restarts on all platforms (works around a Chromium quirk on Windows
  // where renderer-only webFrame.setZoomLevel changes aren't cached).
  const ZOOM_LEVEL_KEY = 'zoomLevel';
  const ZOOM_STEP = 0.5;
  ipcMain.handle('window:zoom-in', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      const newLevel = win.webContents.getZoomLevel() + ZOOM_STEP;
      win.webContents.setZoomLevel(newLevel);
      await storageManager.updateItems({
        [ZOOM_LEVEL_KEY]: String(newLevel),
      });
    }
  });

  ipcMain.handle('window:zoom-out', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      const newLevel = win.webContents.getZoomLevel() - ZOOM_STEP;
      win.webContents.setZoomLevel(newLevel);
      await storageManager.updateItems({
        [ZOOM_LEVEL_KEY]: String(newLevel),
      });
    }
  });

  ipcMain.handle('window:reset-zoom', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.setZoomLevel(0);
      await storageManager.updateItems({ [ZOOM_LEVEL_KEY]: String(0) });
    }
  });

  // Auto-updater manual check
  ipcMain.handle('updater:check-for-updates', () => {
    checkForUpdates(true);
  });

  // Safe external shell launch
  ipcMain.handle('shell:open-external', async (_event, url: string) => {
    if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('antigravity-ide://')) {
      await shell.openExternal(url);
    }
  });

  ipcMain.handle('shell:reveal-in-file-picker', (_event, filePath: string) => {
    const distro = getActiveWslDistro();
    if (distro) {
      const posixPath = fileURLToPath(filePath, { windows: false } as { windows?: boolean });
      shell.showItemInFolder(distroToWindowsPath(posixPath, distro));
      return;
    }
    shell.showItemInFolder(fileURLToPath(filePath));
  });

  // IDE installation check
  ipcMain.handle('ide:is-installed', async () => {
    try {
      // Check standard installation path (works even if the app has never been launched).
      await fs.stat(getIdeInstallPath());
      return true;
    } catch {
      return false;
    }
  });

  // WSL environment switching (Windows only). Lets the web UI (e.g. the
  // Settings page) discover WSL distros and relaunch the app into/out of one.
  ipcMain.handle('wsl:get-state', async () => {
    if (!isWslAvailable()) {
      return { available: false, activeDistro: null, distros: [] };
    }
    try {
      const distros = await listWslDistros();
      return {
        available: true,
        activeDistro: getActiveWslDistro() || null,
        distros: distros.map((d) => ({ name: d.name, isDefault: d.isDefault })),
      };
    } catch (err) {
      log.error('wsl:get-state failed:', err);
      return { available: false, activeDistro: null, distros: [] };
    }
  });

  // Relaunches into the given distro, or locally when `distro` is empty.
  ipcMain.handle('wsl:connect', (_event, distro: string) => {
    relaunchWithWslDistro(distro || '');
  });
}

// ─── Local Types ──────────────────────────────────────────────────────────────

interface CustomModelFileEntry {
  name: string;
  displayName?: string;
  description?: string;
  provider: string;
  apiKey: string;
  apiUrl: string;
  externalModelName: string;
  allowUnauthorized?: boolean;
  encrypted?: boolean;
  [key: string]: unknown;
}

interface VerifyModelResult {
  ok: boolean;
  route?: AutoSwitchRoute;
  messages: string[];
}

interface ReverifyResult {
  checked: number;
  /** Display names of routes that stopped working and were disabled. */
  failed: string[];
}

function getCustomModelsPath(): string {
  return path.join(app.getPath('home'), '.gemini', 'antigravity', 'custom_models.json');
}

async function readStoredModels(): Promise<CustomModelFileEntry[]> {
  try {
    const content = await fs.readFile(getCustomModelsPath(), 'utf-8');
    const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
    return parsed.models || [];
  } catch {
    return [];
  }
}

async function findStoredModel(modelName: string): Promise<CustomModelFileEntry | undefined> {
  const models = await readStoredModels();
  return models.find((m) => m.name === modelName);
}

async function decryptStoredKey(model: CustomModelFileEntry): Promise<string> {
  const apiKey = model.apiKey || '';
  if (!apiKey || apiKey === 'none') return apiKey;
  try {
    return cryptoStore.decryptString(apiKey) as string;
  } catch {
    // Entries saved before encryption was introduced are already plaintext.
    return apiKey;
  }
}

/**
 * Re-checks routes whose verification has aged past the user's window.
 *
 * A route that no longer passes is disabled rather than silently trusted, so a
 * revoked key or retired model degrades into "use my manual choice" instead of
 * failing every request. Safe to call when Auto Switch is unused: it exits early.
 */
export async function reverifyStaleRoutes(): Promise<ReverifyResult> {
  const filePath = getAutoSwitchConfigPath(app.getPath('home'));
  const policy = loadAutoSwitchPolicy(filePath);
  if (policy.reverifyDays <= 0 || policy.routes.length === 0) return { checked: 0, failed: [] };

  const cutoff = Date.now() - policy.reverifyDays * 24 * 60 * 60 * 1000;
  const stale = policy.routes.filter((route) => route.enabled && route.verified.verifiedAt < cutoff);
  if (stale.length === 0) return { checked: 0, failed: [] };

  const failed: string[] = [];
  for (const route of stale) {
    const model = await findStoredModel(route.id);
    if (!model) {
      failed.push(route.displayName);
      route.enabled = false;
      continue;
    }

    const apiKey = await decryptStoredKey(model);
    const result = await verifyModel(
      {
        name: model.name,
        displayName: model.displayName,
        provider: model.provider,
        apiKey,
        apiUrl: model.apiUrl,
        externalModelName: model.externalModelName,
        allowUnauthorized: model.allowUnauthorized,
      },
      apiKey,
    );

    Object.assign(route, result.route, { enabled: result.ok });
    if (!result.ok) failed.push(route.displayName);
  }

  // Turning routing off when nothing verified remains keeps the policy savable
  // and leaves the user on their own model choice instead of a broken route.
  if (!policy.routes.some((route) => route.enabled && route.verified.reachable)) {
    policy.mode = 'off';
    policy.chatMode = 'manual';
    policy.enabled = false;
  }
  saveAutoSwitchPolicy(filePath, policy);
  return { checked: stale.length, failed };
}

/**
 * Startup entry point for the optional 30-day re-check.
 *
 * Runs detached and never rejects, because Auto Switch maintenance must not be
 * able to delay or break application launch.
 */
export function scheduleAutoSwitchReverification(): void {
  setTimeout(() => {
    void reverifyStaleRoutes()
      .then(({ checked, failed }) => {
        if (checked === 0) return;
        log.info(`[Auto Switch] Re-verified ${checked} model(s); ${failed.length} failed.`);
        if (failed.length === 0 || !Notification.isSupported()) return;
        new Notification({
          title: 'Gravity Auto Switch needs attention',
          body: `${failed.join(', ')} stopped responding and ${failed.length === 1 ? 'was' : 'were'} switched off. Open Customization to verify ${failed.length === 1 ? 'it' : 'them'} again.`,
        }).show();
      })
      .catch((err) => log.error('[Auto Switch] Scheduled re-verification failed:', err));
  }, 15_000).unref?.();
}

/**
 * Stores a freshly verified route without disturbing the user's other settings.
 * Verification results are written immediately so a passing probe is never lost
 * if the window is closed before Save.
 */
async function upsertRoute(route: AutoSwitchRoute): Promise<void> {
  const filePath = getAutoSwitchConfigPath(app.getPath('home'));
  const policy = loadAutoSwitchPolicy(filePath);
  const index = policy.routes.findIndex((existing) => existing.id === route.id);
  if (index === -1) {
    const highestPriority = policy.routes
      .filter((existing) => existing.tier === route.tier)
      .reduce((highest, existing) => Math.max(highest, existing.priority), 0);
    policy.routes.push({ ...route, priority: highestPriority + 1 });
  } else {
    // Verification refreshes facts about the model, never the user's chosen
    // tier, primary, or fallback placement.
    const existing = policy.routes[index];
    policy.routes[index] = { ...route, tier: existing.tier, priority: existing.priority, enabled: existing.enabled };
  }
  saveAutoSwitchPolicy(filePath, policy);
}

interface TestModelParams {
  apiUrl: string;
  provider: string;
  apiKey?: string;
  allowUnauthorized?: boolean;
}

interface ConnectionTestResult {
  success: boolean;
  status?: number;
  message?: string;
  error?: string;
}
