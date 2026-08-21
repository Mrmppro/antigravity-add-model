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
exports.registerIpcHandlers = registerIpcHandlers;
exports.reverifyStaleRoutes = reverifyStaleRoutes;
exports.scheduleAutoSwitchReverification = scheduleAutoSwitchReverification;
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const updater_1 = require("./updater");
const main_1 = __importDefault(require("electron-log/main"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const customScheme_1 = require("./customScheme");
const tray_1 = require("./tray");
const config_1 = require("./autoSwitch/config");
const verifier_1 = require("./autoSwitch/verifier");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cryptoStore = require('./cryptoStore');
/**
 * Registers all IPC handlers for the main process.
 */
function registerIpcHandlers(storageManager) {
    // IDE detection — the renderer polls this to decide whether to show IDE
    // integration features.  Returning true because Antigravity itself is the IDE.
    electron_1.ipcMain.handle('ide:is-installed', async () => true);
    // Dialog
    electron_1.ipcMain.handle('dialog:open-workspace', async () => {
        const result = await electron_1.dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory'],
            title: 'Open workspace',
        });
        if (result.canceled || result.filePaths.length === 0) {
            return undefined;
        }
        return result.filePaths[0];
    });
    // Auto-updater
    electron_1.ipcMain.handle('updater:apply', async () => {
        (0, updater_1.broadcastState)({ type: 'ready' });
    });
    electron_1.ipcMain.handle('updater:quit-and-install', () => {
        if (!electron_1.app.isPackaged) {
            console.log('[AutoUpdater] Skipping quitAndInstall (requires a packaged app).');
            return;
        }
        electron_updater_1.autoUpdater.quitAndInstall();
    });
    electron_1.ipcMain.handle('updater:get-state', async () => {
        return (0, updater_1.getLastState)();
    });
    // Notifications
    electron_1.ipcMain.handle('notification:send', (_event, options) => {
        const notification = new electron_1.Notification({
            title: options.title,
            body: options.body,
            silent: options.silent ?? false,
        });
        notification.on('click', () => {
            const win = electron_1.BrowserWindow.getAllWindows()[0];
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
    // Note: copied from our desktop AGY implementation:
    // vs/platform/nativeNotification/electron-main/electronNotificationService.ts
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
                    return; // If one command executes without immediate error, assume success for now
                }
                catch {
                    // Try next
                }
            }
        }
    });
    // Storage
    electron_1.ipcMain.handle('storage:get-items', async () => {
        return storageManager.getItems();
    });
    electron_1.ipcMain.handle('storage:update-items', async (_event, changes) => {
        await storageManager.updateItems(changes);
    });
    electron_1.ipcMain.handle('storage:get-custom-models', async () => {
        const geminiDir = path.join(electron_1.app.getPath('home'), '.gemini', 'antigravity');
        const filePath = path.join(geminiDir, 'custom_models.json');
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const parsed = JSON.parse(content);
            const models = parsed.models || [];
            // Return models with masked API keys to the UI
            return models.map((m) => {
                let maskedKey = m.apiKey;
                if (m.apiKey && m.apiKey !== 'none') {
                    const decrypted = cryptoStore.decryptString(m.apiKey);
                    if (decrypted.length <= 8) {
                        maskedKey = '********';
                    }
                    else {
                        maskedKey = decrypted.substring(0, 4) + '...' + decrypted.substring(decrypted.length - 4);
                    }
                }
                return {
                    ...m,
                    apiKey: maskedKey,
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
                // Ignore if file doesn't exist
            }
            // Check if model already exists, if so update it, otherwise push
            const existingIdx = models.findIndex((m) => m.name === newModel.name);
            // Edit collision protection: If new key is masked and old record exists, preserve old encrypted key
            const isMasked = newModel.apiKey &&
                (newModel.apiKey.includes('...') || newModel.apiKey.startsWith('***') || newModel.apiKey === '********');
            if (isMasked && existingIdx !== -1) {
                newModel.apiKey = models[existingIdx].apiKey;
                newModel.encrypted = models[existingIdx].encrypted;
            }
            else {
                if (newModel.apiKey && newModel.apiKey !== 'none') {
                    newModel.apiKey = cryptoStore.encryptString(newModel.apiKey);
                    newModel.encrypted = true;
                }
            }
            if (existingIdx !== -1) {
                models[existingIdx] = newModel;
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
                // Ignore if file doesn't exist
            }
            models = models.filter((m) => m.name !== modelName);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, JSON.stringify({ models }, null, 2), 'utf-8');
            return { success: true };
        }
        catch (err) {
            console.error('[IPC] Failed to delete custom model:', err);
            return { success: false, error: err.message };
        }
    });
    // Gravity Auto Switch policy. The detailed policy is intentionally separate from
    // custom_models.json so routing preferences never expose or duplicate API keys.
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
    /**
     * Probes one of the user's own models and reports what it can actually do.
     *
     * This runs in main because the stored API key is encrypted and the renderer
     * only ever sees a masked version of it.
     */
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
            // A passing probe is the only thing that may enable a route, which is
            // what makes "Save" safe for someone who does not know these providers.
            const route = { ...result.route, enabled: result.ok };
            if (result.ok)
                await upsertRoute(route);
            return { ok: result.ok, route, messages: result.messages };
        }
        catch (err) {
            main_1.default.error('[Auto Switch] Verification handler failed:', err);
            return { ok: false, messages: ['Verification could not be completed. Check the model details and try again.'] };
        }
    });
    electron_1.ipcMain.handle('autoSwitch:reverify-stale', async () => reverifyStaleRoutes());
    // P3-17: Test model connectivity — sends a lightweight HEAD/GET to the model endpoint
    electron_1.ipcMain.handle('storage:test-model-connection', async (_event, model) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const https = require('https');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const http = require('http');
        return new Promise((resolve) => {
            try {
                let urlStr = model.apiUrl;
                // Normalize URL for chat API endpoints
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
                // Add auth header
                if (model.apiKey && model.apiKey !== 'none') {
                    let key = model.apiKey;
                    try {
                        key = cryptoStore.decryptString(model.apiKey);
                    }
                    catch {
                        /* key might not be encrypted */
                    }
                    if (model.provider === 'anthropic') {
                        options.headers = {
                            'x-api-key': key,
                            'anthropic-version': '2025-04-01',
                        };
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
                    // Any response (even 401/403) means the endpoint is reachable
                    if (res.statusCode >= 200 && res.statusCode < 500) {
                        resolve({
                            success: true,
                            status: res.statusCode,
                            message: `Endpoint reachable (HTTP ${res.statusCode})`,
                        });
                    }
                    else {
                        resolve({
                            success: false,
                            status: res.statusCode,
                            error: `Server returned HTTP ${res.statusCode}`,
                        });
                    }
                    res.resume(); // consume response to free memory
                });
                req.setTimeout(10000, () => {
                    req.destroy();
                    resolve({ success: false, error: 'Connection timed out after 10 seconds' });
                });
                req.on('error', (err) => {
                    let message = err.message;
                    if (message.includes('ECONNREFUSED')) {
                        message = 'Connection refused — server may not be running';
                    }
                    else if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
                        message = 'Host not found — check the API URL';
                    }
                    else if (message.includes('CERT') || message.includes('certificate') || message.includes('SSL')) {
                        message = 'SSL/TLS error — try enabling "allowUnauthorized" for self-signed certs';
                    }
                    resolve({ success: false, error: message });
                });
                req.end();
            }
            catch (err) {
                resolve({ success: false, error: `Invalid URL: ${err.message}` });
            }
        });
    });
    // Logs
    electron_1.ipcMain.handle('logs:electron', async () => {
        try {
            const logPath = main_1.default.transports.file.getFile().path;
            const contents = await fs.readFile(logPath, 'utf-8');
            return contents;
        }
        catch (err) {
            return `Failed to read logs: ${String(err)}`;
        }
    });
    // Sidecar extension custom scheme
    electron_1.ipcMain.handle('extensions:send-authorities', async (_event, authorities) => {
        customScheme_1.extensionAuthorities.clear();
        for (const [key, value] of Object.entries(authorities)) {
            customScheme_1.extensionAuthorities.set(key, value);
        }
    });
    // Agent
    electron_1.ipcMain.handle('agent:update-active-count', async (_event, count) => {
        (0, tray_1.updateTrayAgentCount)(count);
    });
    // Window
    electron_1.ipcMain.handle('window:set-title-bar-overlay', async (_event, options) => {
        const win = electron_1.BrowserWindow.getFocusedWindow() || electron_1.BrowserWindow.getAllWindows()[0];
        if (win && process.platform === 'win32') {
            win.setTitleBarOverlay({
                color: options.color,
                symbolColor: options.symbolColor,
                height: 30,
            });
        }
    });
    electron_1.ipcMain.handle('window:minimize', async () => {
        const win = electron_1.BrowserWindow.getFocusedWindow() || electron_1.BrowserWindow.getAllWindows()[0];
        if (win) {
            win.minimize();
        }
    });
    electron_1.ipcMain.handle('window:maximize', async () => {
        const win = electron_1.BrowserWindow.getFocusedWindow() || electron_1.BrowserWindow.getAllWindows()[0];
        if (win) {
            win.maximize();
        }
    });
    electron_1.ipcMain.handle('window:unmaximize', async () => {
        const win = electron_1.BrowserWindow.getFocusedWindow() || electron_1.BrowserWindow.getAllWindows()[0];
        if (win) {
            win.unmaximize();
        }
    });
    electron_1.ipcMain.handle('window:is-maximized', async () => {
        const win = electron_1.BrowserWindow.getFocusedWindow() || electron_1.BrowserWindow.getAllWindows()[0];
        return win ? win.isMaximized() : false;
    });
    electron_1.ipcMain.handle('window:close', async () => {
        const win = electron_1.BrowserWindow.getFocusedWindow() || electron_1.BrowserWindow.getAllWindows()[0];
        if (win) {
            win.close();
        }
    });
    electron_1.ipcMain.handle('window:toggle-devtools', async () => {
        const win = electron_1.BrowserWindow.getFocusedWindow() || electron_1.BrowserWindow.getAllWindows()[0];
        if (win) {
            win.webContents.toggleDevTools();
        }
    });
    // Auto-updater manual check
    electron_1.ipcMain.handle('updater:check-for-updates', () => {
        (0, updater_1.checkForUpdates)(true);
    });
    // Safe external shell launch
    electron_1.ipcMain.handle('shell:open-external', async (_event, url) => {
        if (url.startsWith('https://') || url.startsWith('http://')) {
            await electron_1.shell.openExternal(url);
        }
    });
}
function getCustomModelsPath() {
    return path.join(electron_1.app.getPath('home'), '.gemini', 'antigravity', 'custom_models.json');
}
async function readStoredModels() {
    try {
        const content = await fs.readFile(getCustomModelsPath(), 'utf-8');
        const parsed = JSON.parse(content);
        return parsed.models || [];
    }
    catch {
        return [];
    }
}
async function findStoredModel(modelName) {
    const models = await readStoredModels();
    return models.find((m) => m.name === modelName);
}
async function decryptStoredKey(model) {
    const apiKey = model.apiKey || '';
    if (!apiKey || apiKey === 'none')
        return apiKey;
    try {
        return cryptoStore.decryptString(apiKey);
    }
    catch {
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
async function reverifyStaleRoutes() {
    const filePath = (0, config_1.getAutoSwitchConfigPath)(electron_1.app.getPath('home'));
    const policy = (0, config_1.loadAutoSwitchPolicy)(filePath);
    if (policy.reverifyDays <= 0 || policy.routes.length === 0)
        return { checked: 0, failed: [] };
    const cutoff = Date.now() - policy.reverifyDays * 24 * 60 * 60 * 1000;
    const stale = policy.routes.filter((route) => route.enabled && route.verified.verifiedAt < cutoff);
    if (stale.length === 0)
        return { checked: 0, failed: [] };
    const failed = [];
    for (const route of stale) {
        const model = await findStoredModel(route.id);
        if (!model) {
            failed.push(route.displayName);
            route.enabled = false;
            continue;
        }
        const apiKey = await decryptStoredKey(model);
        const result = await (0, verifier_1.verifyModel)({
            name: model.name,
            displayName: model.displayName,
            provider: model.provider,
            apiKey,
            apiUrl: model.apiUrl,
            externalModelName: model.externalModelName,
            allowUnauthorized: model.allowUnauthorized,
        }, apiKey);
        Object.assign(route, result.route, { enabled: result.ok });
        if (!result.ok)
            failed.push(route.displayName);
    }
    // Turning routing off when nothing verified remains keeps the policy savable
    // and leaves the user on their own model choice instead of a broken route.
    if (!policy.routes.some((route) => route.enabled && route.verified.reachable)) {
        policy.mode = 'off';
        policy.chatMode = 'manual';
        policy.enabled = false;
    }
    (0, config_1.saveAutoSwitchPolicy)(filePath, policy);
    return { checked: stale.length, failed };
}
/**
 * Startup entry point for the optional 30-day re-check.
 *
 * Runs detached and never rejects, because Auto Switch maintenance must not be
 * able to delay or break application launch.
 */
function scheduleAutoSwitchReverification() {
    setTimeout(() => {
        void reverifyStaleRoutes()
            .then(({ checked, failed }) => {
            if (checked === 0)
                return;
            main_1.default.info(`[Auto Switch] Re-verified ${checked} model(s); ${failed.length} failed.`);
            if (failed.length === 0 || !electron_1.Notification.isSupported())
                return;
            new electron_1.Notification({
                title: 'Gravity Auto Switch needs attention',
                body: `${failed.join(', ')} stopped responding and ${failed.length === 1 ? 'was' : 'were'} switched off. Open Customization to verify ${failed.length === 1 ? 'it' : 'them'} again.`,
            }).show();
        })
            .catch((err) => main_1.default.error('[Auto Switch] Scheduled re-verification failed:', err));
    }, 15000).unref?.();
}
/**
 * Stores a freshly verified route without disturbing the user's other settings.
 * Verification results are written immediately so a passing probe is never lost
 * if the window is closed before Save.
 */
async function upsertRoute(route) {
    const filePath = (0, config_1.getAutoSwitchConfigPath)(electron_1.app.getPath('home'));
    const policy = (0, config_1.loadAutoSwitchPolicy)(filePath);
    const index = policy.routes.findIndex((existing) => existing.id === route.id);
    if (index === -1) {
        const highestPriority = policy.routes
            .filter((existing) => existing.tier === route.tier)
            .reduce((highest, existing) => Math.max(highest, existing.priority), 0);
        policy.routes.push({ ...route, priority: highestPriority + 1 });
    }
    else {
        // Verification refreshes facts about the model, never the user's chosen
        // tier, primary, or fallback placement.
        const existing = policy.routes[index];
        policy.routes[index] = { ...route, tier: existing.tier, priority: existing.priority, enabled: existing.enabled };
    }
    (0, config_1.saveAutoSwitchPolicy)(filePath, policy);
}
//# sourceMappingURL=ipcHandlers.js.map