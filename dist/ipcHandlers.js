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
exports.reverifyStaleRoutes = reverifyStaleRoutes;
exports.scheduleAutoSwitchReverification = scheduleAutoSwitchReverification;
exports.registerIpcHandlers = registerIpcHandlers;
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const types_1 = require("./types");
const updater_1 = require("./updater");
const main_1 = __importDefault(require("electron-log/main"));
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const paths_1 = require("./paths");
const customScheme_1 = require("./customScheme");
const tray_1 = require("./tray");
const { isOwnedBrowserGuestWebContents, openTrackedWebviewDownload, resolveTrackedWebviewDownload, setGuestAgentControlled, setGuestDownloadDirectory, showTrackedWebviewDownloadInFolder, cancelTrackedWebviewDownload, } = require('./webviewBrowser');
const constants_1 = require("./ideInstall/constants");
const { deviceChooserController, WEBVIEW_DEVICE_CHOOSER_RESPONSE_CHANNEL, WEBVIEW_DEVICE_CHOOSER_SUBSCRIBER_STATE_CHANNEL, } = require('./deviceChooser');
const url_1 = require("url");
const wsl_1 = require("./wsl");
const menu_1 = require("./menu");
const { abortScriptInJail, runScriptInJail, warmScriptJail } = require('./scriptJail');
const externalUrl_1 = require("./externalUrl");
const utils_1 = require("./utils");
const hubZoom_1 = require("./hubZoom");
const { wcvBrowserRegistry } = require('./wcvBrowserRegistry');
const { isAuthorizedHubMainFrameEvent, registerWcvIpcHandlers } = require('./wcvIpcHandlers');
const { guestDialogController } = require('./guestDialogController');
const { guestFileChooserController, resolveGuestUploadFiles, } = require('./guestFileChooserController');
const { guestPromptController, WEBVIEW_PROMPT_RESPONSE_CHANNEL, WEBVIEW_PROMPT_SUBSCRIBER_STATE_CHANNEL, } = require('./guestPromptController');
const { HUMAN_PROMPT_SYNC_CHANNEL } = require('./webviewPromptPreload');
const { executeJavaScriptInIsolatedWorldWhenReady } = require('./isolatedWorldExec');
const { guestFrameBridge } = require('./guestFrameBridge');
const { guestNetworkController } = require('./guestNetworkController');
const { guestWebMcpController } = require('./guestWebMcpController');
const config_1 = require("./autoSwitch/config");
const verifier_1 = require("./autoSwitch/verifier");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cryptoStore = require('./cryptoStore');
const SAFE_UPLOAD_CONVERSATION_ID_RE = /^[a-zA-Z0-9_-]+$/;
function isMainFramePromptCaller(event) {
    const s = event?.sender;
    return Boolean(s &&
        !s.isDestroyed?.() &&
        !event?.senderFrame?.parent &&
        (!event?.senderFrame || !s.mainFrame || event.senderFrame === s.mainFrame));
}
const onHumanPromptSync = (event, rawJson) => {
    guestPromptController.handleSyncPrompt(event, rawJson);
};
const onHumanPromptSubscriberState = (event, subscribed) => {
    if (isMainFramePromptCaller(event)) {
        guestPromptController.setHostSubscribed(event.sender, Boolean(subscribed));
    }
};
deviceChooserController.setHostResolver((webContentsId) => wcvBrowserRegistry.resolveDeviceChooserHost(webContentsId));
function onDeviceChooserSubscriberState(event, subscribed) {
    if (isAuthorizedHubMainFrameEvent(event)) {
        deviceChooserController.setHostSubscribed(event.sender, Boolean(subscribed));
    }
}
function buildContextMenuTemplate(items, onSelect) {
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
async function findStoredModel(modelName) {
    const geminiDir = path.join(electron_1.app.getPath('home'), '.gemini', 'antigravity');
    const filePath = path.join(geminiDir, 'custom_models.json');
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        const cleanTarget = modelName.replace(/^models\//, '').trim();
        return parsed.models?.find((m) => {
            const mClean = (m.name || '').replace(/^models\//, '').trim();
            return mClean === cleanTarget || m.name === modelName;
        });
    }
    catch {
        return undefined;
    }
}
async function decryptStoredKey(model) {
    let key = model.apiKey || '';
    if (!key || key === 'none')
        return '';
    if (model.encrypted) {
        try {
            key = cryptoStore.decryptString(key);
        }
        catch (err) {
            main_1.default.warn('[Auto Switch] Could not decrypt stored key for', model.name, err);
            return '';
        }
    }
    return key;
}
async function upsertRoute(route) {
    const filePath = (0, config_1.getAutoSwitchConfigPath)(electron_1.app.getPath('home'));
    const policy = (0, config_1.loadAutoSwitchPolicy)(filePath);
    const idx = policy.routes.findIndex((r) => r.id === route.id);
    if (idx >= 0) {
        policy.routes[idx] = route;
    }
    else {
        policy.routes.push(route);
    }
    (0, config_1.saveAutoSwitchPolicy)(filePath, policy);
}
async function reverifyStaleRoutes(maxAgeMs = 7 * 24 * 3600 * 1000) {
    const filePath = (0, config_1.getAutoSwitchConfigPath)(electron_1.app.getPath('home'));
    const policy = (0, config_1.loadAutoSwitchPolicy)(filePath);
    const now = Date.now();
    let checked = 0;
    const failed = [];
    for (const route of policy.routes) {
        if (!route.enabled)
            continue;
        const verifiedAt = route.verified?.verifiedAt ?? 0;
        if (now - verifiedAt < maxAgeMs)
            continue;
        const model = await findStoredModel(route.id);
        if (!model) {
            route.enabled = false;
            failed.push(route.id);
            continue;
        }
        const apiKey = await decryptStoredKey(model);
        checked++;
        const res = await (0, verifier_1.verifyModel)({
            name: model.name,
            displayName: model.displayName,
            provider: model.provider,
            apiKey,
            apiUrl: model.apiUrl,
            externalModelName: model.externalModelName,
            allowUnauthorized: model.allowUnauthorized,
        }, apiKey);
        if (!res.ok) {
            route.enabled = false;
            failed.push(route.id);
            main_1.default.warn('[Auto Switch] Route failed re-verification and was disabled:', route.id);
        }
        else {
            route.verified = res.route.verified;
        }
    }
    if (checked > 0) {
        (0, config_1.saveAutoSwitchPolicy)(filePath, policy);
    }
    return { checked, failed };
}
function scheduleAutoSwitchReverification() {
    setTimeout(() => {
        reverifyStaleRoutes().catch((err) => {
            main_1.default.warn('[Auto Switch] Background reverification failed:', err);
        });
    }, 10000);
}
// ─── Main IPC Registration ──────────────────────────────────────────────────
function registerIpcHandlers(storageManager) {
    (0, hubZoom_1.setHubZoomStorageManager)(storageManager);
    const getTargetHubWindow = () => {
        return (0, utils_1.getFocusedHubWindow)() ?? (0, utils_1.getHubWindows)()[0];
    };
    // Dialog
    async function dialogDefaultPath() {
        const distro = (0, wsl_1.getActiveWslDistro)();
        if (!distro) {
            return undefined;
        }
        try {
            return (0, wsl_1.distroToWindowsPath)(await (0, wsl_1.getDistroHome)(distro), distro);
        }
        catch {
            return undefined;
        }
    }
    function mapPickedPath(picked) {
        const distro = (0, wsl_1.getActiveWslDistro)();
        if (!distro) {
            return picked;
        }
        const t = (0, wsl_1.windowsToDistroPath)(picked, distro);
        if (t.error) {
            electron_1.dialog.showErrorBox('Cannot open folder', t.error);
            return undefined;
        }
        if (t.warning) {
            void electron_1.dialog.showMessageBox(null, {
                type: 'warning',
                message: 'Folder is on the Windows filesystem',
                detail: t.warning,
            });
        }
        return t.path;
    }
    electron_1.ipcMain.handle('dialog:open-workspace', async () => {
        const result = await electron_1.dialog.showOpenDialog(null, {
            properties: ['openDirectory', 'createDirectory'],
            title: 'Open workspace',
            defaultPath: await dialogDefaultPath(),
        });
        if (result.canceled || result.filePaths.length === 0) {
            return undefined;
        }
        return mapPickedPath(result.filePaths[0]);
    });
    electron_1.ipcMain.handle('dialog:get-default-download-dir', (event) => {
        assertTopLevelSenderId(event, 'dialog:get-default-download-dir');
        try {
            return electron_1.app.getPath('downloads');
        }
        catch {
            return undefined;
        }
    });
    electron_1.ipcMain.handle('dialog:open-workspaces', async () => {
        const result = await electron_1.dialog.showOpenDialog(null, {
            properties: ['openDirectory', 'createDirectory', 'multiSelections'],
            title: 'Open workspaces',
            defaultPath: await dialogDefaultPath(),
        });
        if (result.canceled || result.filePaths.length === 0) {
            return [];
        }
        return result.filePaths
            .map(mapPickedPath)
            .filter((p) => p !== undefined);
    });
    // Auto-updater
    electron_1.ipcMain.handle('updater:apply', async () => {
        (0, updater_1.broadcastState)({ type: types_1.UpdateState.Ready });
    });
    electron_1.ipcMain.handle('updater:quit-and-install', () => {
        if (!electron_1.app.isPackaged) {
            console.log('[AutoUpdater] Skipping quitAndInstall (requires a packaged app).');
            return;
        }
        electron_updater_1.autoUpdater.quitAndInstall();
    });
    electron_1.ipcMain.handle('updater:get-state', () => {
        return (0, updater_1.getLastState)();
    });
    // Notifications
    electron_1.ipcMain.handle('notification:send', (_, options) => {
        const notification = new electron_1.Notification({
            title: options.title,
            body: options.body,
            silent: options.silent ?? false,
        });
        notification.on('click', () => {
            const win = (0, utils_1.getHubWindows)()[0];
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
    electron_1.ipcMain.handle('notification:open-system-preferences', async () => {
        if (process.platform === 'darwin') {
            void electron_1.shell.openExternal('x-apple.systempreferences:com.apple.preference.notifications');
        }
        else if (process.platform === 'win32') {
            void electron_1.shell.openExternal('ms-settings:notifications');
        }
        else if (process.platform === 'linux') {
            const { exec } = await Promise.resolve().then(() => __importStar(require('child_process')));
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
                }
                catch {
                    // Try next
                }
            }
        }
    });
    const readOsMicAccessStatus = () => {
        try {
            return electron_1.systemPreferences.getMediaAccessStatus('microphone');
        }
        catch {
            return 'unknown';
        }
    };
    electron_1.ipcMain.handle('mic:get-access-status', (event) => {
        if (!isAuthorizedHubMainFrameEvent(event)) {
            return 'unknown';
        }
        if (process.platform === 'darwin' || process.platform === 'win32') {
            return readOsMicAccessStatus();
        }
        return 'unknown';
    });
    let pendingMicAccessRequest = null;
    electron_1.ipcMain.handle('mic:request-access', async (event) => {
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
                        const granted = await electron_1.systemPreferences.askForMediaAccess('microphone');
                        if (granted) {
                            return 'granted';
                        }
                        const after = readOsMicAccessStatus();
                        return after === 'not-determined' ? 'denied' : after;
                    }
                    catch {
                        return 'unknown';
                    }
                    finally {
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
    electron_1.ipcMain.handle('mic:open-system-preferences', async (event) => {
        if (!isAuthorizedHubMainFrameEvent(event)) {
            return;
        }
        if (process.platform === 'darwin') {
            await (0, externalUrl_1.openExternalSafely)('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone', 'confirmed');
        }
        else if (process.platform === 'win32') {
            await (0, externalUrl_1.openExternalSafely)('ms-settings:privacy-microphone', 'confirmed');
        }
    });
    // Storage
    electron_1.ipcMain.removeAllListeners?.('storage:get-items-sync');
    electron_1.ipcMain.on('storage:get-items-sync', (event) => {
        const s = event?.sender;
        const trusted = Boolean(s) &&
            !s.isDestroyed?.() &&
            s.getType?.() !== 'webview' &&
            isAuthorizedHubMainFrameEvent(event);
        if (!trusted) {
            event.returnValue = {};
            return;
        }
        try {
            const storagePath = storageManager.storagePath;
            if (storagePath && fsSync.existsSync(storagePath)) {
                event.returnValue = JSON.parse(fsSync.readFileSync(storagePath, 'utf-8'));
                return;
            }
        }
        catch {
            // Fall through to empty object
        }
        event.returnValue = {};
    });
    electron_1.ipcMain.handle('storage:get-items', async () => {
        return storageManager.getItems();
    });
    electron_1.ipcMain.handle('storage:update-items', async (_event, changes) => {
        await storageManager.updateItems(changes);
    });
    // ─── Custom Models Handlers ───────────────────────────────────────────────
    electron_1.ipcMain.handle('storage:get-custom-models', async () => {
        const geminiDir = path.join(electron_1.app.getPath('home'), '.gemini', 'antigravity');
        const filePath = path.join(geminiDir, 'custom_models.json');
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const parsed = JSON.parse(content);
            const models = parsed.models || [];
            return models.map((m) => {
                let maskedKey = m.apiKey || '';
                let keyValid = true;
                if (m.apiKey && m.apiKey !== 'none') {
                    const decrypted = cryptoStore.decryptString(m.apiKey);
                    if (!decrypted || decrypted === 'DECRYPTION_FAILED' || decrypted.startsWith('DECRYPTION_FAILED')) {
                        keyValid = false;
                        maskedKey = 'Key needs update';
                    }
                    else if (decrypted.length <= 8) {
                        maskedKey = '********';
                    }
                    else {
                        maskedKey = decrypted.substring(0, 4) + '...' + decrypted.substring(decrypted.length - 4);
                    }
                }
                return {
                    ...m,
                    apiKey: maskedKey,
                    keyValid,
                };
            });
        }
        catch {
            return [];
        }
    });
    electron_1.ipcMain.handle('storage:save-custom-model', async (_event, newModel) => {
        const geminiDir = path.join(electron_1.app.getPath('home'), '.gemini', 'antigravity');
        const filePath = path.join(geminiDir, 'custom_models.json');
        try {
            let models = [];
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const parsed = JSON.parse(content);
                models = parsed.models || [];
            }
            catch {
                // File does not exist yet
            }
            const rawId = (newModel.externalModelName || newModel.name || '').trim();
            const cleanId = rawId.replace(/^models\//, '').trim();
            newModel.name = 'models/' + cleanId;
            newModel.externalModelName = cleanId;
            if (!newModel.displayName || !newModel.displayName.trim()) {
                newModel.displayName = cleanId;
            }
            const originalIdx = newModel.originalModelName && newModel.originalModelName !== newModel.name
                ? models.findIndex((m) => m.name === newModel.originalModelName ||
                    m.name === 'models/' + newModel.originalModelName.replace(/^models\//, ''))
                : -1;
            const existingIdx = models.findIndex((m) => m.name === newModel.name);
            const targetOld = originalIdx !== -1 ? models[originalIdx] : existingIdx !== -1 ? models[existingIdx] : undefined;
            const isMaskedOrEmpty = !newModel.apiKey ||
                newModel.apiKey === 'none' ||
                newModel.apiKey.includes('...') ||
                newModel.apiKey.startsWith('***') ||
                newModel.apiKey.includes('••') ||
                newModel.apiKey === '********' ||
                newModel.apiKey === 'Key needs update';
            if (isMaskedOrEmpty && targetOld && targetOld.apiKey && targetOld.apiKey !== 'none') {
                newModel.apiKey = targetOld.apiKey;
                newModel.encrypted = targetOld.encrypted;
            }
            else {
                if (newModel.apiKey && newModel.apiKey !== 'none') {
                    newModel.apiKey = cryptoStore.encryptString(newModel.apiKey);
                    newModel.encrypted = true;
                }
            }
            if (originalIdx !== -1) {
                models.splice(originalIdx, 1);
            }
            delete newModel.originalModelName;
            const updatedIdx = models.findIndex((m) => m.name === newModel.name);
            if (updatedIdx !== -1) {
                models[updatedIdx] = newModel;
            }
            else {
                models.push(newModel);
            }
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, JSON.stringify({ models }, null, 2), 'utf-8');
            return { success: true };
        }
        catch (err) {
            console.error('[IPC] Failed to save custom model:', err);
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('storage:delete-custom-model', async (_event, modelName) => {
        const geminiDir = path.join(electron_1.app.getPath('home'), '.gemini', 'antigravity');
        const filePath = path.join(geminiDir, 'custom_models.json');
        try {
            let models = [];
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const parsed = JSON.parse(content);
                models = parsed.models || [];
            }
            catch {
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
        }
        catch (err) {
            console.error('[IPC] Failed to delete custom model:', err);
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('storage:update-provider-keys', async (_event, provider, newApiKey) => {
        const geminiDir = path.join(electron_1.app.getPath('home'), '.gemini', 'antigravity');
        const filePath = path.join(geminiDir, 'custom_models.json');
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const parsed = JSON.parse(content);
            const models = parsed.models || [];
            const encryptedKey = cryptoStore.encryptString(newApiKey.trim());
            let updatedCount = 0;
            for (const m of models) {
                if (m.provider === provider ||
                    (provider === 'openrouter' && (m.apiUrl?.includes('openrouter') || m.provider === 'openrouter'))) {
                    m.apiKey = encryptedKey;
                    m.encrypted = true;
                    updatedCount++;
                }
            }
            await fs.writeFile(filePath, JSON.stringify({ models }, null, 2), 'utf-8');
            return { success: true, updatedCount };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('autoSwitch:get-policy', async () => {
        return (0, config_1.loadAutoSwitchPolicy)((0, config_1.getAutoSwitchConfigPath)(electron_1.app.getPath('home')));
    });
    electron_1.ipcMain.handle('autoSwitch:save-policy', async (_event, policy) => {
        return (0, config_1.saveAutoSwitchPolicy)((0, config_1.getAutoSwitchConfigPath)(electron_1.app.getPath('home')), policy);
    });
    electron_1.ipcMain.handle('autoSwitch:set-enabled', async (_event, enabled) => {
        const filePath = (0, config_1.getAutoSwitchConfigPath)(electron_1.app.getPath('home'));
        const policy = (0, config_1.loadAutoSwitchPolicy)(filePath);
        policy.enabled = enabled === true;
        return (0, config_1.saveAutoSwitchPolicy)(filePath, policy);
    });
    electron_1.ipcMain.handle('autoSwitch:verify-model', async (_event, modelName) => {
        try {
            const model = await findStoredModel(modelName);
            if (!model) {
                return { ok: false, messages: ['That model is no longer saved. Add it again and retry.'] };
            }
            const apiKey = await decryptStoredKey(model);
            const verifiable = {
                name: model.name,
                displayName: model.displayName,
                provider: model.provider,
                apiKey,
                apiUrl: model.apiUrl,
                externalModelName: model.externalModelName,
                allowUnauthorized: model.allowUnauthorized,
            };
            const result = await (0, verifier_1.verifyModel)(verifiable, apiKey);
            const route = { ...result.route, enabled: result.ok };
            if (result.ok)
                await upsertRoute(route);
            return { ok: result.ok, route, messages: result.messages };
        }
        catch (err) {
            main_1.default.error('[Auto Switch] Verification handler failed:', err);
            return { ok: false, messages: ['Verification could not be completed. Check model details and retry.'] };
        }
    });
    electron_1.ipcMain.handle('autoSwitch:reverify-stale', async () => reverifyStaleRoutes());
    electron_1.ipcMain.handle('storage:test-model-connection', async (_event, model) => {
        const https = require('https');
        const http = require('http');
        return new Promise((resolve) => {
            try {
                let urlStr = model.apiUrl;
                if (model.provider === 'openai' || model.provider === 'custom' || model.provider === 'ollama') {
                    if (!urlStr.toLowerCase().includes('/chat/completions') && !urlStr.toLowerCase().includes('/completions')) {
                        if (urlStr.endsWith('/v1')) {
                            urlStr += '/chat/completions';
                        }
                        else if (!urlStr.endsWith('/')) {
                            urlStr += '/v1/chat/completions';
                        }
                        else {
                            urlStr += 'v1/chat/completions';
                        }
                    }
                }
                const url = new URL(urlStr);
                const client = url.protocol === 'https:' ? https : http;
                const options = {
                    method: 'HEAD',
                    hostname: url.hostname,
                    port: parseInt(url.port || (url.protocol === 'https:' ? '443' : '80'), 10),
                    path: url.pathname + url.search,
                    timeout: 10000,
                    rejectUnauthorized: !model.allowUnauthorized,
                };
                let key = model.apiKey;
                const isMaskedOrEmpty = !key ||
                    key === 'none' ||
                    key.includes('...') ||
                    key.startsWith('***') ||
                    key.includes('••') ||
                    key === '********';
                if (isMaskedOrEmpty && model.name) {
                    try {
                        const geminiDir = path.join(electron_1.app.getPath('home'), '.gemini', 'antigravity');
                        const filePath = path.join(geminiDir, 'custom_models.json');
                        const content = fsSync.readFileSync(filePath, 'utf-8');
                        const parsed = JSON.parse(content);
                        const found = parsed.models?.find((m) => m.name === model.name);
                        if (found?.apiKey && found.apiKey !== 'none') {
                            key = cryptoStore.decryptString(found.apiKey) || found.apiKey;
                        }
                    }
                    catch { }
                }
                else if (key && key !== 'none') {
                    try {
                        key = cryptoStore.decryptString(key);
                    }
                    catch { }
                }
                if (key && key !== 'none' && !key.includes('...')) {
                    if (model.provider === 'anthropic') {
                        options.headers = {
                            'x-api-key': key,
                            'anthropic-version': '2023-06-01',
                        };
                        const wsId = model.workspaceId ||
                            model.anthropicWorkspaceId ||
                            process.env.ANTHROPIC_WORKSPACE_ID;
                        if (wsId) {
                            options.headers['anthropic-workspace-id'] = wsId;
                        }
                    }
                    else if (model.provider === 'google') {
                        options.headers = {
                            'x-goog-api-key': key,
                        };
                    }
                    else {
                        options.headers = {
                            Authorization: `Bearer ${key}`,
                        };
                    }
                }
                const req = client.request(options, (res) => {
                    const code = res.statusCode || 0;
                    if (code === 401) {
                        resolve({
                            success: false,
                            status: code,
                            error: 'Invalid API Key (HTTP 401 Unauthorized)',
                        });
                    }
                    else if (code === 403) {
                        resolve({
                            success: false,
                            status: code,
                            error: 'Access Forbidden (HTTP 403 Forbidden)',
                        });
                    }
                    else if (code >= 200 && code < 400) {
                        resolve({
                            success: true,
                            status: code,
                            message: `Connected & Authenticated (HTTP ${code}) ✓`,
                        });
                    }
                    else if (code === 405) {
                        resolve({
                            success: true,
                            status: code,
                            message: `Endpoint reachable (HTTP 405) ✓`,
                        });
                    }
                    else {
                        resolve({
                            success: false,
                            status: code,
                            error: `Server returned HTTP ${code}`,
                        });
                    }
                    res.resume();
                });
                req.on('error', (err) => {
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
            }
            catch (err) {
                resolve({
                    success: false,
                    error: err.message || 'Invalid URL or configuration',
                });
            }
        });
    });
    // ─── Other Official Handlers ───────────────────────────────────────────────
    electron_1.ipcMain.handle('logs:electron', async () => {
        try {
            const logFile = main_1.default.transports.file.getFile();
            return await fs.readFile(logFile.path, 'utf-8');
        }
        catch {
            return '';
        }
    });
    electron_1.ipcMain.handle('extensions:send-authorities', async (_event, authorities) => {
        for (const [authority, host] of Object.entries(authorities)) {
            customScheme_1.extensionAuthorities.set(authority, host);
        }
    });
    electron_1.ipcMain.handle('agent:update-active-count', async (_event, count) => {
        (0, tray_1.updateTrayAgentCount)(count);
    });
    electron_1.ipcMain.handle('window:set-title-bar-overlay', async (_event, options) => {
        const win = getTargetHubWindow();
        win?.setTitleBarOverlay?.(options);
    });
    electron_1.ipcMain.handle('window:minimize', async () => {
        const win = getTargetHubWindow();
        win?.minimize?.();
    });
    electron_1.ipcMain.handle('window:maximize', async () => {
        const win = getTargetHubWindow();
        win?.maximize?.();
    });
    electron_1.ipcMain.handle('window:unmaximize', async () => {
        const win = getTargetHubWindow();
        win?.unmaximize?.();
    });
    electron_1.ipcMain.handle('window:is-maximized', async () => {
        const win = getTargetHubWindow();
        return win?.isMaximized?.() ?? false;
    });
    electron_1.ipcMain.handle('window:close', async () => {
        const win = getTargetHubWindow();
        win?.close?.();
    });
    electron_1.ipcMain.handle('window:toggle-devtools', async (event) => {
        const sender = event?.sender;
        if (sender && !sender.isDestroyed?.()) {
            sender.toggleDevTools?.();
        }
    });
    electron_1.ipcMain.on?.(WEBVIEW_DEVICE_CHOOSER_SUBSCRIBER_STATE_CHANNEL, onDeviceChooserSubscriberState);
    electron_1.ipcMain.handle(WEBVIEW_DEVICE_CHOOSER_RESPONSE_CHANNEL, async (event, requestId, resolution) => {
        if (!isAuthorizedHubMainFrameEvent(event)) {
            throw new Error(`${WEBVIEW_DEVICE_CHOOSER_RESPONSE_CHANNEL} must be called from the main frame`);
        }
        return deviceChooserController.handleResponse(event.sender.id, requestId, resolution);
    });
    let activeContextMenu = null;
    electron_1.ipcMain.handle('window:show-context-menu', async (_event, items) => {
        activeContextMenu?.closePopup?.();
        activeContextMenu = null;
        return new Promise((resolve) => {
            let selectedId = null;
            const menu = electron_1.Menu.buildFromTemplate(buildContextMenuTemplate(items, (id) => {
                selectedId = id;
            }));
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
    electron_1.ipcMain.handle('window:close-context-menu', () => {
        activeContextMenu?.closePopup?.();
        activeContextMenu = null;
    });
    electron_1.ipcMain.handle('window:zoom-in', async () => {
        await (0, hubZoom_1.applyHubWindowZoom)(getTargetHubWindow(), 'in');
    });
    electron_1.ipcMain.handle('window:zoom-out', async () => {
        await (0, hubZoom_1.applyHubWindowZoom)(getTargetHubWindow(), 'out');
    });
    electron_1.ipcMain.handle('window:reset-zoom', async () => {
        await (0, hubZoom_1.applyHubWindowZoom)(getTargetHubWindow(), 'reset');
    });
    electron_1.ipcMain.handle('updater:check-for-updates', () => {
        (0, updater_1.checkForUpdates)(true);
    });
    electron_1.ipcMain.handle('shell:open-external', async (_event, url) => {
        await (0, externalUrl_1.openExternalSafely)(url, 'confirmed');
    });
    electron_1.ipcMain.handle('shell:reveal-in-file-picker', (_event, filePath) => {
        const distro = (0, wsl_1.getActiveWslDistro)();
        if (distro) {
            const posixPath = (0, url_1.fileURLToPath)(filePath, { windows: false });
            electron_1.shell.showItemInFolder((0, wsl_1.distroToWindowsPath)(posixPath, distro));
            return;
        }
        electron_1.shell.showItemInFolder((0, url_1.fileURLToPath)(filePath));
    });
    const assertTopLevelSenderId = (event, channel) => {
        if (event?.senderFrame?.parent) {
            throw new Error(`Unauthorized ${channel} sender: subframe cannot invoke ${channel}`);
        }
        const sender = event?.sender;
        if (!sender || sender.isDestroyed?.() || typeof sender.id !== 'number' || !Number.isInteger(sender.id)) {
            throw new Error(`Unauthorized ${channel} sender`);
        }
        return sender.id;
    };
    electron_1.ipcMain.handle('webview:set-download-dir', (event, webContentsId, downloadDir) => {
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
        const wc = electron_1.webContents.fromId(webContentsId);
        if (!isOwnedBrowserGuestWebContents(wc, sender.id)) {
            throw new Error(`WebContents ${webContentsId} is not owned by the calling renderer`);
        }
        return setGuestDownloadDirectory(wc, downloadDir);
    });
    electron_1.ipcMain.handle('webview:set-agent-controlled', (event, webContentsId, active) => {
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
        const wc = electron_1.webContents.fromId(webContentsId);
        if (!wc || !isOwnedBrowserGuestWebContents(wc, sender.id)) {
            return false;
        }
        return setGuestAgentControlled(wc, active);
    });
    electron_1.ipcMain.handle('webview:open-download', async (event, downloadId) => {
        const senderId = assertTopLevelSenderId(event, 'webview:open-download');
        if (typeof downloadId !== 'string') {
            throw new Error('downloadId must be a string');
        }
        return openTrackedWebviewDownload(senderId, downloadId);
    });
    electron_1.ipcMain.handle('webview:show-download-in-folder', (event, downloadId) => {
        const senderId = assertTopLevelSenderId(event, 'webview:show-download-in-folder');
        if (typeof downloadId !== 'string') {
            throw new Error('downloadId must be a string');
        }
        return showTrackedWebviewDownloadInFolder(senderId, downloadId);
    });
    electron_1.ipcMain.handle('webview:cancel-download', (event, downloadId) => {
        const senderId = assertTopLevelSenderId(event, 'webview:cancel-download');
        if (typeof downloadId !== 'string') {
            throw new Error('downloadId must be a string');
        }
        return cancelTrackedWebviewDownload(senderId, downloadId);
    });
    electron_1.ipcMain.handle('webview:resolve-download', (event, downloadId, approve) => {
        let senderId;
        try {
            senderId = assertTopLevelSenderId(event, 'webview:resolve-download');
        }
        catch {
            return false;
        }
        if (typeof downloadId !== 'string' || typeof approve !== 'boolean') {
            return false;
        }
        return resolveTrackedWebviewDownload(senderId, downloadId, approve);
    });
    electron_1.ipcMain.handle('dialog:select-download-dir', async (event, defaultPath) => {
        assertTopLevelSenderId(event, 'dialog:select-download-dir');
        let resolvedDefaultPath;
        if (typeof defaultPath === 'string' && defaultPath.trim().length > 0 && !defaultPath.includes('\0')) {
            resolvedDefaultPath = defaultPath.trim();
        }
        else {
            try {
                resolvedDefaultPath = electron_1.app.getPath('downloads');
            }
            catch {
                resolvedDefaultPath = undefined;
            }
        }
        const options = {
            properties: ['openDirectory', 'createDirectory'],
            title: 'Select Download Folder',
            defaultPath: resolvedDefaultPath,
        };
        const owner = electron_1.BrowserWindow.fromWebContents(event.sender);
        const result = owner
            ? await electron_1.dialog.showOpenDialog(owner, options)
            : await electron_1.dialog.showOpenDialog(null, options);
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        const picked = result.filePaths[0];
        if (typeof picked !== 'string' || picked.includes('\0') || !path.isAbsolute(picked)) {
            return null;
        }
        try {
            return (await fs.stat(picked)).isDirectory() ? picked : null;
        }
        catch {
            return null;
        }
    });
    electron_1.ipcMain.handle('ide:is-installed', async () => {
        try {
            await fs.stat((0, constants_1.getIdeInstallPath)());
            return true;
        }
        catch {
            return false;
        }
    });
    electron_1.ipcMain.handle('webview:get-memory-usage', async (event, webContentsIds) => {
        const sender = event?.sender;
        if (!sender ||
            sender.isDestroyed() ||
            event?.senderFrame?.parent ||
            (event?.senderFrame && sender.mainFrame && event.senderFrame !== sender.mainFrame) ||
            !Array.isArray(webContentsIds) ||
            webContentsIds.length === 0) {
            return {};
        }
        const MAX_QUERIED_GUESTS = 64;
        const seenIds = new Set();
        const ownedGuests = [];
        for (const rawId of webContentsIds) {
            if (seenIds.size >= MAX_QUERIED_GUESTS) {
                break;
            }
            if (typeof rawId !== 'number' || !Number.isInteger(rawId) || rawId <= 0 || seenIds.has(rawId)) {
                continue;
            }
            seenIds.add(rawId);
            const wc = electron_1.webContents.fromId(rawId);
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
            let pid;
            try {
                pid = wc.getOSProcessId?.();
            }
            catch {
                pid = undefined;
            }
            ownedGuests.push({ webContentsId: rawId, pid });
        }
        if (ownedGuests.length === 0) {
            return {};
        }
        const bytesByWcId = wcvBrowserRegistry.computeGuestMemoryBytes(ownedGuests);
        const out = {};
        for (const [id, bytes] of bytesByWcId.entries()) {
            out[id] = bytes;
        }
        return out;
    });
    electron_1.ipcMain.handle('wsl:get-state', async () => {
        if (!(0, wsl_1.isWslAvailable)()) {
            return { available: false, activeDistro: null, distros: [] };
        }
        try {
            const distros = await (0, wsl_1.listWslDistros)();
            return {
                available: true,
                activeDistro: (0, wsl_1.getActiveWslDistro)() ?? null,
                distros: distros.map((d) => ({ name: d.name, isDefault: d.isDefault })),
            };
        }
        catch (err) {
            main_1.default.error('wsl:get-state failed:', err);
            return { available: false, activeDistro: null, distros: [] };
        }
    });
    electron_1.ipcMain.handle('wsl:connect', (_event, distro) => {
        (0, menu_1.relaunchWithWslDistro)(distro || '');
    });
    const MIN_ISOLATED_WORLD_ID = 1000;
    const MAX_ISOLATED_WORLD_ID = 100000;
    electron_1.ipcMain.handle('webview:execute-js-isolated-world', async (event, webContentsId, worldId, code) => {
        if (typeof webContentsId !== 'number' || !Number.isInteger(webContentsId) || webContentsId <= 0) {
            throw new Error(`Invalid webContentsId: ${String(webContentsId)}`);
        }
        if (typeof worldId !== 'number' ||
            !Number.isInteger(worldId) ||
            worldId < MIN_ISOLATED_WORLD_ID ||
            worldId > MAX_ISOLATED_WORLD_ID) {
            throw new Error(`Invalid isolated worldId: ${String(worldId)}`);
        }
        if (typeof code !== 'string') {
            throw new Error('code must be a string');
        }
        const wc = electron_1.webContents.fromId(webContentsId);
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
    const resolveOwnedGuestWebContents = (event, webContentsId) => {
        if (typeof webContentsId !== 'number' || !Number.isInteger(webContentsId) || webContentsId <= 0) {
            throw new Error(`Invalid webContentsId: ${String(webContentsId)}`);
        }
        const wc = electron_1.webContents.fromId(webContentsId);
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
    electron_1.ipcMain.handle('webview:get-network-requests', (event, webContentsId) => {
        const { wc, sender } = resolveOwnedGuestWebContents(event, webContentsId);
        if (!event?.senderFrame || (sender.mainFrame && event.senderFrame !== sender.mainFrame) || event.senderFrame.parent) {
            throw new Error('webview:get-network-requests must be called from the main frame');
        }
        return guestNetworkController.getRequests(wc.id);
    });
    electron_1.ipcMain.handle('webview:clear-network-requests', (event, webContentsId) => {
        const { wc, sender } = resolveOwnedGuestWebContents(event, webContentsId);
        if (!event?.senderFrame || (sender.mainFrame && event.senderFrame !== sender.mainFrame) || event.senderFrame.parent) {
            throw new Error('webview:clear-network-requests must be called from the main frame');
        }
        return guestNetworkController.clearRequests(wc.id);
    });
    const guestOf = (e, id) => {
        const { wc, sender } = resolveOwnedGuestWebContents(e, id);
        const f = e?.senderFrame;
        if (!f || f.parent || (sender.mainFrame && f !== sender.mainFrame)) {
            throw new Error('WebMCP IPC must be called from the main frame');
        }
        return { wc, sender };
    };
    electron_1.ipcMain.handle('webview:webmcp-set-enabled', (event, enabled) => {
        if (!isAuthorizedHubMainFrameEvent(event) || typeof enabled !== 'boolean') {
            throw new Error('Invalid webview:webmcp-set-enabled call');
        }
        guestWebMcpController.setEnabled(enabled);
        return guestWebMcpController.isEnabled();
    });
    electron_1.ipcMain.handle('webview:webmcp-list-tools', (event, webContentsId, origin) => guestWebMcpController.listTools(guestOf(event, webContentsId).wc, origin));
    electron_1.ipcMain.handle('webview:webmcp-call-tool', (event, webContentsId, origin, params) => {
        const { wc, sender } = guestOf(event, webContentsId);
        return guestWebMcpController.callTool(wc, sender, origin, params);
    });
    electron_1.ipcMain.handle('webview:webmcp-cancel-tool-call', (event, webContentsId, callId) => guestWebMcpController.cancelToolCall(webContentsId, callId, guestOf(event, webContentsId).sender.id));
    electron_1.ipcMain.handle('webview:set-dialog-policy', async (event, webContentsId, policy) => {
        const { wc, sender } = resolveOwnedGuestWebContents(event, webContentsId);
        const safePolicy = {
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
    electron_1.ipcMain.handle('webview:handle-javascript-dialog', async (event, webContentsId, decision) => {
        const { wc } = resolveOwnedGuestWebContents(event, webContentsId);
        return guestDialogController.handleDialog(wc, {
            ...(typeof decision?.dialogId === 'string' ? { dialogId: decision.dialogId } : {}),
            accept: Boolean(decision?.accept),
            ...(typeof decision?.promptText === 'string' ? { promptText: decision.promptText } : {}),
        });
    });
    electron_1.ipcMain.removeListener?.(HUMAN_PROMPT_SYNC_CHANNEL, onHumanPromptSync);
    electron_1.ipcMain.on?.(HUMAN_PROMPT_SYNC_CHANNEL, onHumanPromptSync);
    electron_1.ipcMain.removeListener?.(WEBVIEW_PROMPT_SUBSCRIBER_STATE_CHANNEL, onHumanPromptSubscriberState);
    electron_1.ipcMain.on?.(WEBVIEW_PROMPT_SUBSCRIBER_STATE_CHANNEL, onHumanPromptSubscriberState);
    electron_1.ipcMain.handle(WEBVIEW_PROMPT_RESPONSE_CHANNEL, (event, promptId, value) => {
        if (!isMainFramePromptCaller(event)) {
            throw new Error('webview:prompt-response must be called from the main frame');
        }
        return guestPromptController.respondPrompt(event.sender.id, promptId, typeof value === 'string' ? value : null);
    });
    const assertMainFrameSender = (event, channel) => {
        const sender = event?.sender;
        if (!sender ||
            sender.isDestroyed() ||
            !event?.senderFrame ||
            event.senderFrame !== sender.mainFrame ||
            event.senderFrame.parent) {
            throw new Error(`${channel} must be called from the main frame`);
        }
    };
    const pinUploadsRoot = (conversationId) => {
        if (typeof conversationId !== 'string' || !SAFE_UPLOAD_CONVERSATION_ID_RE.test(conversationId) || /^\.+$/.test(conversationId)) {
            return '';
        }
        let appDataDir = (0, paths_1.getAppDataDir)();
        try {
            appDataDir = fsSync.realpathSync(appDataDir);
        }
        catch { }
        return path.join(appDataDir, 'brain', conversationId, 'browser_sandbox', 'uploads');
    };
    const resolveMainFrameOwnedGuest = (event, webContentsId, channel) => {
        const { wc, sender } = resolveOwnedGuestWebContents(event, webContentsId);
        assertMainFrameSender(event, channel);
        return { wc, sender };
    };
    electron_1.ipcMain.handle('webview:set-file-chooser-policy', async (event, webContentsId, policy) => {
        const { wc, sender } = resolveMainFrameOwnedGuest(event, webContentsId, 'webview:set-file-chooser-policy');
        return guestFileChooserController.setPolicy(wc, sender, {
            enabled: Boolean(policy?.enabled),
            ...(typeof policy?.tabKey === 'string' ? { tabKey: policy.tabKey } : {}),
        });
    });
    electron_1.ipcMain.handle('webview:handle-file-chooser', async (event, webContentsId, decision) => {
        const { wc } = resolveMainFrameOwnedGuest(event, webContentsId, 'webview:handle-file-chooser');
        const pinned = { ...(decision ?? { chooserId: '' }) };
        if (Array.isArray(pinned.files) && pinned.files.length > 0) {
            pinned.allowedUploadsDir = pinUploadsRoot(pinned.expectedConversationId);
        }
        return guestFileChooserController.handleFileChooser(wc, pinned);
    });
    electron_1.ipcMain.handle('webview:set-input-files', async (event, webContentsId, request) => {
        const { wc } = resolveMainFrameOwnedGuest(event, webContentsId, 'webview:set-input-files');
        return guestFileChooserController.setInputFiles(wc, {
            ...request,
            allowedUploadsDir: pinUploadsRoot(request?.expectedConversationId),
        });
    });
    electron_1.ipcMain.handle('webview:resolve-upload-files', (event, req) => {
        assertMainFrameSender(event, 'webview:resolve-upload-files');
        return resolveGuestUploadFiles(req && {
            ...req,
            uploadsRoot: pinUploadsRoot(req.expectedConversationId),
        });
    });
    const assertMainFrameGuestCaller = (event, webContentsId, channel) => resolveMainFrameOwnedGuest(event, webContentsId, channel).wc;
    electron_1.ipcMain.handle('webview:list-frames', async (event, wcId) => guestFrameBridge.listFrames(assertMainFrameGuestCaller(event, wcId, 'webview:list-frames')));
    electron_1.ipcMain.handle('webview:execute-js-frame-isolated-world', async (event, wcId, frameId, code, expectedOrigin) => {
        const channel = 'webview:execute-js-frame-isolated-world';
        const wc = assertMainFrameGuestCaller(event, wcId, channel);
        return guestFrameBridge.executeInFrameIsolatedWorld(wc, frameId, code, expectedOrigin);
    });
    electron_1.ipcMain.handle('script-jail:run', async (event, req) => {
        return runScriptInJail(event?.sender, req, event?.senderFrame);
    });
    electron_1.ipcMain.handle('script-jail:abort', (event, jailId) => {
        return abortScriptInJail(event?.sender, jailId, event?.senderFrame);
    });
    electron_1.ipcMain.handle('script-jail:warm', async (event) => {
        return warmScriptJail(event?.sender, event?.senderFrame);
    });
    registerWcvIpcHandlers(undefined, undefined, storageManager);
}
//# sourceMappingURL=ipcHandlers.js.map