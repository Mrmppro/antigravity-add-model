import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  Notification,
  shell,
  systemPreferences,
  webContents,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { UpdateState } from './types';
import { broadcastState, checkForUpdates, getLastState } from './updater';
import log from 'electron-log/main';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { getAppDataDir } from './paths';
import { extensionAuthorities } from './customScheme';
import { updateTrayAgentCount } from './tray';
const {
  isOwnedBrowserGuestWebContents,
  openTrackedWebviewDownload,
  resolveTrackedWebviewDownload,
  setGuestAgentControlled,
  setGuestDownloadDirectory,
  showTrackedWebviewDownloadInFolder,
  cancelTrackedWebviewDownload,
} = require('./webviewBrowser');
import { getIdeInstallPath } from './ideInstall/constants';
const {
  deviceChooserController,
  WEBVIEW_DEVICE_CHOOSER_RESPONSE_CHANNEL,
  WEBVIEW_DEVICE_CHOOSER_SUBSCRIBER_STATE_CHANNEL,
} = require('./deviceChooser');
import { fileURLToPath } from 'url';
import {
  distroToWindowsPath,
  getActiveWslDistro,
  getDistroHome,
  isWslAvailable,
  listWslDistros,
  windowsToDistroPath,
} from './wsl';
import { relaunchWithWslDistro } from './menu';
const { abortScriptInJail, runScriptInJail, warmScriptJail } = require('./scriptJail');
import { openExternalSafely } from './externalUrl';
import { getFocusedHubWindow, getHubWindows } from './utils';
import { applyHubWindowZoom, setHubZoomStorageManager } from './hubZoom';
const { wcvBrowserRegistry } = require('./wcvBrowserRegistry');
const { isAuthorizedHubMainFrameEvent, registerWcvIpcHandlers } = require('./wcvIpcHandlers');
const { guestDialogController } = require('./guestDialogController');
const {
  guestFileChooserController,
  resolveGuestUploadFiles,
} = require('./guestFileChooserController');
const {
  guestPromptController,
  WEBVIEW_PROMPT_RESPONSE_CHANNEL,
  WEBVIEW_PROMPT_SUBSCRIBER_STATE_CHANNEL,
} = require('./guestPromptController');
const { HUMAN_PROMPT_SYNC_CHANNEL } = require('./webviewPromptPreload');
const { executeJavaScriptInIsolatedWorldWhenReady } = require('./isolatedWorldExec');
const { guestFrameBridge } = require('./guestFrameBridge');
const { guestNetworkController } = require('./guestNetworkController');
const { guestWebMcpController } = require('./guestWebMcpController');

import { StorageManager } from './storage';
import { getAutoSwitchConfigPath, loadAutoSwitchPolicy, saveAutoSwitchPolicy } from './autoSwitch/config';
import { AutoSwitchPolicy, AutoSwitchRoute } from './autoSwitch/types';
import { VerifiableModel, verifyModel } from './autoSwitch/verifier';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cryptoStore = require('./cryptoStore');

const SAFE_UPLOAD_CONVERSATION_ID_RE = /^[a-zA-Z0-9_-]+$/;

function isMainFramePromptCaller(event: any): boolean {
  const s = event?.sender;
  return Boolean(
    s &&
      !s.isDestroyed?.() &&
      !event?.senderFrame?.parent &&
      (!event?.senderFrame || !s.mainFrame || event.senderFrame === s.mainFrame)
  );
}

const onHumanPromptSync = (event: any, rawJson: any) => {
  guestPromptController.handleSyncPrompt(event, rawJson);
};

const onHumanPromptSubscriberState = (event: any, subscribed: any) => {
  if (isMainFramePromptCaller(event)) {
    guestPromptController.setHostSubscribed(event.sender, Boolean(subscribed));
  }
};

deviceChooserController.setHostResolver((webContentsId: any) =>
  wcvBrowserRegistry.resolveDeviceChooserHost(webContentsId)
);

function onDeviceChooserSubscriberState(event: any, subscribed: any): void {
  if (isAuthorizedHubMainFrameEvent(event)) {
    deviceChooserController.setHostSubscribed(event.sender, Boolean(subscribed));
  }
}

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
  onSelect: (id: string) => void
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

// ─── Custom Models Data Structures & Helpers ───────────────────────────────

interface CustomModelFileEntry {
  name: string;
  displayName?: string;
  description?: string;
  provider: string;
  apiKey?: string;
  apiUrl: string;
  externalModelName: string;
  allowUnauthorized?: boolean;
  encrypted?: boolean;
  keyValid?: boolean;
}

interface TestModelParams {
  name?: string;
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

interface VerifyModelResult {
  ok: boolean;
  route?: AutoSwitchRoute;
  messages: string[];
}

interface ReverifyResult {
  checked: number;
  failed: string[];
}

async function findStoredModel(modelName: string): Promise<CustomModelFileEntry | undefined> {
  const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
  const filePath = path.join(geminiDir, 'custom_models.json');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
    const cleanTarget = modelName.replace(/^models\//, '').trim();
    return parsed.models?.find((m) => {
      const mClean = (m.name || '').replace(/^models\//, '').trim();
      return mClean === cleanTarget || m.name === modelName;
    });
  } catch {
    return undefined;
  }
}

async function decryptStoredKey(model: CustomModelFileEntry): Promise<string> {
  let key = model.apiKey || '';
  if (!key || key === 'none') return '';
  if (model.encrypted) {
    try {
      key = cryptoStore.decryptString(key);
    } catch (err) {
      log.warn('[Auto Switch] Could not decrypt stored key for', model.name, err);
      return '';
    }
  }
  return key;
}

async function upsertRoute(route: AutoSwitchRoute): Promise<void> {
  const filePath = getAutoSwitchConfigPath(app.getPath('home'));
  const policy = loadAutoSwitchPolicy(filePath);
  const idx = policy.routes.findIndex((r) => r.id === route.id);
  if (idx >= 0) {
    policy.routes[idx] = route;
  } else {
    policy.routes.push(route);
  }
  saveAutoSwitchPolicy(filePath, policy);
}

export async function reverifyStaleRoutes(maxAgeMs = 7 * 24 * 3600 * 1000): Promise<ReverifyResult> {
  const filePath = getAutoSwitchConfigPath(app.getPath('home'));
  const policy = loadAutoSwitchPolicy(filePath);
  const now = Date.now();
  let checked = 0;
  const failed: string[] = [];

  for (const route of policy.routes) {
    if (!route.enabled) continue;
    const verifiedAt = route.verified?.verifiedAt ?? 0;
    if (now - verifiedAt < maxAgeMs) continue;

    const model = await findStoredModel(route.id);
    if (!model) {
      route.enabled = false;
      failed.push(route.id);
      continue;
    }

    const apiKey = await decryptStoredKey(model);
    checked++;
    const res = await verifyModel(
      {
        name: model.name,
        displayName: model.displayName,
        provider: model.provider,
        apiKey,
        apiUrl: model.apiUrl,
        externalModelName: model.externalModelName,
        allowUnauthorized: model.allowUnauthorized,
      },
      apiKey
    );

    if (!res.ok) {
      route.enabled = false;
      failed.push(route.id);
      log.warn('[Auto Switch] Route failed re-verification and was disabled:', route.id);
    } else {
      route.verified = res.route.verified;
    }
  }

  if (checked > 0) {
    saveAutoSwitchPolicy(filePath, policy);
  }
  return { checked, failed };
}

export function scheduleAutoSwitchReverification(): void {
  setTimeout(() => {
    reverifyStaleRoutes().catch((err) => {
      log.warn('[Auto Switch] Background reverification failed:', err);
    });
  }, 10_000);
}

// ─── Main IPC Registration ──────────────────────────────────────────────────

export function registerIpcHandlers(storageManager: StorageManager): void {
  setHubZoomStorageManager(storageManager);

  const getTargetHubWindow = () => {
    return getFocusedHubWindow() ?? getHubWindows()[0];
  };

  // Dialog
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
      void dialog.showMessageBox(null, {
        type: 'warning',
        message: 'Folder is on the Windows filesystem',
        detail: t.warning,
      });
    }
    return t.path;
  }

  ipcMain.handle('dialog:open-workspace', async () => {
    const result = await dialog.showOpenDialog(null, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Open workspace',
      defaultPath: await dialogDefaultPath(),
    });
    if (result.canceled || result.filePaths.length === 0) {
      return undefined;
    }
    return mapPickedPath(result.filePaths[0]);
  });

  ipcMain.handle('dialog:get-default-download-dir', (event: any) => {
    assertTopLevelSenderId(event, 'dialog:get-default-download-dir');
    try {
      return app.getPath('downloads');
    } catch {
      return undefined;
    }
  });

  ipcMain.handle('dialog:open-workspaces', async () => {
    const result = await dialog.showOpenDialog(null, {
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
    broadcastState({ type: UpdateState.Ready });
  });
  ipcMain.handle('updater:quit-and-install', () => {
    if (!app.isPackaged) {
      console.log('[AutoUpdater] Skipping quitAndInstall (requires a packaged app).');
      return;
    }
    autoUpdater.quitAndInstall();
  });
  ipcMain.handle('updater:get-state', () => {
    return getLastState();
  });

  // Notifications
  ipcMain.handle('notification:send', (_: any, options: any) => {
    const notification = new Notification({
      title: options.title,
      body: options.body,
      silent: options.silent ?? false,
    });
    notification.on('click', () => {
      const win = getHubWindows()[0];
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
  });

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
          return;
        } catch {
          // Try next
        }
      }
    }
  });

  const readOsMicAccessStatus = () => {
    try {
      return systemPreferences.getMediaAccessStatus('microphone');
    } catch {
      return 'unknown';
    }
  };

  ipcMain.handle('mic:get-access-status', (event: any) => {
    if (!isAuthorizedHubMainFrameEvent(event)) {
      return 'unknown';
    }
    if (process.platform === 'darwin' || process.platform === 'win32') {
      return readOsMicAccessStatus();
    }
    return 'unknown';
  });

  let pendingMicAccessRequest: Promise<string> | null = null;
  ipcMain.handle('mic:request-access', async (event: any) => {
    if (!isAuthorizedHubMainFrameEvent(event)) {
      return 'unknown';
    }
    if (process.platform === 'darwin') {
      const status = readOsMicAccessStatus();
      if (status !== 'not-determined') {
        return status;
      }
      if (!pendingMicAccessRequest) {
        pendingMicAccessRequest = (async () => {
          try {
            const granted = await systemPreferences.askForMediaAccess('microphone');
            if (granted) {
              return 'granted';
            }
            const after = readOsMicAccessStatus();
            return after === 'not-determined' ? 'denied' : after;
          } catch {
            return 'unknown';
          } finally {
            pendingMicAccessRequest = null;
          }
        })();
      }
      return pendingMicAccessRequest;
    }
    if (process.platform === 'win32') {
      return readOsMicAccessStatus();
    }
    return 'unknown';
  });

  ipcMain.handle('mic:open-system-preferences', async (event: any) => {
    if (!isAuthorizedHubMainFrameEvent(event)) {
      return;
    }
    if (process.platform === 'darwin') {
      await openExternalSafely(
        'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone',
        'confirmed'
      );
    } else if (process.platform === 'win32') {
      await openExternalSafely('ms-settings:privacy-microphone', 'confirmed');
    }
  });

  // Storage
  ipcMain.removeAllListeners?.('storage:get-items-sync');
  ipcMain.on('storage:get-items-sync', (event: any) => {
    const s = event?.sender;
    const trusted =
      Boolean(s) &&
      !s.isDestroyed?.() &&
      s.getType?.() !== 'webview' &&
      isAuthorizedHubMainFrameEvent(event);
    if (!trusted) {
      event.returnValue = {};
      return;
    }
    try {
      const storagePath = (storageManager as any).storagePath;
      if (storagePath && fsSync.existsSync(storagePath)) {
        event.returnValue = JSON.parse(fsSync.readFileSync(storagePath, 'utf-8'));
        return;
      }
    } catch {
      // Fall through to empty object
    }
    event.returnValue = {};
  });

  ipcMain.handle('storage:get-items', async () => {
    return storageManager.getItems();
  });
  ipcMain.handle('storage:update-items', async (_event: any, changes: Record<string, string | null>) => {
    await storageManager.updateItems(changes);
  });

  // ─── Custom Models Handlers ───────────────────────────────────────────────

  ipcMain.handle('storage:get-custom-models', async () => {
    const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
    const filePath = path.join(geminiDir, 'custom_models.json');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
      const models = parsed.models || [];

      return models.map((m) => {
        let maskedKey: string = m.apiKey || '';
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
    async (_event: any, newModel: CustomModelFileEntry & { apiKey?: string; originalModelName?: string }) => {
      const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
      const filePath = path.join(geminiDir, 'custom_models.json');
      try {
        let models: CustomModelFileEntry[] = [];
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
          models = parsed.models || [];
        } catch {
          // File does not exist yet
        }

        const rawId = (newModel.externalModelName || newModel.name || '').trim();
        const cleanId = rawId.replace(/^models\//, '').trim();
        newModel.name = 'models/' + cleanId;
        newModel.externalModelName = cleanId;

        if (!newModel.displayName || !newModel.displayName.trim()) {
          newModel.displayName = cleanId;
        }

        const originalIdx =
          newModel.originalModelName && newModel.originalModelName !== newModel.name
            ? models.findIndex(
                (m) =>
                  m.name === newModel.originalModelName ||
                  m.name === 'models/' + newModel.originalModelName!.replace(/^models\//, '')
              )
            : -1;

        const existingIdx = models.findIndex((m) => m.name === newModel.name);
        const targetOld = originalIdx !== -1 ? models[originalIdx] : existingIdx !== -1 ? models[existingIdx] : undefined;

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

        if (originalIdx !== -1) {
          models.splice(originalIdx, 1);
        }
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
      } catch (err: any) {
        console.error('[IPC] Failed to save custom model:', err);
        return { success: false, error: err.message };
      }
    }
  );

  ipcMain.handle('storage:delete-custom-model', async (_event: any, modelName: string) => {
    const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
    const filePath = path.join(geminiDir, 'custom_models.json');
    try {
      let models: CustomModelFileEntry[] = [];
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
        models = parsed.models || [];
      } catch {
        // Ignore if file missing
      }

      const cleanTarget = modelName.replace(/^models\//, '').trim();
      models = models.filter((m) => {
        const mClean = (m.name || '').replace(/^models\//, '').trim();
        return mClean !== cleanTarget && m.name !== modelName;
      });

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify({ models }, null, 2), 'utf-8');
      return { success: true };
    } catch (err: any) {
      console.error('[IPC] Failed to delete custom model:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('storage:update-provider-keys', async (_event: any, provider: string, newApiKey: string) => {
    const geminiDir = path.join(app.getPath('home'), '.gemini', 'antigravity');
    const filePath = path.join(geminiDir, 'custom_models.json');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
      const models = parsed.models || [];
      const encryptedKey = cryptoStore.encryptString(newApiKey.trim());
      let updatedCount = 0;
      for (const m of models) {
        if (
          m.provider === provider ||
          (provider === 'openrouter' && (m.apiUrl?.includes('openrouter') || m.provider === 'openrouter'))
        ) {
          m.apiKey = encryptedKey;
          m.encrypted = true;
          updatedCount++;
        }
      }
      await fs.writeFile(filePath, JSON.stringify({ models }, null, 2), 'utf-8');
      return { success: true, updatedCount };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('autoSwitch:get-policy', async () => {
    return loadAutoSwitchPolicy(getAutoSwitchConfigPath(app.getPath('home')));
  });
  ipcMain.handle('autoSwitch:save-policy', async (_event: any, policy: AutoSwitchPolicy) => {
    return saveAutoSwitchPolicy(getAutoSwitchConfigPath(app.getPath('home')), policy);
  });
  ipcMain.handle('autoSwitch:set-enabled', async (_event: any, enabled: boolean) => {
    const filePath = getAutoSwitchConfigPath(app.getPath('home'));
    const policy = loadAutoSwitchPolicy(filePath);
    policy.enabled = enabled === true;
    return saveAutoSwitchPolicy(filePath, policy);
  });

  ipcMain.handle('autoSwitch:verify-model', async (_event: any, modelName: string): Promise<VerifyModelResult> => {
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
      const route: AutoSwitchRoute = { ...result.route, enabled: result.ok };
      if (result.ok) await upsertRoute(route);
      return { ok: result.ok, route, messages: result.messages };
    } catch (err: any) {
      log.error('[Auto Switch] Verification handler failed:', err);
      return { ok: false, messages: ['Verification could not be completed. Check model details and retry.'] };
    }
  });

  ipcMain.handle('autoSwitch:reverify-stale', async (): Promise<ReverifyResult> => reverifyStaleRoutes());

  ipcMain.handle('storage:test-model-connection', async (_event: any, model: TestModelParams) => {
    const https = require('https');
    const http = require('http');

    return new Promise<ConnectionTestResult>((resolve) => {
      try {
        let urlStr = model.apiUrl;
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

        const options: any = {
          method: 'HEAD',
          hostname: url.hostname,
          port: parseInt(url.port || (url.protocol === 'https:' ? '443' : '80'), 10),
          path: url.pathname + url.search,
          timeout: 10000,
          rejectUnauthorized: !model.allowUnauthorized,
        };

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
            const content = fsSync.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(content) as { models?: CustomModelFileEntry[] };
            const found = parsed.models?.find((m) => m.name === (model as { name?: string }).name);
            if (found?.apiKey && found.apiKey !== 'none') {
              key = cryptoStore.decryptString(found.apiKey) || found.apiKey;
            }
          } catch {}
        } else if (key && key !== 'none') {
          try {
            key = cryptoStore.decryptString(key);
          } catch {}
        }

        if (key && key !== 'none' && !key.includes('...')) {
          if (model.provider === 'anthropic') {
            options.headers = {
              'x-api-key': key,
              'anthropic-version': '2023-06-01',
            };
            const wsId =
              (model as any).workspaceId ||
              (model as any).anthropicWorkspaceId ||
              process.env.ANTHROPIC_WORKSPACE_ID;
            if (wsId) {
              options.headers['anthropic-workspace-id'] = wsId;
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

        const req = client.request(options, (res: any) => {
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
          res.resume();
        });

        req.on('error', (err: any) => {
          resolve({
            success: false,
            error: err.message || 'Connection failed',
          });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({
            success: false,
            error: 'Connection timed out after 10s',
          });
        });

        req.end();
      } catch (err: any) {
        resolve({
          success: false,
          error: err.message || 'Invalid URL or configuration',
        });
      }
    });
  });

  // ─── Other Official Handlers ───────────────────────────────────────────────

  ipcMain.handle('logs:electron', async () => {
    try {
      const logFile = log.transports.file.getFile();
      return await fs.readFile(logFile.path, 'utf-8');
    } catch {
      return '';
    }
  });

  ipcMain.handle('extensions:send-authorities', async (_event: any, authorities: Record<string, string>) => {
    for (const [authority, host] of Object.entries(authorities)) {
      extensionAuthorities.set(authority, host);
    }
  });

  ipcMain.handle('agent:update-active-count', async (_event: any, count: number) => {
    updateTrayAgentCount(count);
  });

  ipcMain.handle('window:set-title-bar-overlay', async (_event: any, options: { color: string; symbolColor: string }) => {
    const win = getTargetHubWindow();
    win?.setTitleBarOverlay?.(options);
  });

  ipcMain.handle('window:minimize', async () => {
    const win = getTargetHubWindow();
    win?.minimize?.();
  });

  ipcMain.handle('window:maximize', async () => {
    const win = getTargetHubWindow();
    win?.maximize?.();
  });

  ipcMain.handle('window:unmaximize', async () => {
    const win = getTargetHubWindow();
    win?.unmaximize?.();
  });

  ipcMain.handle('window:is-maximized', async () => {
    const win = getTargetHubWindow();
    return win?.isMaximized?.() ?? false;
  });

  ipcMain.handle('window:close', async () => {
    const win = getTargetHubWindow();
    win?.close?.();
  });

  ipcMain.handle('window:toggle-devtools', async (event: any) => {
    const sender = event?.sender;
    if (sender && !sender.isDestroyed?.()) {
      sender.toggleDevTools?.();
    }
  });

  ipcMain.on?.(WEBVIEW_DEVICE_CHOOSER_SUBSCRIBER_STATE_CHANNEL, onDeviceChooserSubscriberState);
  ipcMain.handle(WEBVIEW_DEVICE_CHOOSER_RESPONSE_CHANNEL, async (event: any, requestId: any, resolution: any) => {
    if (!isAuthorizedHubMainFrameEvent(event)) {
      throw new Error(`${WEBVIEW_DEVICE_CHOOSER_RESPONSE_CHANNEL} must be called from the main frame`);
    }
    return deviceChooserController.handleResponse(event.sender.id, requestId, resolution);
  });

  let activeContextMenu: Menu | null = null;
  ipcMain.handle('window:show-context-menu', async (_event: any, items: ContextMenuItemParam[]) => {
    activeContextMenu?.closePopup?.();
    activeContextMenu = null;

    return new Promise((resolve) => {
      let selectedId: string | null = null;
      const menu = Menu.buildFromTemplate(
        buildContextMenuTemplate(items, (id) => {
          selectedId = id;
        })
      );
      activeContextMenu = menu;
      const win = getTargetHubWindow();
      menu.popup({
        window: win,
        callback: () => {
          activeContextMenu = null;
          resolve(selectedId);
        },
      });
    });
  });

  ipcMain.handle('window:close-context-menu', () => {
    activeContextMenu?.closePopup?.();
    activeContextMenu = null;
  });

  ipcMain.handle('window:zoom-in', async () => {
    await applyHubWindowZoom(getTargetHubWindow(), 'in');
  });
  ipcMain.handle('window:zoom-out', async () => {
    await applyHubWindowZoom(getTargetHubWindow(), 'out');
  });
  ipcMain.handle('window:reset-zoom', async () => {
    await applyHubWindowZoom(getTargetHubWindow(), 'reset');
  });

  ipcMain.handle('updater:check-for-updates', () => {
    checkForUpdates(true);
  });

  ipcMain.handle('shell:open-external', async (_event: any, url: string) => {
    await openExternalSafely(url, 'confirmed');
  });

  ipcMain.handle('shell:reveal-in-file-picker', (_event: any, filePath: string) => {
    const distro = getActiveWslDistro();
    if (distro) {
      const posixPath = fileURLToPath(filePath, { windows: false } as any);
      shell.showItemInFolder(distroToWindowsPath(posixPath, distro));
      return;
    }
    shell.showItemInFolder(fileURLToPath(filePath));
  });

  const assertTopLevelSenderId = (event: any, channel: string) => {
    if (event?.senderFrame?.parent) {
      throw new Error(`Unauthorized ${channel} sender: subframe cannot invoke ${channel}`);
    }
    const sender = event?.sender;
    if (!sender || sender.isDestroyed?.() || typeof sender.id !== 'number' || !Number.isInteger(sender.id)) {
      throw new Error(`Unauthorized ${channel} sender`);
    }
    return sender.id;
  };

  ipcMain.handle('webview:set-download-dir', (event: any, webContentsId: any, downloadDir: any) => {
    if (typeof webContentsId !== 'number' || !Number.isInteger(webContentsId) || webContentsId <= 0) {
      throw new Error(`Invalid webContentsId: ${String(webContentsId)}`);
    }
    if (downloadDir !== null && typeof downloadDir !== 'string') {
      throw new Error('downloadDir must be a string or null');
    }
    if (event?.senderFrame?.parent) {
      throw new Error('Unauthorized webview:set-download-dir sender: subframe cannot configure downloads');
    }
    const sender = event?.sender;
    if (!sender || sender.isDestroyed?.()) {
      throw new Error(`WebContents ${webContentsId} is not owned by the calling renderer`);
    }
    const wc = webContents.fromId(webContentsId);
    if (!isOwnedBrowserGuestWebContents(wc, sender.id)) {
      throw new Error(`WebContents ${webContentsId} is not owned by the calling renderer`);
    }
    return setGuestDownloadDirectory(wc, downloadDir);
  });

  ipcMain.handle('webview:set-agent-controlled', (event: any, webContentsId: any, active: any) => {
    if (typeof webContentsId !== 'number' || !Number.isInteger(webContentsId) || webContentsId <= 0 || typeof active !== 'boolean') {
      return false;
    }
    if (event?.senderFrame?.parent) {
      return false;
    }
    const sender = event?.sender;
    if (!sender || sender.isDestroyed?.()) {
      return false;
    }
    const wc = webContents.fromId(webContentsId);
    if (!wc || !isOwnedBrowserGuestWebContents(wc, sender.id)) {
      return false;
    }
    return setGuestAgentControlled(wc, active);
  });

  ipcMain.handle('webview:open-download', async (event: any, downloadId: any) => {
    const senderId = assertTopLevelSenderId(event, 'webview:open-download');
    if (typeof downloadId !== 'string') {
      throw new Error('downloadId must be a string');
    }
    return openTrackedWebviewDownload(senderId, downloadId);
  });

  ipcMain.handle('webview:show-download-in-folder', (event: any, downloadId: any) => {
    const senderId = assertTopLevelSenderId(event, 'webview:show-download-in-folder');
    if (typeof downloadId !== 'string') {
      throw new Error('downloadId must be a string');
    }
    return showTrackedWebviewDownloadInFolder(senderId, downloadId);
  });

  ipcMain.handle('webview:cancel-download', (event: any, downloadId: any) => {
    const senderId = assertTopLevelSenderId(event, 'webview:cancel-download');
    if (typeof downloadId !== 'string') {
      throw new Error('downloadId must be a string');
    }
    return cancelTrackedWebviewDownload(senderId, downloadId);
  });

  ipcMain.handle('webview:resolve-download', (event: any, downloadId: any, approve: any) => {
    let senderId: number;
    try {
      senderId = assertTopLevelSenderId(event, 'webview:resolve-download');
    } catch {
      return false;
    }
    if (typeof downloadId !== 'string' || typeof approve !== 'boolean') {
      return false;
    }
    return resolveTrackedWebviewDownload(senderId, downloadId, approve);
  });

  ipcMain.handle('dialog:select-download-dir', async (event: any, defaultPath: any) => {
    assertTopLevelSenderId(event, 'dialog:select-download-dir');
    let resolvedDefaultPath: string | undefined;
    if (typeof defaultPath === 'string' && defaultPath.trim().length > 0 && !defaultPath.includes('\0')) {
      resolvedDefaultPath = defaultPath.trim();
    } else {
      try {
        resolvedDefaultPath = app.getPath('downloads');
      } catch {
        resolvedDefaultPath = undefined;
      }
    }
    const options: Electron.OpenDialogOptions = {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Download Folder',
      defaultPath: resolvedDefaultPath,
    };
    const owner = BrowserWindow.fromWebContents(event.sender);
    const result = owner
      ? await dialog.showOpenDialog(owner, options)
      : await dialog.showOpenDialog(null as any, options);
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    const picked = result.filePaths[0];
    if (typeof picked !== 'string' || picked.includes('\0') || !path.isAbsolute(picked)) {
      return null;
    }
    try {
      return (await fs.stat(picked)).isDirectory() ? picked : null;
    } catch {
      return null;
    }
  });

  ipcMain.handle('ide:is-installed', async () => {
    try {
      await fs.stat(getIdeInstallPath());
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('webview:get-memory-usage', async (event: any, webContentsIds: any) => {
    const sender = event?.sender;
    if (
      !sender ||
      sender.isDestroyed() ||
      event?.senderFrame?.parent ||
      (event?.senderFrame && sender.mainFrame && event.senderFrame !== sender.mainFrame) ||
      !Array.isArray(webContentsIds) ||
      webContentsIds.length === 0
    ) {
      return {};
    }
    const MAX_QUERIED_GUESTS = 64;
    const seenIds = new Set<number>();
    const ownedGuests: Array<{ webContentsId: number; pid?: number }> = [];
    for (const rawId of webContentsIds) {
      if (seenIds.size >= MAX_QUERIED_GUESTS) {
        break;
      }
      if (typeof rawId !== 'number' || !Number.isInteger(rawId) || rawId <= 0 || seenIds.has(rawId)) {
        continue;
      }
      seenIds.add(rawId);
      const wc = webContents.fromId(rawId);
      const isWcv = wcvBrowserRegistry.isRegisteredWcv(rawId);
      if (!wc || wc.isDestroyed() || (wc.getType?.() !== 'webview' && !isWcv)) {
        continue;
      }
      const isOwned = isWcv
        ? wcvBrowserRegistry.isOwnedBySender(rawId, sender.id)
        : Boolean(sender.id !== undefined && wc.hostWebContents?.id === sender.id);
      if (!isOwned) {
        continue;
      }
      let pid: number | undefined;
      try {
        pid = wc.getOSProcessId?.();
      } catch {
        pid = undefined;
      }
      ownedGuests.push({ webContentsId: rawId, pid });
    }
    if (ownedGuests.length === 0) {
      return {};
    }
    const bytesByWcId = wcvBrowserRegistry.computeGuestMemoryBytes(ownedGuests);
    const out: Record<number, number> = {};
    for (const [id, bytes] of bytesByWcId.entries()) {
      out[id] = bytes;
    }
    return out;
  });

  ipcMain.handle('wsl:get-state', async () => {
    if (!isWslAvailable()) {
      return { available: false, activeDistro: null, distros: [] };
    }
    try {
      const distros = await listWslDistros();
      return {
        available: true,
        activeDistro: getActiveWslDistro() ?? null,
        distros: distros.map((d) => ({ name: d.name, isDefault: d.isDefault })),
      };
    } catch (err) {
      log.error('wsl:get-state failed:', err);
      return { available: false, activeDistro: null, distros: [] };
    }
  });

  ipcMain.handle('wsl:connect', (_event: any, distro: string) => {
    relaunchWithWslDistro(distro || '');
  });

  const MIN_ISOLATED_WORLD_ID = 1000;
  const MAX_ISOLATED_WORLD_ID = 100000;
  ipcMain.handle('webview:execute-js-isolated-world', async (event: any, webContentsId: any, worldId: any, code: any) => {
    if (typeof webContentsId !== 'number' || !Number.isInteger(webContentsId) || webContentsId <= 0) {
      throw new Error(`Invalid webContentsId: ${String(webContentsId)}`);
    }
    if (
      typeof worldId !== 'number' ||
      !Number.isInteger(worldId) ||
      worldId < MIN_ISOLATED_WORLD_ID ||
      worldId > MAX_ISOLATED_WORLD_ID
    ) {
      throw new Error(`Invalid isolated worldId: ${String(worldId)}`);
    }
    if (typeof code !== 'string') {
      throw new Error('code must be a string');
    }
    const wc = webContents.fromId(webContentsId);
    const isWcv = wcvBrowserRegistry.isRegisteredWcv(webContentsId);
    if (!wc || wc.isDestroyed() || (wc.getType?.() !== 'webview' && !isWcv)) {
      throw new Error(`Invalid or non-webview webContents id: ${webContentsId}`);
    }
    const sender = event?.sender;
    const isOwned = isWcv
      ? wcvBrowserRegistry.isOwnedBySender(webContentsId, sender?.id)
      : wc.hostWebContents?.id === sender?.id;
    if (!sender || sender.isDestroyed() || !isOwned) {
      throw new Error(`WebContents ${webContentsId} is not owned by the calling renderer`);
    }
    if (!event?.senderFrame || event.senderFrame !== sender.mainFrame || event.senderFrame.parent) {
      throw new Error('webview:execute-js-isolated-world must be called from the main frame');
    }
    return executeJavaScriptInIsolatedWorldWhenReady(wc, worldId, [{ code }], false);
  });

  const resolveOwnedGuestWebContents = (event: any, webContentsId: any) => {
    if (typeof webContentsId !== 'number' || !Number.isInteger(webContentsId) || webContentsId <= 0) {
      throw new Error(`Invalid webContentsId: ${String(webContentsId)}`);
    }
    const wc = webContents.fromId(webContentsId);
    const isWcv = wcvBrowserRegistry.isRegisteredWcv(webContentsId);
    if (!wc || wc.isDestroyed() || (wc.getType?.() !== 'webview' && !isWcv)) {
      throw new Error(`Invalid or non-webview webContents id: ${webContentsId}`);
    }
    const sender = event?.sender;
    const isOwned = isWcv
      ? wcvBrowserRegistry.isOwnedBySender(webContentsId, sender?.id)
      : wc.hostWebContents?.id === sender?.id;
    if (!sender || sender.isDestroyed() || !isOwned) {
      throw new Error(`WebContents ${webContentsId} is not owned by the calling renderer`);
    }
    return { wc, sender };
  };

  ipcMain.handle('webview:get-network-requests', (event: any, webContentsId: any) => {
    const { wc, sender } = resolveOwnedGuestWebContents(event, webContentsId);
    if (!event?.senderFrame || (sender.mainFrame && event.senderFrame !== sender.mainFrame) || event.senderFrame.parent) {
      throw new Error('webview:get-network-requests must be called from the main frame');
    }
    return guestNetworkController.getRequests(wc.id);
  });

  ipcMain.handle('webview:clear-network-requests', (event: any, webContentsId: any) => {
    const { wc, sender } = resolveOwnedGuestWebContents(event, webContentsId);
    if (!event?.senderFrame || (sender.mainFrame && event.senderFrame !== sender.mainFrame) || event.senderFrame.parent) {
      throw new Error('webview:clear-network-requests must be called from the main frame');
    }
    return guestNetworkController.clearRequests(wc.id);
  });

  const guestOf = (e: any, id: any) => {
    const { wc, sender } = resolveOwnedGuestWebContents(e, id);
    const f = e?.senderFrame;
    if (!f || f.parent || (sender.mainFrame && f !== sender.mainFrame)) {
      throw new Error('WebMCP IPC must be called from the main frame');
    }
    return { wc, sender };
  };

  ipcMain.handle('webview:webmcp-set-enabled', (event: any, enabled: any) => {
    if (!isAuthorizedHubMainFrameEvent(event) || typeof enabled !== 'boolean') {
      throw new Error('Invalid webview:webmcp-set-enabled call');
    }
    guestWebMcpController.setEnabled(enabled);
    return guestWebMcpController.isEnabled();
  });

  ipcMain.handle('webview:webmcp-list-tools', (event: any, webContentsId: any, origin: any) =>
    guestWebMcpController.listTools(guestOf(event, webContentsId).wc, origin)
  );
  ipcMain.handle('webview:webmcp-call-tool', (event: any, webContentsId: any, origin: any, params: any) => {
    const { wc, sender } = guestOf(event, webContentsId);
    return guestWebMcpController.callTool(wc, sender, origin, params);
  });
  ipcMain.handle('webview:webmcp-cancel-tool-call', (event: any, webContentsId: any, callId: any) =>
    guestWebMcpController.cancelToolCall(webContentsId, callId, guestOf(event, webContentsId).sender.id)
  );

  ipcMain.handle('webview:set-dialog-policy', async (event: any, webContentsId: any, policy: any) => {
    const { wc, sender } = resolveOwnedGuestWebContents(event, webContentsId);
    const safePolicy: any = {
      enabled: Boolean(policy?.enabled),
    };
    if (policy?.action === 'accept' || policy?.action === 'dismiss' || policy?.action === 'manual') {
      safePolicy.action = policy.action;
    }
    if (typeof policy?.promptText === 'string') {
      safePolicy.promptText = policy.promptText;
    }
    if (typeof policy?.tabKey === 'string') {
      safePolicy.tabKey = policy.tabKey;
    }
    if (policy?.fallbackAction === 'accept' || policy?.fallbackAction === 'dismiss') {
      safePolicy.fallbackAction = policy.fallbackAction;
    }
    if (typeof policy?.fallbackPromptText === 'string') {
      safePolicy.fallbackPromptText = policy.fallbackPromptText;
    }
    return guestDialogController.setPolicy(wc, sender, safePolicy);
  });

  ipcMain.handle('webview:handle-javascript-dialog', async (event: any, webContentsId: any, decision: any) => {
    const { wc } = resolveOwnedGuestWebContents(event, webContentsId);
    return guestDialogController.handleDialog(wc, {
      ...(typeof decision?.dialogId === 'string' ? { dialogId: decision.dialogId } : {}),
      accept: Boolean(decision?.accept),
      ...(typeof decision?.promptText === 'string' ? { promptText: decision.promptText } : {}),
    });
  });

  ipcMain.removeListener?.(HUMAN_PROMPT_SYNC_CHANNEL, onHumanPromptSync);
  ipcMain.on?.(HUMAN_PROMPT_SYNC_CHANNEL, onHumanPromptSync);
  ipcMain.removeListener?.(WEBVIEW_PROMPT_SUBSCRIBER_STATE_CHANNEL, onHumanPromptSubscriberState);
  ipcMain.on?.(WEBVIEW_PROMPT_SUBSCRIBER_STATE_CHANNEL, onHumanPromptSubscriberState);
  ipcMain.handle(WEBVIEW_PROMPT_RESPONSE_CHANNEL, (event: any, promptId: any, value: any) => {
    if (!isMainFramePromptCaller(event)) {
      throw new Error('webview:prompt-response must be called from the main frame');
    }
    return guestPromptController.respondPrompt(event.sender.id, promptId, typeof value === 'string' ? value : null);
  });

  const assertMainFrameSender = (event: any, channel: string) => {
    const sender = event?.sender;
    if (
      !sender ||
      sender.isDestroyed() ||
      !event?.senderFrame ||
      event.senderFrame !== sender.mainFrame ||
      event.senderFrame.parent
    ) {
      throw new Error(`${channel} must be called from the main frame`);
    }
  };

  const pinUploadsRoot = (conversationId: any) => {
    if (typeof conversationId !== 'string' || !SAFE_UPLOAD_CONVERSATION_ID_RE.test(conversationId) || /^\.+$/.test(conversationId)) {
      return '';
    }
    let appDataDir = getAppDataDir();
    try {
      appDataDir = fsSync.realpathSync(appDataDir);
    } catch {}
    return path.join(appDataDir, 'brain', conversationId, 'browser_sandbox', 'uploads');
  };

  const resolveMainFrameOwnedGuest = (event: any, webContentsId: any, channel: string) => {
    const { wc, sender } = resolveOwnedGuestWebContents(event, webContentsId);
    assertMainFrameSender(event, channel);
    return { wc, sender };
  };

  ipcMain.handle('webview:set-file-chooser-policy', async (event: any, webContentsId: any, policy: any) => {
    const { wc, sender } = resolveMainFrameOwnedGuest(event, webContentsId, 'webview:set-file-chooser-policy');
    return guestFileChooserController.setPolicy(wc, sender, {
      enabled: Boolean(policy?.enabled),
      ...(typeof policy?.tabKey === 'string' ? { tabKey: policy.tabKey } : {}),
    });
  });

  ipcMain.handle('webview:handle-file-chooser', async (event: any, webContentsId: any, decision: any) => {
    const { wc } = resolveMainFrameOwnedGuest(event, webContentsId, 'webview:handle-file-chooser');
    const pinned = { ...(decision ?? { chooserId: '' }) };
    if (Array.isArray(pinned.files) && pinned.files.length > 0) {
      pinned.allowedUploadsDir = pinUploadsRoot(pinned.expectedConversationId);
    }
    return guestFileChooserController.handleFileChooser(wc, pinned);
  });

  ipcMain.handle('webview:set-input-files', async (event: any, webContentsId: any, request: any) => {
    const { wc } = resolveMainFrameOwnedGuest(event, webContentsId, 'webview:set-input-files');
    return guestFileChooserController.setInputFiles(wc, {
      ...request,
      allowedUploadsDir: pinUploadsRoot(request?.expectedConversationId),
    });
  });

  ipcMain.handle('webview:resolve-upload-files', (event: any, req: any) => {
    assertMainFrameSender(event, 'webview:resolve-upload-files');
    return resolveGuestUploadFiles(req && {
      ...req,
      uploadsRoot: pinUploadsRoot(req.expectedConversationId),
    });
  });

  const assertMainFrameGuestCaller = (event: any, webContentsId: any, channel: string) =>
    resolveMainFrameOwnedGuest(event, webContentsId, channel).wc;

  ipcMain.handle('webview:list-frames', async (event: any, wcId: any) =>
    guestFrameBridge.listFrames(assertMainFrameGuestCaller(event, wcId, 'webview:list-frames'))
  );

  ipcMain.handle('webview:execute-js-frame-isolated-world', async (event: any, wcId: any, frameId: any, code: any, expectedOrigin: any) => {
    const channel = 'webview:execute-js-frame-isolated-world';
    const wc = assertMainFrameGuestCaller(event, wcId, channel);
    return guestFrameBridge.executeInFrameIsolatedWorld(wc, frameId, code, expectedOrigin);
  });

  ipcMain.handle('script-jail:run', async (event: any, req: any) => {
    return runScriptInJail(event?.sender, req, event?.senderFrame);
  });
  ipcMain.handle('script-jail:abort', (event: any, jailId: any) => {
    return abortScriptInJail(event?.sender, jailId, event?.senderFrame);
  });
  ipcMain.handle('script-jail:warm', async (event: any) => {
    return warmScriptJail(event?.sender, event?.senderFrame);
  });

  registerWcvIpcHandlers(undefined, undefined, storageManager);
}
