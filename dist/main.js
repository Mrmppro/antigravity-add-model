"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const main_1 = __importDefault(require("electron-log/main"));
const ipcHandlers_1 = require("./ipcHandlers");
const { registerCableWebAuthnIpcHandlers } = require('./cablev2');
const { wcvBrowserRegistry } = require('./wcvBrowserRegistry');
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const readline = __importStar(require("readline"));
const utils_1 = require("./utils");
const languageServer_1 = require("./languageServer");
const updater_1 = require("./updater");
const hostBridgeServer_1 = require("./hostBridgeServer");
const constants_1 = require("./constants");
const tray_1 = require("./tray");
const storage_1 = require("./storage");
const { configureSessionDeviceChooser } = require('./deviceChooser');
const paths_1 = require("./paths");
const menu_1 = require("./menu");
const customScheme_1 = require("./customScheme");
const settingsService_1 = require("./services/settingsService");
const ideInstall_1 = require("./ideInstall");
const provisionSplash_1 = require("./provisionSplash");
const path = __importStar(require("path"));
const wsl_1 = require("./wsl");
const { configureWebviewSessionProxy, preconfigureWebviewPartitionProxies } = require('./beyondcorpPac');
const { isScriptJailSession } = require('./scriptJail');
const { configureSessionWebAuthn, configurePlatformWebAuthn, attachWebviewWebAuthnUserActivationTracking, } = require('./webauthn');
const { configureSessionPromptPreload } = require('./guestPromptController');
const { configureWebviewBrowserContents } = require('./webviewBrowser');
const windowState_1 = require("./windowState");
const { closeAllBrowserSessions } = require('./browserEngine/browserEngine');
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
    process.exit(0);
}
// ─── State ─────────────────────────────────────────────────────────────────
let storageManager;
let settingsService;
let hasStartedMainApplication = false;
let isQuitting = false;
let hostBridgeServer;
// ─── Config ────────────────────────────────────────────────────────────────
// Driven by ELECTRON_OZONE_PLATFORM_HINT=headless env var.
const HEADLESS = process.env.ELECTRON_OZONE_PLATFORM_HINT === 'headless';
// When set, skip LS startup and load this URL directly (for dev iteration).
const DEV_URL = process.env.DEV_URL;
// WSL distro to provision and launch the LS in (Windows only, '' = local).
function resolveStartupWslDistro() {
    if (process.platform !== 'win32') {
        return '';
    }
    if (electron_1.app.commandLine.hasSwitch('wsl-distro')) {
        return electron_1.app.commandLine.getSwitchValue('wsl-distro');
    }
    return (process.env.ANTIGRAVITY_WSL_DISTRO ||
        (0, wsl_1.readPersistedWslDistro)(path.join(electron_1.app.getPath('userData'), wsl_1.WSL_STATE_FILE)));
}
let WSL_DISTRO = resolveStartupWslDistro();
if (!DEV_URL) {
    (0, languageServer_1.prefetchShellEnv)();
}
/** True if `distro` is currently registered in WSL (false on wsl.exe errors). */
async function wslDistroExists(distro) {
    try {
        return (await (0, wsl_1.listWslDistros)()).some((d) => d.name === distro);
    }
    catch (err) {
        console.error('[WSL] Failed to list distros:', err);
        return false;
    }
}
if (HEADLESS) {
    electron_1.app.commandLine.appendSwitch('ozone-platform', 'headless');
    electron_1.app.commandLine.appendSwitch('headless');
    electron_1.app.commandLine.appendSwitch('disable-gpu');
    electron_1.app.commandLine.appendSwitch('no-sandbox');
}
if (!electron_1.app.commandLine.hasSwitch('remote-debugging-port')) {
    electron_1.app.commandLine.appendSwitch('remote-debugging-port', '0');
}
electron_1.app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
electron_1.app.commandLine.appendSwitch('disable-features', 'FedCm');
const disabledFeatures = electron_1.app.commandLine.getSwitchValue('disable-features');
electron_1.app.commandLine.appendSwitch('disable-features', [disabledFeatures, 'CalculateNativeWinOcclusion'].filter(Boolean).join(','));
electron_1.app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
// ─── Application Lifecycle ─────────────────────────────────────────────────
let pendingDeepLink = null;
function handleDeepLink(url) {
    const wins = (0, utils_1.getHubWindows)();
    if (wins.length > 0) {
        if (wins[0].isMinimized()) {
            wins[0].restore();
        }
        wins[0].show();
        wins[0].focus();
        electron_1.app.focus({ steal: true });
        const hubContents = (0, utils_1.getHubWebContents)(wins[0]);
        if (!hubContents ||
            hubContents.isDestroyed?.() ||
            hubContents.isLoadingMainFrame?.()) {
            pendingDeepLink = url;
        }
        else {
            hubContents.send('deep-link', url);
        }
    }
    else {
        pendingDeepLink = url;
        if (!HEADLESS && hasStartedMainApplication) {
            (0, utils_1.createWindow)(DEV_URL ?? `${constants_1.WINDOW_ORIGIN}:${(0, languageServer_1.getLsPort)()}/`, storageManager);
            electron_1.app.focus({ steal: true });
        }
    }
}
const PROTOCOL = electron_1.app
    .getName()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const protocolClientArgs = process.defaultApp && process.argv.length >= 2
    ? [process.execPath, [path.resolve(process.argv[1])]]
    : [];
if (!electron_1.app.isDefaultProtocolClient(PROTOCOL, ...protocolClientArgs)) {
    electron_1.app.setAsDefaultProtocolClient(PROTOCOL, ...protocolClientArgs);
}
electron_1.app.on('second-instance', (_event, commandLine) => {
    if (!HEADLESS && hasStartedMainApplication) {
        (0, utils_1.showOrCreateWindow)((0, languageServer_1.getLsPort)(), storageManager);
        electron_1.app.focus({ steal: true });
    }
    const url = commandLine.find((arg) => arg.startsWith(`${PROTOCOL}://`));
    if (url) {
        handleDeepLink(url);
    }
});
(0, customScheme_1.registerCustomSchemes)();
electron_1.app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
});
electron_1.app.on('session-created', (targetSession) => {
    if (isScriptJailSession(targetSession)) {
        return;
    }
    configureSessionWebAuthn(targetSession);
    configureSessionPromptPreload(targetSession);
});
electron_1.app.on('web-contents-created', (_event, contents) => {
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
electron_1.app
    .whenReady()
    .then(async () => {
    main_1.default.initialize({
        includeFutureSessions: false,
    });
    Object.assign(console, main_1.default.functions);
    (0, paths_1.tightenActivePortPermissions)(electron_1.app.getPath('userData'), (0, paths_1.getActivePortFilePath)());
    const storagePath = (0, paths_1.getAppStoragePath)();
    storageManager = new storage_1.StorageManager(storagePath, settingsService_1.DEFAULTS);
    settingsService = new settingsService_1.SettingsService(storageManager);
    const deepLinkFromArg = process.argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
    if (deepLinkFromArg) {
        console.log('Launched with deep link:', deepLinkFromArg);
        pendingDeepLink = deepLinkFromArg;
    }
    (0, ipcHandlers_1.registerIpcHandlers)(storageManager);
    electron_1.ipcMain.handle('deep-link:get-stored', () => {
        const link = pendingDeepLink;
        pendingDeepLink = null;
        return link;
    });
    (0, customScheme_1.registerCustomSchemeHandlers)();
    // Re-check Auto Switch models that have gone stale.
    (0, ipcHandlers_1.scheduleAutoSwitchReverification)();
    electron_1.app.setAboutPanelOptions({ applicationVersion: electron_1.app.getVersion() });
    void (0, languageServer_1.getLsCL)().then((cl) => {
        if (cl) {
            electron_1.app.setAboutPanelOptions({
                applicationVersion: electron_1.app.getVersion(),
                version: cl,
            });
        }
    });
    if (!HEADLESS) {
        await (0, ideInstall_1.maybeShowIdeInstallWizard)(storageManager);
    }
    await preconfigureWebviewPartitionProxies();
    configurePlatformWebAuthn({
        registerCableIpc: () => registerCableWebAuthnIpcHandlers({
            resolveWcvTab: (id) => wcvBrowserRegistry.resolveDeviceChooserHost(id),
        }),
    });
    configureSessionWebAuthn(electron_1.session.defaultSession);
    // Redirect GetAvailableModels to our proxy so custom models are injected.
    electron_1.session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        if (details.url.includes('LanguageServerService/GetAvailableModels')) {
            const proxyPort = require('./proxy').getProxyPort();
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
        (0, utils_1.createWindow)(DEV_URL, storageManager);
        hasStartedMainApplication = true;
        return;
    }
    if (!WSL_DISTRO && !fs.existsSync(languageServer_1.LS_BINARY)) {
        const msg = `language_server binary not found at:\n${languageServer_1.LS_BINARY}\n\nPlease build set a valid location.`;
        if (HEADLESS) {
            console.error('ERROR:', msg);
        }
        else {
            await electron_1.dialog.showErrorBox('Binary not found', msg);
        }
        electron_1.app.quit();
        return;
    }
    let wslOptions;
    if (WSL_DISTRO && !(await wslDistroExists(WSL_DISTRO))) {
        console.warn(`[WSL] Distro "${WSL_DISTRO}" is not installed; opening locally instead.`);
        (0, wsl_1.persistWslDistro)(path.join(electron_1.app.getPath('userData'), wsl_1.WSL_STATE_FILE), '');
        if (!HEADLESS) {
            void electron_1.dialog.showMessageBox(null, {
                type: 'warning',
                title: 'WSL distro not found',
                message: `The WSL distro "${WSL_DISTRO}" is no longer installed.`,
                detail: 'Antigravity opened on Windows instead.',
            });
        }
        WSL_DISTRO = '';
    }
    if (WSL_DISTRO) {
        (0, wsl_1.setActiveWslDistro)(WSL_DISTRO);
        let splash;
        try {
            const binaryPath = await (0, wsl_1.ensureServerInstalled)(WSL_DISTRO, electron_1.app.getVersion(), electron_1.app.getName().toLowerCase().includes('insiders'), (status) => {
                if (!HEADLESS) {
                    splash ?? (splash = (0, provisionSplash_1.createProvisionSplash)(WSL_DISTRO));
                    splash.setStatus(status);
                }
            });
            wslOptions = { distro: WSL_DISTRO, binaryPath };
        }
        catch (err) {
            const msg = `Failed to install the server into WSL distro "${WSL_DISTRO}":\n${err.message}`;
            (0, wsl_1.persistWslDistro)(path.join(electron_1.app.getPath('userData'), wsl_1.WSL_STATE_FILE), '');
            if (HEADLESS) {
                console.error('ERROR:', msg);
            }
            else {
                await electron_1.dialog.showErrorBox('WSL setup failed', msg);
            }
            electron_1.app.quit();
            return;
        }
        finally {
            splash?.close();
        }
    }
    const csrf = crypto.randomUUID();
    console.log(`Starting app (v${electron_1.app.getVersion()}) with dynamic port…`);
    try {
        hostBridgeServer = await (0, hostBridgeServer_1.startHostBridgeServer)({
            getUpdateStatus: updater_1.getHostUpdateStatus,
            applyUpdate: updater_1.applyHostUpdate,
        });
        console.log(`Host bridge server listening on ${hostBridgeServer.url}`);
    }
    catch (err) {
        console.error('Failed to start host bridge server:', err.message);
    }
    let handle;
    const targetPort = Number(process.env.JETSKI_LS_PORT) || constants_1.DYNAMIC_PORT;
    try {
        handle = await (0, languageServer_1.startAndMonitorLanguageServer)(targetPort, csrf, {
            headless: HEADLESS,
            wsl: wslOptions,
            hostBridgeUrl: hostBridgeServer?.url,
            hostBridgeToken: hostBridgeServer?.token,
            onPortChanged: (newPort) => {
                const newUrl = `${constants_1.WINDOW_ORIGIN}:${newPort}/`;
                console.log(`[Auto-Restart] Port changed! Reloading all windows with URL: ${newUrl}`);
                (0, languageServer_1.setupLocalCertTrust)();
                if (!HEADLESS) {
                    const windows = (0, utils_1.getHubWindows)();
                    for (const win of windows) {
                        void win.loadURL(newUrl);
                    }
                }
            },
        });
    }
    catch (err) {
        const msg = err.message;
        if (HEADLESS) {
            console.error('Startup failed:', msg);
        }
        else {
            await electron_1.dialog.showErrorBox('Startup failed', msg);
        }
        electron_1.app.quit();
        return;
    }
    const url = `${constants_1.WINDOW_ORIGIN}:${handle.port}/`;
    console.log('\n' + '='.repeat(60));
    console.log(`  Local:       ${url}`);
    console.log(`  LS Logs:     ${(0, paths_1.getLsLogPath)()}`);
    console.log(`  Electron Logs: ${main_1.default.transports.file.getFile().path}`);
    console.log('='.repeat(60) + '\n');
    if (HEADLESS) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.on('line', (line) => {
            const lsProc = (0, languageServer_1.getLsProcess)();
            if (lsProc && lsProc.stdin) {
                lsProc.stdin.write(line + '\n');
                console.log('-> Forwarded input to Language Server.');
            }
            else {
                console.log('Language Server process is not running.');
            }
        });
    }
    if (!HEADLESS) {
        (0, menu_1.setupApplicationMenu)(url);
        (0, utils_1.createWindow)(url, storageManager);
        if (electron_1.app.dock) {
            const dockMenu = electron_1.Menu.buildFromTemplate([
                {
                    label: 'New Window',
                    click: () => (0, utils_1.createWindow)(url, storageManager, { cascade: true }),
                },
            ]);
            electron_1.app.dock.setMenu(dockMenu);
        }
        (0, tray_1.createTray)([
            {
                id: 'running-agents',
                label: 'No agents running',
                enabled: false,
            },
            { type: 'separator' },
            {
                label: '⚙ Manage Custom Models (Ctrl+Alt+M)',
                click: () => {
                    const wins = (0, utils_1.getHubWindows)();
                    if (wins.length > 0) {
                        const win = wins[0];
                        if (win.isMinimized())
                            win.restore();
                        win.show();
                        win.focus();
                        const contents = (0, utils_1.getHubWebContents)(win);
                        contents?.send('open-custom-models-modal');
                    }
                },
            },
            { type: 'separator' },
            {
                label: `Open ${electron_1.app.getName()}`,
                click: () => (0, utils_1.showOrCreateWindow)((0, languageServer_1.getLsPort)(), storageManager),
            },
            {
                label: 'Quit',
                click: () => {
                    electron_1.app.quit();
                },
            },
        ], () => {
            (0, utils_1.showOrCreateWindow)((0, languageServer_1.getLsPort)(), storageManager);
            electron_1.app.focus({ steal: true });
        });
        void (0, menu_1.wslConnectMenuTemplate)().then((wslItem) => {
            if (wslItem) {
                (0, tray_1.insertTrayMenuItem)(3, wslItem);
                const reopen = (0, menu_1.wslReopenLocallyTemplate)();
                if (reopen) {
                    (0, tray_1.insertTrayMenuItem)(4, reopen);
                }
            }
        });
    }
    (0, updater_1.initAutoUpdater)(HEADLESS, settingsService);
    hasStartedMainApplication = true;
})
    .catch((err) => {
    console.error('Application failed to start:', err);
    hasStartedMainApplication = true;
});
electron_1.app.on('window-all-closed', async () => {
    if (isQuitting) {
        return;
    }
    if (!hasStartedMainApplication) {
        return;
    }
    const runInBackground = await settingsService.getSetting(settingsService_1.SettingKey.RUN_IN_BACKGROUND);
    if (!runInBackground) {
        electron_1.app.quit();
    }
});
async function closeHostBridgeServer() {
    if (!hostBridgeServer) {
        return;
    }
    try {
        await hostBridgeServer.close();
    }
    catch (err) {
        console.error('Failed to close host bridge server:', err);
    }
    hostBridgeServer = undefined;
}
electron_1.app.on('before-quit', async (event) => {
    if (isQuitting) {
        return;
    }
    if (!utils_1.showQuitConfirmation) {
        event.preventDefault();
        isQuitting = true;
        (0, windowState_1.flushTrackedWindowState)((0, utils_1.getFocusedHubWindow)());
        const windows = [
            ...new Set([...(0, utils_1.getHubWindows)(), ...electron_1.BrowserWindow.getAllWindows()]),
        ];
        for (const win of windows) {
            win.destroy();
        }
        await Promise.all([
            electron_1.session.defaultSession.closeAllConnections().catch((err) => {
                console.error('Failed to close session connections:', err);
            }),
            (0, languageServer_1.killLanguageServer)(),
            closeAllBrowserSessions().catch((err) => {
                console.error('Failed to close browser sessions:', err);
            }),
        ]);
        await closeHostBridgeServer();
        electron_1.app.quit();
        return;
    }
    event.preventDefault();
    const hubWins = (0, utils_1.getHubWindows)();
    const focusedWindow = (0, utils_1.getFocusedHubWindow)() ?? electron_1.BrowserWindow.getFocusedWindow();
    const win = (focusedWindow && hubWins.includes(focusedWindow) ? focusedWindow : undefined) ||
        hubWins[0];
    const options = {
        type: 'question',
        buttons: ['Cancel', 'Quit'],
        defaultId: 1,
        cancelId: 0,
        title: 'Confirm Quit',
        message: 'Are you sure you want to quit?',
        detail: 'There may be agents or background tasks running.',
    };
    (0, utils_1.setShowQuitConfirmation)(false);
    if (win) {
        void electron_1.dialog.showMessageBox(win, options).then((result) => {
            if (result.response === 1) {
                electron_1.app.quit();
            }
        });
    }
});
electron_1.app.on('activate', () => {
    if (!HEADLESS && (0, utils_1.getHubWindows)().length === 0) {
        const url = DEV_URL ?? `${constants_1.WINDOW_ORIGIN}:${(0, languageServer_1.getLsPort)()}/`;
        (0, utils_1.createWindow)(url, storageManager);
    }
});
//# sourceMappingURL=main.js.map