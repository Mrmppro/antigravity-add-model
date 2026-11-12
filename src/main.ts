import { app, BaseWindow, BrowserWindow, dialog, ipcMain, session, Menu } from 'electron';
import log from 'electron-log/main';
import { registerIpcHandlers, scheduleAutoSwitchReverification } from './ipcHandlers';
const { registerCableWebAuthnIpcHandlers } = require('./cablev2');
const { wcvBrowserRegistry } = require('./wcvBrowserRegistry');
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as readline from 'readline';
import {
  createWindow,
  showQuitConfirmation,
  setShowQuitConfirmation,
  showOrCreateWindow,
  getHubWindows,
  getHubWebContents,
  getFocusedHubWindow,
} from './utils';
import {
  startAndMonitorLanguageServer,
  getLsPort,
  killLanguageServer,
  getLsCL,
  LS_BINARY,
  setupLocalCertTrust,
  getLsProcess,
  prefetchShellEnv,
} from './languageServer';
import { initAutoUpdater, getHostUpdateStatus, applyHostUpdate } from './updater';
import { startHostBridgeServer, HostBridgeServerHandle } from './hostBridgeServer';
import { WINDOW_ORIGIN, DYNAMIC_PORT } from './constants';
import { createTray, insertTrayMenuItem } from './tray';
import { StorageManager } from './storage';
const { configureSessionDeviceChooser } = require('./deviceChooser');
import { getAppStoragePath, getLsLogPath, getActivePortFilePath, tightenActivePortPermissions } from './paths';
import { setupApplicationMenu, wslConnectMenuTemplate, wslReopenLocallyTemplate } from './menu';
import { registerCustomSchemes, registerCustomSchemeHandlers } from './customScheme';
import { DEFAULTS, SettingsService, SettingKey } from './services/settingsService';
import { maybeShowIdeInstallWizard } from './ideInstall';
import { createProvisionSplash, ProvisionSplashHandle } from './provisionSplash';
import * as path from 'path';
import {
  readPersistedWslDistro,
  persistWslDistro,
  listWslDistros,
  setActiveWslDistro,
  ensureServerInstalled,
  WSL_STATE_FILE,
} from './wsl';
const { configureWebviewSessionProxy, preconfigureWebviewPartitionProxies } = require('./beyondcorpPac');
const { isScriptJailSession } = require('./scriptJail');
const {
  configureSessionWebAuthn,
  configurePlatformWebAuthn,
  attachWebviewWebAuthnUserActivationTracking,
} = require('./webauthn');
const { configureSessionPromptPreload } = require('./guestPromptController');
const { configureWebviewBrowserContents } = require('./webviewBrowser');
import { flushTrackedWindowState } from './windowState';
const { closeAllBrowserSessions } = require('./browserEngine/browserEngine');

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

// ─── State ─────────────────────────────────────────────────────────────────

let storageManager: StorageManager;
let settingsService: SettingsService;
let hasStartedMainApplication = false;
let isQuitting = false;
let hostBridgeServer: HostBridgeServerHandle | undefined;

// ─── Config ────────────────────────────────────────────────────────────────

// Driven by ELECTRON_OZONE_PLATFORM_HINT=headless env var.
const HEADLESS = process.env.ELECTRON_OZONE_PLATFORM_HINT === 'headless';

// When set, skip LS startup and load this URL directly (for dev iteration).
const DEV_URL = process.env.DEV_URL;

// WSL distro to provision and launch the LS in (Windows only, '' = local).
function resolveStartupWslDistro(): string {
  if (process.platform !== 'win32') {
    return '';
  }
  if (app.commandLine.hasSwitch('wsl-distro')) {
    return app.commandLine.getSwitchValue('wsl-distro');
  }
  return (
    process.env.ANTIGRAVITY_WSL_DISTRO ||
    readPersistedWslDistro(path.join(app.getPath('userData'), WSL_STATE_FILE))
  );
}

let WSL_DISTRO = resolveStartupWslDistro();
if (!DEV_URL) {
  prefetchShellEnv();
}

/** True if `distro` is currently registered in WSL (false on wsl.exe errors). */
async function wslDistroExists(distro: string): Promise<boolean> {
  try {
    return (await listWslDistros()).some((d) => d.name === distro);
  } catch (err) {
    console.error('[WSL] Failed to list distros:', err);
    return false;
  }
}

if (HEADLESS) {
  app.commandLine.appendSwitch('ozone-platform', 'headless');
  app.commandLine.appendSwitch('headless');
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('no-sandbox');
}

if (!app.commandLine.hasSwitch('remote-debugging-port')) {
  app.commandLine.appendSwitch('remote-debugging-port', '0');
}
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
app.commandLine.appendSwitch('disable-features', 'FedCm');

const disabledFeatures = app.commandLine.getSwitchValue('disable-features');
app.commandLine.appendSwitch(
  'disable-features',
  [disabledFeatures, 'CalculateNativeWinOcclusion'].filter(Boolean).join(',')
);
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

// ─── Application Lifecycle ─────────────────────────────────────────────────

let pendingDeepLink: string | null = null;

function handleDeepLink(url: string): void {
  const wins = getHubWindows();
  if (wins.length > 0) {
    if (wins[0].isMinimized()) {
      wins[0].restore();
    }
    wins[0].show();
    wins[0].focus();
    app.focus({ steal: true });
    const hubContents = getHubWebContents(wins[0]);
    if (
      !hubContents ||
      hubContents.isDestroyed?.() ||
      hubContents.isLoadingMainFrame?.()
    ) {
      pendingDeepLink = url;
    } else {
      hubContents.send('deep-link', url);
    }
  } else {
    pendingDeepLink = url;
    if (!HEADLESS && hasStartedMainApplication) {
      createWindow(
        DEV_URL ?? `${WINDOW_ORIGIN}:${getLsPort()}/`,
        storageManager
      );
      app.focus({ steal: true });
    }
  }
}

const PROTOCOL = app
  .getName()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const protocolClientArgs =
  process.defaultApp && process.argv.length >= 2
    ? [process.execPath, [path.resolve(process.argv[1])]]
    : [];

if (!app.isDefaultProtocolClient(PROTOCOL, ...(protocolClientArgs as any))) {
  app.setAsDefaultProtocolClient(PROTOCOL, ...(protocolClientArgs as any));
}

app.on('second-instance', (_event, commandLine) => {
  if (!HEADLESS && hasStartedMainApplication) {
    showOrCreateWindow(getLsPort(), storageManager);
    app.focus({ steal: true });
  }
  const url = commandLine.find((arg) => arg.startsWith(`${PROTOCOL}://`));
  if (url) {
    handleDeepLink(url);
  }
});

registerCustomSchemes();

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

app.on('session-created', (targetSession) => {
  if (isScriptJailSession(targetSession)) {
    return;
  }
  configureSessionWebAuthn(targetSession);
  configureSessionPromptPreload(targetSession);
});

app.on('web-contents-created', (_event, contents) => {
  if (isScriptJailSession(contents.session)) {
    return;
  }
  configureSessionDeviceChooser(contents.session);
  configureSessionWebAuthn(contents.session);
  configureSessionPromptPreload(contents.session);
  if (contents.getType?.() !== 'webview') {
    return;
  }
  attachWebviewWebAuthnUserActivationTracking(contents);
  configureWebviewBrowserContents(contents);
  void configureWebviewSessionProxy(contents.session);
});

/**
 * App entry point. Runs once Electron has finished initializing.
 */
app
  .whenReady()
  .then(async () => {
    log.initialize({
      includeFutureSessions: false,
    });
    Object.assign(console, log.functions);

    tightenActivePortPermissions(app.getPath('userData'), getActivePortFilePath());

    const storagePath = getAppStoragePath();
    storageManager = new StorageManager(storagePath, DEFAULTS);
    settingsService = new SettingsService(storageManager);

    const deepLinkFromArg = process.argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
    if (deepLinkFromArg) {
      console.log('Launched with deep link:', deepLinkFromArg);
      pendingDeepLink = deepLinkFromArg;
    }

    registerIpcHandlers(storageManager);

    ipcMain.handle('deep-link:get-stored', () => {
      const link = pendingDeepLink;
      pendingDeepLink = null;
      return link;
    });

    registerCustomSchemeHandlers();

    // Re-check Auto Switch models that have gone stale.
    scheduleAutoSwitchReverification();

    app.setAboutPanelOptions({ applicationVersion: app.getVersion() });
    void getLsCL().then((cl) => {
      if (cl) {
        app.setAboutPanelOptions({
          applicationVersion: app.getVersion(),
          version: cl,
        });
      }
    });

    if (!HEADLESS) {
      await maybeShowIdeInstallWizard(storageManager);
    }

    await preconfigureWebviewPartitionProxies();

    configurePlatformWebAuthn({
      registerCableIpc: () =>
        registerCableWebAuthnIpcHandlers({
          resolveWcvTab: (id: any) => wcvBrowserRegistry.resolveDeviceChooserHost(id),
        }),
    });
    configureSessionWebAuthn(session.defaultSession);

    // Redirect GetAvailableModels to our proxy so custom models are injected.
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      if (details.url.includes('LanguageServerService/GetAvailableModels')) {
        const proxyPort = (require('./proxy').getProxyPort as () => number)();
        if (proxyPort > 0) {
          const redirectTarget = `http://127.0.0.1:${proxyPort}/GetAvailableModels?ls=${encodeURIComponent(details.url)}`;
          console.log(`[Proxy Intercept] Redirecting GetAvailableModels to proxy: ${redirectTarget}`);
          return callback({ redirectURL: redirectTarget });
        }
      }
      return callback({});
    });

    if (DEV_URL) {
      console.log('Starting in dev mode with URL:', DEV_URL);
      createWindow(DEV_URL, storageManager);
      hasStartedMainApplication = true;
      return;
    }

    if (!WSL_DISTRO && !fs.existsSync(LS_BINARY)) {
      const msg = `language_server binary not found at:\n${LS_BINARY}\n\nPlease build set a valid location.`;
      if (HEADLESS) {
        console.error('ERROR:', msg);
      } else {
        await dialog.showErrorBox('Binary not found', msg);
      }
      app.quit();
      return;
    }

    let wslOptions: { distro: string; binaryPath: string } | undefined;
    if (WSL_DISTRO && !(await wslDistroExists(WSL_DISTRO))) {
      console.warn(`[WSL] Distro "${WSL_DISTRO}" is not installed; opening locally instead.`);
      persistWslDistro(path.join(app.getPath('userData'), WSL_STATE_FILE), '');
      if (!HEADLESS) {
        void dialog.showMessageBox(null, {
          type: 'warning',
          title: 'WSL distro not found',
          message: `The WSL distro "${WSL_DISTRO}" is no longer installed.`,
          detail: 'Antigravity opened on Windows instead.',
        });
      }
      WSL_DISTRO = '';
    }

    if (WSL_DISTRO) {
      setActiveWslDistro(WSL_DISTRO);
      let splash: ProvisionSplashHandle | undefined;
      try {
        const binaryPath = await ensureServerInstalled(
          WSL_DISTRO,
          app.getVersion(),
          app.getName().toLowerCase().includes('insiders'),
          (status) => {
            if (!HEADLESS) {
              splash ??= createProvisionSplash(WSL_DISTRO);
              splash.setStatus(status);
            }
          }
        );
        wslOptions = { distro: WSL_DISTRO, binaryPath };
      } catch (err: any) {
        const msg = `Failed to install the server into WSL distro "${WSL_DISTRO}":\n${err.message}`;
        persistWslDistro(path.join(app.getPath('userData'), WSL_STATE_FILE), '');
        if (HEADLESS) {
          console.error('ERROR:', msg);
        } else {
          await dialog.showErrorBox('WSL setup failed', msg);
        }
        app.quit();
        return;
      } finally {
        splash?.close();
      }
    }

    const csrf = crypto.randomUUID();
    console.log(`Starting app (v${app.getVersion()}) with dynamic port…`);

    try {
      hostBridgeServer = await startHostBridgeServer({
        getUpdateStatus: getHostUpdateStatus,
        applyUpdate: applyHostUpdate,
      });
      console.log(`Host bridge server listening on ${hostBridgeServer.url}`);
    } catch (err: any) {
      console.error('Failed to start host bridge server:', err.message);
    }

    let handle: any;
    const targetPort = Number(process.env.JETSKI_LS_PORT) || DYNAMIC_PORT;
    try {
      handle = await startAndMonitorLanguageServer(targetPort, csrf, {
        headless: HEADLESS,
        wsl: wslOptions,
        hostBridgeUrl: hostBridgeServer?.url,
        hostBridgeToken: hostBridgeServer?.token,
        onPortChanged: (newPort) => {
          const newUrl = `${WINDOW_ORIGIN}:${newPort}/`;
          console.log(`[Auto-Restart] Port changed! Reloading all windows with URL: ${newUrl}`);
          setupLocalCertTrust();
          if (!HEADLESS) {
            const windows = getHubWindows();
            for (const win of windows) {
              void win.loadURL(newUrl);
            }
          }
        },
      });
    } catch (err: any) {
      const msg = err.message;
      if (HEADLESS) {
        console.error('Startup failed:', msg);
      } else {
        await dialog.showErrorBox('Startup failed', msg);
      }
      app.quit();
      return;
    }

    const url = `${WINDOW_ORIGIN}:${handle.port}/`;
    console.log('\n' + '='.repeat(60));
    console.log(`  Local:       ${url}`);
    console.log(`  LS Logs:     ${getLsLogPath()}`);
    console.log(`  Electron Logs: ${log.transports.file.getFile().path}`);
    console.log('='.repeat(60) + '\n');

    if (HEADLESS) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.on('line', (line) => {
        const lsProc = getLsProcess();
        if (lsProc && lsProc.stdin) {
          lsProc.stdin.write(line + '\n');
          console.log('-> Forwarded input to Language Server.');
        } else {
          console.log('Language Server process is not running.');
        }
      });
    }

    if (!HEADLESS) {
      setupApplicationMenu(url);
      createWindow(url, storageManager);

      if (app.dock) {
        const dockMenu = Menu.buildFromTemplate([
          {
            label: 'New Window',
            click: () => createWindow(url, storageManager, { cascade: true }),
          },
        ]);
        app.dock.setMenu(dockMenu);
      }

      createTray(
        [
          {
            id: 'running-agents',
            label: 'No agents running',
            enabled: false,
          },
          { type: 'separator' },
          {
            label: '⚙ Manage Custom Models (Ctrl+Alt+M)',
            click: () => {
              const wins = getHubWindows();
              if (wins.length > 0) {
                const win = wins[0];
                if (win.isMinimized()) win.restore();
                win.show();
                win.focus();
                const contents = getHubWebContents(win);
                contents?.send('open-custom-models-modal');
              }
            },
          },
          { type: 'separator' },
          {
            label: `Open ${app.getName()}`,
            click: () => showOrCreateWindow(getLsPort(), storageManager),
          },
          {
            label: 'Quit',
            click: () => {
              app.quit();
            },
          },
        ],
        () => {
          showOrCreateWindow(getLsPort(), storageManager);
          app.focus({ steal: true });
        }
      );

      void wslConnectMenuTemplate().then((wslItem) => {
        if (wslItem) {
          insertTrayMenuItem(3, wslItem);
          const reopen = wslReopenLocallyTemplate();
          if (reopen) {
            insertTrayMenuItem(4, reopen);
          }
        }
      });
    }

    initAutoUpdater(HEADLESS, settingsService);
    hasStartedMainApplication = true;
  })
  .catch((err) => {
    console.error('Application failed to start:', err);
    hasStartedMainApplication = true;
  });

app.on('window-all-closed', async () => {
  if (isQuitting) {
    return;
  }
  if (!hasStartedMainApplication) {
    return;
  }
  const runInBackground = await settingsService.getSetting(SettingKey.RUN_IN_BACKGROUND);
  if (!runInBackground) {
    app.quit();
  }
});

async function closeHostBridgeServer(): Promise<void> {
  if (!hostBridgeServer) {
    return;
  }
  try {
    await hostBridgeServer.close();
  } catch (err) {
    console.error('Failed to close host bridge server:', err);
  }
  hostBridgeServer = undefined;
}

app.on('before-quit', async (event) => {
  if (isQuitting) {
    return;
  }
  if (!showQuitConfirmation) {
    event.preventDefault();
    isQuitting = true;
    flushTrackedWindowState(getFocusedHubWindow());

    const windows = [
      ...new Set([...getHubWindows(), ...BrowserWindow.getAllWindows()]),
    ];
    for (const win of windows) {
      win.destroy();
    }

    await Promise.all([
      session.defaultSession.closeAllConnections().catch((err) => {
        console.error('Failed to close session connections:', err);
      }),
      killLanguageServer(),
      closeAllBrowserSessions().catch((err) => {
        console.error('Failed to close browser sessions:', err);
      }),
    ]);

    await closeHostBridgeServer();
    app.quit();
    return;
  }

  event.preventDefault();
  const hubWins = getHubWindows();
  const focusedWindow = getFocusedHubWindow() ?? BrowserWindow.getFocusedWindow();
  const win =
    (focusedWindow && hubWins.includes(focusedWindow) ? focusedWindow : undefined) ||
    hubWins[0];

  const options: Electron.MessageBoxOptions = {
    type: 'question',
    buttons: ['Cancel', 'Quit'],
    defaultId: 1,
    cancelId: 0,
    title: 'Confirm Quit',
    message: 'Are you sure you want to quit?',
    detail: 'There may be agents or background tasks running.',
  };
  setShowQuitConfirmation(false);
  if (win) {
    void dialog.showMessageBox(win, options).then((result) => {
      if (result.response === 1) {
        app.quit();
      }
    });
  }
});

app.on('activate', () => {
  if (!HEADLESS && getHubWindows().length === 0) {
    const url = DEV_URL ?? `${WINDOW_ORIGIN}:${getLsPort()}/`;
    createWindow(url, storageManager);
  }
});
