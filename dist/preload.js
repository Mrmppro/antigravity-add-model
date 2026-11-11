"use strict";
/**
 * Preload script — runs in every BrowserWindow before the page loads.
 * Exposes a minimal, secure API via contextBridge so the renderer can
 * communicate with the main-process auto-updater without nodeIntegration.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// ─── API Definitions ─────────────────────────────────────────────────────────
const updaterAPI = {
    onStateChanged: (callback) => {
        const handler = (_event, state) => {
            callback(state);
        };
        electron_1.ipcRenderer.on('updater:state-changed', handler);
        // Return unsubscribe function
        return () => {
            electron_1.ipcRenderer.removeListener('updater:state-changed', handler);
        };
    },
    applyUpdate: () => electron_1.ipcRenderer.invoke('updater:apply'),
    quitAndInstall: () => electron_1.ipcRenderer.invoke('updater:quit-and-install'),
    checkForUpdates: () => electron_1.ipcRenderer.invoke('updater:check-for-updates'),
    getState: () => electron_1.ipcRenderer.invoke('updater:get-state'),
};
const dialogAPI = {
    showOpenDialog: () => electron_1.ipcRenderer.invoke('dialog:open-workspace'),
    showOpenMultipleFolderDialog: () => electron_1.ipcRenderer.invoke('dialog:open-workspaces'),
};
const notificationAPI = {
    send: (options) => electron_1.ipcRenderer.invoke('notification:send', options),
    openSystemPreferences: () => electron_1.ipcRenderer.invoke('notification:open-system-preferences'),
    onClicked: (callback) => {
        const handler = (_event, payload) => {
            callback(payload);
        };
        electron_1.ipcRenderer.on('notification:clicked', handler);
        return () => {
            electron_1.ipcRenderer.removeListener('notification:clicked', handler);
        };
    },
};
const storageAPI = {
    getItems: () => electron_1.ipcRenderer.invoke('storage:get-items'),
    updateItems: (changes) => electron_1.ipcRenderer.invoke('storage:update-items', changes),
    onChanged: (callback) => {
        const handler = (_event, changes) => {
            callback(changes);
        };
        electron_1.ipcRenderer.on('storage:changed', handler);
        return () => {
            electron_1.ipcRenderer.removeListener('storage:changed', handler);
        };
    },
    getCustomModels: () => electron_1.ipcRenderer.invoke('storage:get-custom-models'),
    saveCustomModel: (model) => electron_1.ipcRenderer.invoke('storage:save-custom-model', model),
    deleteCustomModel: (modelName) => electron_1.ipcRenderer.invoke('storage:delete-custom-model', modelName),
    testModelConnection: (model) => electron_1.ipcRenderer.invoke('storage:test-model-connection', model),
    updateProviderKeys: (provider, apiKey) => electron_1.ipcRenderer.invoke('storage:update-provider-keys', provider, apiKey),
};
const autoSwitchAPI = {
    getPolicy: () => electron_1.ipcRenderer.invoke('autoSwitch:get-policy'),
    savePolicy: (policy) => electron_1.ipcRenderer.invoke('autoSwitch:save-policy', policy),
    setEnabled: (enabled) => electron_1.ipcRenderer.invoke('autoSwitch:set-enabled', enabled),
    verifyModel: (modelName) => electron_1.ipcRenderer.invoke('autoSwitch:verify-model', modelName),
    reverifyStale: () => electron_1.ipcRenderer.invoke('autoSwitch:reverify-stale'),
};
const logsAPI = {
    getElectronLogs: () => electron_1.ipcRenderer.invoke('logs:electron'),
};
const extensionsAPI = {
    sendAuthorities: (authoritiesMap) => electron_1.ipcRenderer.invoke('extensions:send-authorities', authoritiesMap),
};
const deepLinkAPI = {
    onDeepLink: (callback) => {
        const handler = (_event, url) => {
            callback(url);
        };
        electron_1.ipcRenderer.on('deep-link', handler);
        return () => {
            electron_1.ipcRenderer.removeListener('deep-link', handler);
        };
    },
    getStoredDeepLink: () => electron_1.ipcRenderer.invoke('deep-link:get-stored'),
};
const agentAPI = {
    updateActiveAgentCount: (count) => electron_1.ipcRenderer.invoke('agent:update-active-count', count),
};
const electronNativeAPI = {
    getZoomLevel: () => electron_1.webFrame.getZoomFactor(),
    getPathForFile: (file) => electron_1.webUtils.getPathForFile(file),
    setTitleBarOverlay: (options) => electron_1.ipcRenderer.invoke('window:set-title-bar-overlay', options),
    minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
    maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
    unmaximize: () => electron_1.ipcRenderer.invoke('window:unmaximize'),
    isMaximized: () => electron_1.ipcRenderer.invoke('window:is-maximized'),
    close: () => electron_1.ipcRenderer.invoke('window:close'),
    toggleDevTools: () => electron_1.ipcRenderer.invoke('window:toggle-devtools'),
    zoomIn: () => {
        void electron_1.ipcRenderer.invoke('window:zoom-in');
    },
    zoomOut: () => {
        void electron_1.ipcRenderer.invoke('window:zoom-out');
    },
    resetZoom: () => {
        void electron_1.ipcRenderer.invoke('window:reset-zoom');
    },
    openExternal: (url) => electron_1.ipcRenderer.invoke('shell:open-external', url),
    revealInFilePicker: (path) => electron_1.ipcRenderer.invoke('shell:reveal-in-file-picker', path),
    showContextMenu: (items) => electron_1.ipcRenderer.invoke('window:show-context-menu', items),
    closeContextMenu: () => electron_1.ipcRenderer.invoke('window:close-context-menu'),
};
const ideAPI = {
    isInstalled: () => electron_1.ipcRenderer.invoke('ide:is-installed'),
};
const wslAPI = {
    getState: () => electron_1.ipcRenderer.invoke('wsl:get-state'),
    connect: (distro) => electron_1.ipcRenderer.invoke('wsl:connect', distro),
};
// ─── Expose all APIs via contextBridge ──────────────────────────────────────
electron_1.contextBridge.exposeInMainWorld('electronUpdater', updaterAPI);
electron_1.contextBridge.exposeInMainWorld('dialog', dialogAPI);
electron_1.contextBridge.exposeInMainWorld('nativeNotifications', notificationAPI);
electron_1.contextBridge.exposeInMainWorld('nativeStorage', storageAPI);
electron_1.contextBridge.exposeInMainWorld('autoSwitch', autoSwitchAPI);
electron_1.contextBridge.exposeInMainWorld('logs', logsAPI);
electron_1.contextBridge.exposeInMainWorld('extensions', extensionsAPI);
electron_1.contextBridge.exposeInMainWorld('deepLink', deepLinkAPI);
electron_1.contextBridge.exposeInMainWorld('agent', agentAPI);
electron_1.contextBridge.exposeInMainWorld('electronNative', electronNativeAPI);
electron_1.contextBridge.exposeInMainWorld('ide', ideAPI);
electron_1.contextBridge.exposeInMainWorld('wsl', wslAPI);
// ─── Custom Models UI Modal (Zero DOM Pollution / On-Demand Only) ───────────
const PROVIDER_ICONS = {
    openai: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    anthropic: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="4" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="5" width="4" height="14" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="17" y="2" width="4" height="20" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>`,
    google: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M12 4a8 8 0 0 1 5.66 13.66L12 12V4z" fill="currentColor" fill-opacity="0.2"/></svg>`,
    ollama: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M8 15c1 1.5 3 2 4 2s3-.5 4-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    openrouter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3"/></svg>`,
    deepseek: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    groq: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    mistral: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="1.5"/><rect x="8.5" y="14" width="7" height="7" stroke="currentColor" stroke-width="1.5"/></svg>`,
    cerebras: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polygon points="12 2 2 19 22 19" stroke="currentColor" stroke-width="1.5"/></svg>`,
    kimi: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.5"/></svg>`,
    fireworks: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="1.5"/></svg>`,
    lmstudio: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>`,
    llamacpp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    nvidia: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 15s3-4 8-4 8 4 8 4-3 4-8 4-8-4-8-4z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="15" r="2" fill="currentColor"/></svg>`,
    custom: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};
const PROVIDER_COLORS = {
    openai: '#10a37f',
    anthropic: '#d97757',
    google: '#4285f4',
    ollama: '#f0f0f0',
    openrouter: '#ff7a45',
    deepseek: '#4d6bfe',
    groq: '#f55036',
    mistral: '#ea580c',
    cerebras: '#ff6b4a',
    kimi: '#06b6d4',
    fireworks: '#f43f5e',
    lmstudio: '#a855f7',
    llamacpp: '#eab308',
    nvidia: '#76b900',
    custom: '#a855f7',
};
const PREFILLED_URLS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    ollama: 'http://localhost:11434/v1/chat/completions',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/anthropic',
    groq: 'https://api.groq.com/openai/v1',
    mistral: 'https://api.mistral.ai/v1',
    cerebras: 'https://api.cerebras.ai/v1',
    kimi: 'https://api.moonshot.ai/anthropic/v1',
    fireworks: 'https://api.fireworks.ai/inference/v1',
    lmstudio: 'http://localhost:1234/v1',
    llamacpp: 'http://localhost:8080/v1',
    nvidia: 'https://integrate.api.nvidia.com/v1',
    custom: '',
};
function getProviderIcon(provider) {
    return PROVIDER_ICONS[provider] || PROVIDER_ICONS.custom;
}
function getProviderColor(provider) {
    return PROVIDER_COLORS[provider] || PROVIDER_COLORS.custom;
}
/**
 * Unified, lag-free custom models modal.
 * Switches smoothly between list and edit views inside a single lightweight card.
 */
function openManageModelsModal(initialView = 'list', modelToEdit) {
    // Remove any stale overlay
    const existing = document.getElementById('agy-models-overlay');
    if (existing)
        existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'agy-models-overlay';
    overlay.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.72);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    opacity: 0;
    transition: opacity 0.15s ease-out;
  `;
    const card = document.createElement('div');
    card.id = 'agy-models-card';
    card.style.cssText = `
    width: 660px;
    max-height: 86vh;
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 14px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    color: #f4f4f5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: scale(0.96) translateY(8px);
    transition: transform 0.15s ease-out;
  `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    // Trigger smooth enter transition
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        card.style.transform = 'scale(1) translateY(0)';
    });
    const closeModal = () => {
        overlay.style.opacity = '0';
        card.style.transform = 'scale(0.96) translateY(8px)';
        setTimeout(() => overlay.remove(), 160);
    };
    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay)
            closeModal();
    });
    // Close on Escape key
    const onKeydown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            window.removeEventListener('keydown', onKeydown);
        }
    };
    window.addEventListener('keydown', onKeydown);
    // ─── Header Elements ────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.style.cssText = `
    padding: 22px 24px 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #27272a;
    flex-shrink: 0;
  `;
    const headerLeft = document.createElement('div');
    headerLeft.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    const iconPill = document.createElement('div');
    iconPill.style.cssText = `
    width: 34px;
    height: 34px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2));
    color: #c084fc;
    border: 1px solid rgba(168, 85, 247, 0.3);
    flex-shrink: 0;
  `;
    iconPill.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
    const headerTitles = document.createElement('div');
    const titleText = document.createElement('h3');
    titleText.style.cssText = 'margin: 0; font-size: 18px; font-weight: 600; color: #f4f4f5; line-height: 1.2;';
    titleText.textContent = 'Custom AI Models';
    const subtitleText = document.createElement('p');
    subtitleText.style.cssText = 'margin: 3px 0 0 0; font-size: 12px; color: #a1a1aa; line-height: 1.3;';
    subtitleText.textContent = 'Manage models routed through the local Antigravity proxy';
    headerTitles.appendChild(titleText);
    headerTitles.appendChild(subtitleText);
    headerLeft.appendChild(iconPill);
    headerLeft.appendChild(headerTitles);
    const headerRight = document.createElement('div');
    headerRight.style.cssText = 'display: flex; align-items: center; gap: 10px;';
    header.appendChild(headerLeft);
    header.appendChild(headerRight);
    card.appendChild(header);
    // ─── Banner Area (Notice / Batch Recovery) ──────────────────────────────────
    const bannerContainer = document.createElement('div');
    bannerContainer.id = 'agy-models-banner';
    bannerContainer.style.cssText = 'display: none; padding: 12px 24px; background-color: #27272a; border-bottom: 1px solid #3f3f46; flex-shrink: 0;';
    card.appendChild(bannerContainer);
    // ─── Body Area ──────────────────────────────────────────────────────────────
    const body = document.createElement('div');
    body.id = 'agy-models-body';
    body.style.cssText = 'padding: 20px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;';
    card.appendChild(body);
    // ─── View Controller ────────────────────────────────────────────────────────
    let cachedModels = [];
    const renderView = async (view, model) => {
        headerRight.innerHTML = '';
        bannerContainer.style.display = 'none';
        bannerContainer.innerHTML = '';
        body.innerHTML = '';
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #a1a1aa;
      cursor: pointer;
      font-size: 22px;
      line-height: 1;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease, background-color 0.15s ease;
    `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = '#f4f4f5';
            closeBtn.style.backgroundColor = '#27272a';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = '#a1a1aa';
            closeBtn.style.backgroundColor = 'transparent';
        });
        closeBtn.addEventListener('click', closeModal);
        if (view === 'list') {
            titleText.textContent = 'Custom AI Models';
            subtitleText.textContent = 'Manage models routed through the local Antigravity proxy';
            const addBtn = document.createElement('button');
            addBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Add Model</span>
      `;
            addBtn.style.cssText = `
        background-color: #3b82f6;
        border: none;
        border-radius: 8px;
        color: #ffffff;
        padding: 7px 14px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.15s ease;
      `;
            addBtn.addEventListener('mouseenter', () => (addBtn.style.backgroundColor = '#2563eb'));
            addBtn.addEventListener('mouseleave', () => (addBtn.style.backgroundColor = '#3b82f6'));
            addBtn.addEventListener('click', () => renderView('edit'));
            headerRight.appendChild(addBtn);
            headerRight.appendChild(closeBtn);
            await renderListView();
        }
        else {
            titleText.textContent = model ? 'Edit Custom Model' : 'Add Custom Model';
            subtitleText.textContent = model ? 'Update model credentials or routing configuration' : 'Configure a new provider model routed through proxy';
            const backBtn = document.createElement('button');
            backBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        <span>Back to Models</span>
      `;
            backBtn.style.cssText = `
        background-color: #27272a;
        border: 1px solid #3f3f46;
        border-radius: 8px;
        color: #f4f4f5;
        padding: 7px 12px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.15s ease;
      `;
            backBtn.addEventListener('mouseenter', () => (backBtn.style.backgroundColor = '#3f3f46'));
            backBtn.addEventListener('mouseleave', () => (backBtn.style.backgroundColor = '#27272a'));
            backBtn.addEventListener('click', () => renderView('list'));
            headerRight.appendChild(backBtn);
            headerRight.appendChild(closeBtn);
            renderEditView(model);
        }
    };
    // ─── List View Renderer ─────────────────────────────────────────────────────
    const renderListView = async () => {
        body.innerHTML = '';
        // Loading indicator
        const loader = document.createElement('div');
        loader.style.cssText = 'display: flex; justify-content: center; align-items: center; padding: 40px; color: #a1a1aa; font-size: 13px; gap: 8px;';
        loader.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: agy-spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <span>Loading models...</span>
      <style>@keyframes agy-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
    `;
        body.appendChild(loader);
        try {
            cachedModels = await storageAPI.getCustomModels();
        }
        catch (e) {
            cachedModels = [];
        }
        loader.remove();
        // Check for models requiring key recovery (e.g. after Antigravity reinstallation)
        const invalidModels = cachedModels.filter((m) => m.keyValid === false);
        if (invalidModels.length > 0) {
            bannerContainer.style.display = 'block';
            bannerContainer.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            bannerContainer.style.borderBottom = '1px solid rgba(245, 158, 11, 0.25)';
            bannerContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; color: #fbbf24; font-size: 13px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span><strong>${invalidModels.length} model key(s)</strong> need re-encryption (Antigravity was reinstalled).</span>
          </div>
          <button id="agy-fix-keys-toggle" style="background-color: #fbbf24; border: none; border-radius: 6px; color: #18181b; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Batch Fix OpenRouter
          </button>
        </div>
        <div id="agy-fix-keys-panel" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(245, 158, 11, 0.2);">
          <div style="display: flex; gap: 8px;">
            <input type="password" id="agy-batch-key-input" placeholder="Paste your OpenRouter API Key (sk-or-v1-...)" style="flex: 1; background-color: #18181b; border: 1px solid #3f3f46; border-radius: 6px; color: #f4f4f5; padding: 6px 10px; font-size: 12px; outline: none;" />
            <button id="agy-batch-key-submit" style="background-color: #22c55e; border: none; border-radius: 6px; color: #18181b; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;">
              Update All
            </button>
          </div>
          <div id="agy-batch-key-msg" style="font-size: 11px; margin-top: 4px; display: none;"></div>
        </div>
      `;
            const toggleBtn = bannerContainer.querySelector('#agy-fix-keys-toggle');
            const panel = bannerContainer.querySelector('#agy-fix-keys-panel');
            const submitBtn = bannerContainer.querySelector('#agy-batch-key-submit');
            const keyInput = bannerContainer.querySelector('#agy-batch-key-input');
            const msgDiv = bannerContainer.querySelector('#agy-batch-key-msg');
            toggleBtn.addEventListener('click', () => {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                if (panel.style.display === 'block')
                    keyInput.focus();
            });
            submitBtn.addEventListener('click', async () => {
                const val = keyInput.value.trim();
                if (!val) {
                    msgDiv.style.display = 'block';
                    msgDiv.style.color = '#ef4444';
                    msgDiv.textContent = 'Please enter your OpenRouter API key';
                    return;
                }
                submitBtn.disabled = true;
                submitBtn.textContent = 'Updating...';
                try {
                    const res = await storageAPI.updateProviderKeys('openrouter', val);
                    if (res.success) {
                        msgDiv.style.display = 'block';
                        msgDiv.style.color = '#22c55e';
                        msgDiv.textContent = `Successfully updated ${res.updatedCount} model(s)!`;
                        setTimeout(() => renderListView(), 800);
                    }
                    else {
                        msgDiv.style.display = 'block';
                        msgDiv.style.color = '#ef4444';
                        msgDiv.textContent = 'Failed: ' + (res.error || 'Unknown error');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Update All';
                    }
                }
                catch (err) {
                    msgDiv.style.display = 'block';
                    msgDiv.style.color = '#ef4444';
                    msgDiv.textContent = 'Error: ' + err.message;
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update All';
                }
            });
        }
        // Search bar if models exist
        if (cachedModels.length > 3) {
            const searchBox = document.createElement('div');
            searchBox.style.cssText = 'position: relative; margin-bottom: 2px;';
            searchBox.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="2" style="position: absolute; left: 12px; top: 11px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="agy-search-input" placeholder="Search models by name or provider..." style="width: 100%; box-sizing: border-box; background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 8px 12px 8px 34px; font-size: 13px; outline: none; transition: border-color 0.15s ease;" />
      `;
            body.appendChild(searchBox);
            const searchInput = searchBox.querySelector('#agy-search-input');
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase().trim();
                const items = itemsContainer.querySelectorAll('.agy-model-row');
                items.forEach((item) => {
                    const text = item.getAttribute('data-search') || '';
                    item.style.display = text.includes(query) ? 'flex' : 'none';
                });
            });
        }
        const itemsContainer = document.createElement('div');
        itemsContainer.id = 'agy-models-items';
        itemsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
        body.appendChild(itemsContainer);
        if (cachedModels.length === 0) {
            itemsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; background-color: #1f1f23; border: 1px dashed #3f3f46; border-radius: 10px; text-align: center;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background-color: #27272a; display: flex; align-items: center; justify-content: center; color: #a1a1aa; margin-bottom: 12px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div style="font-size: 15px; font-weight: 600; color: #f4f4f5; margin-bottom: 4px;">No Custom Models Configured</div>
          <div style="font-size: 13px; color: #a1a1aa; max-width: 380px; margin-bottom: 16px;">Add any OpenAI-compatible, Anthropic, Ollama, or OpenRouter model to use seamlessly inside Antigravity.</div>
          <button id="agy-empty-add-btn" style="background-color: #3b82f6; border: none; border-radius: 8px; color: #ffffff; padding: 8px 18px; font-size: 13px; font-weight: 500; cursor: pointer;">+ Add Your First Model</button>
        </div>
      `;
            itemsContainer.querySelector('#agy-empty-add-btn')?.addEventListener('click', () => renderView('edit'));
            return;
        }
        cachedModels.forEach((model) => {
            const row = document.createElement('div');
            row.className = 'agy-model-row';
            const cleanName = model.displayName || (model.name ? model.name.replace(/^models\//, '') : 'Unknown');
            row.setAttribute('data-search', `${cleanName} ${model.provider} ${model.name}`.toLowerCase());
            row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        background-color: #1f1f23;
        border: 1px solid #27272a;
        border-radius: 9px;
        transition: border-color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease-out, transform 0.15s ease-out;
      `;
            row.addEventListener('mouseenter', () => {
                row.style.borderColor = '#3f3f46';
                row.style.backgroundColor = '#232328';
            });
            row.addEventListener('mouseleave', () => {
                row.style.borderColor = '#27272a';
                row.style.backgroundColor = '#1f1f23';
            });
            // Left info
            const left = document.createElement('div');
            left.style.cssText = 'display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;';
            const iconBox = document.createElement('div');
            const provColor = getProviderColor(model.provider);
            iconBox.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${provColor}18;
        color: ${provColor};
        flex-shrink: 0;
      `;
            iconBox.innerHTML = getProviderIcon(model.provider);
            const infoBox = document.createElement('div');
            infoBox.style.cssText = 'display: flex; flex-direction: column; gap: 3px; min-width: 0;';
            const titleLine = document.createElement('div');
            titleLine.style.cssText = 'display: flex; align-items: center; gap: 7px; min-width: 0;';
            const statusDot = document.createElement('span');
            statusDot.style.cssText = `
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: ${model.keyValid === false ? '#ef4444' : '#71717a'};
        flex-shrink: 0;
      `;
            statusDot.title = model.keyValid === false ? 'API Key needs update' : 'Status unknown (test connection to verify)';
            const nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'font-size: 14px; font-weight: 500; color: #f4f4f5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
            nameSpan.textContent = cleanName;
            titleLine.appendChild(statusDot);
            titleLine.appendChild(nameSpan);
            if (model.keyValid === false) {
                const warnTag = document.createElement('span');
                warnTag.style.cssText = 'font-size: 10px; font-weight: 600; padding: 1px 5px; border-radius: 4px; background-color: rgba(239, 68, 68, 0.2); color: #f87171; white-space: nowrap;';
                warnTag.textContent = 'Key Expired';
                titleLine.appendChild(warnTag);
            }
            const metaLine = document.createElement('div');
            metaLine.style.cssText = 'display: flex; align-items: center; gap: 7px; font-size: 11px; color: #a1a1aa;';
            const providerBadge = document.createElement('span');
            providerBadge.style.cssText = `
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 1px 5px;
        border-radius: 4px;
        background-color: ${provColor}20;
        color: ${provColor};
      `;
            providerBadge.textContent = model.provider;
            const urlSpan = document.createElement('span');
            urlSpan.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #71717a; max-width: 320px;';
            urlSpan.textContent = model.externalModelName || model.apiUrl;
            metaLine.appendChild(providerBadge);
            metaLine.appendChild(urlSpan);
            infoBox.appendChild(titleLine);
            infoBox.appendChild(metaLine);
            left.appendChild(iconBox);
            left.appendChild(infoBox);
            row.appendChild(left);
            // Right actions
            const actions = document.createElement('div');
            actions.style.cssText = 'display: flex; align-items: center; gap: 4px; flex-shrink: 0;';
            // Test button
            const testBtn = document.createElement('button');
            testBtn.title = 'Test connection';
            testBtn.style.cssText = 'background: transparent; border: none; color: #a1a1aa; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;';
            testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
            testBtn.addEventListener('mouseenter', () => {
                testBtn.style.color = '#22c55e';
                testBtn.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
            });
            testBtn.addEventListener('mouseleave', () => {
                testBtn.style.color = '#a1a1aa';
                testBtn.style.backgroundColor = 'transparent';
            });
            testBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                testBtn.disabled = true;
                testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" style="animation: agy-spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>`;
                try {
                    const res = await storageAPI.testModelConnection({
                        name: model.name,
                        apiUrl: model.apiUrl,
                        provider: model.provider,
                        apiKey: model.apiKey,
                        allowUnauthorized: model.allowUnauthorized,
                    });
                    if (res.success) {
                        statusDot.style.backgroundColor = '#22c55e';
                        statusDot.title = res.message || 'Connected';
                        testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
                    }
                    else {
                        statusDot.style.backgroundColor = '#ef4444';
                        statusDot.title = res.error || 'Connection failed';
                        testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
                    }
                }
                catch {
                    statusDot.style.backgroundColor = '#ef4444';
                    testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
                }
                setTimeout(() => {
                    testBtn.disabled = false;
                    testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
                }, 3000);
            });
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.title = 'Edit model';
            editBtn.style.cssText = 'background: transparent; border: none; color: #a1a1aa; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;';
            editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
            editBtn.addEventListener('mouseenter', () => {
                editBtn.style.color = '#38bdf8';
                editBtn.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
            });
            editBtn.addEventListener('mouseleave', () => {
                editBtn.style.color = '#a1a1aa';
                editBtn.style.backgroundColor = 'transparent';
            });
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                renderView('edit', model);
            });
            // Delete button with inline confirmation (NO blocking confirm dialog!)
            const deleteBtn = document.createElement('button');
            deleteBtn.title = 'Delete model';
            deleteBtn.style.cssText = 'background: transparent; border: none; color: #a1a1aa; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;';
            deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
            deleteBtn.addEventListener('mouseenter', () => {
                deleteBtn.style.color = '#ef4444';
                deleteBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            });
            deleteBtn.addEventListener('mouseleave', () => {
                deleteBtn.style.color = '#a1a1aa';
                deleteBtn.style.backgroundColor = 'transparent';
            });
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Morph action area into inline confirmation: Delete? [Yes] [No]
                actions.innerHTML = `
          <span style="font-size: 11px; color: #f87171; font-weight: 500; margin-right: 2px;">Delete?</span>
          <button id="agy-del-yes" style="background-color: #ef4444; border: none; border-radius: 4px; color: white; padding: 3px 8px; font-size: 11px; font-weight: 600; cursor: pointer;">Yes</button>
          <button id="agy-del-no" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 4px; color: #d4d4d8; padding: 3px 8px; font-size: 11px; cursor: pointer;">No</button>
        `;
                actions.querySelector('#agy-del-no')?.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    // Restore normal action buttons
                    actions.innerHTML = '';
                    actions.appendChild(testBtn);
                    actions.appendChild(editBtn);
                    actions.appendChild(deleteBtn);
                });
                actions.querySelector('#agy-del-yes')?.addEventListener('click', async (ev) => {
                    ev.stopPropagation();
                    // Optimistic instant UI update: collapse and remove immediately (0ms perceived latency!)
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(20px)';
                    setTimeout(() => {
                        row.remove();
                        cachedModels = cachedModels.filter((m) => m.name !== model.name);
                        if (cachedModels.length === 0) {
                            renderListView();
                        }
                    }, 150);
                    // Asynchronously perform delete in background
                    try {
                        await storageAPI.deleteCustomModel(model.name);
                    }
                    catch (err) {
                        console.error('Delete model error:', err);
                    }
                });
            });
            actions.appendChild(testBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            row.appendChild(actions);
            itemsContainer.appendChild(row);
        });
    };
    // ─── Edit / Add Form View Renderer ──────────────────────────────────────────
    const renderEditView = (modelToEdit) => {
        body.innerHTML = '';
        const defaultProvider = modelToEdit?.provider || 'openai';
        const form = document.createElement('div');
        form.style.cssText = 'display: flex; flex-direction: column; gap: 14px;';
        form.innerHTML = `
      <!-- Provider Selector -->
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <label style="font-size: 12px; font-weight: 500; color: #a1a1aa;">API Provider</label>
        <select id="agy-f-provider" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 9px 12px; font-size: 13px; outline: none; cursor: pointer;">
          <option value="openai">OpenAI (ChatGPT)</option>
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="google">Google AI Studio (Gemini)</option>
          <option value="openrouter">OpenRouter</option>
          <option value="deepseek">DeepSeek</option>
          <option value="groq">Groq</option>
          <option value="mistral">Mistral</option>
          <option value="cerebras">Cerebras</option>
          <option value="kimi">Kimi (Moonshot)</option>
          <option value="fireworks">Fireworks AI</option>
          <option value="ollama">Ollama (Local)</option>
          <option value="lmstudio">LM Studio (Local)</option>
          <option value="llamacpp">llama.cpp (Local)</option>
          <option value="nvidia">NVIDIA NIM</option>
          <option value="custom">Custom / Other</option>
        </select>
      </div>

      <!-- Model Name / ID -->
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <label style="font-size: 12px; font-weight: 500; color: #a1a1aa;">Model Name / ID <span style="color: #ef4444;">*</span></label>
        <input type="text" id="agy-f-model-id" placeholder="e.g. gpt-4o or anthropic/claude-3.5-sonnet" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 9px 12px; font-size: 13px; outline: none;" required />
        <div id="agy-f-model-err" style="font-size: 11px; color: #ef4444; display: none;"></div>
      </div>

      <!-- Friendly Display Name -->
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <label style="font-size: 12px; font-weight: 500; color: #a1a1aa;">Friendly Display Name (Optional)</label>
        <input type="text" id="agy-f-display-name" placeholder="e.g. Claude 3.5 Sonnet (OpenRouter)" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 9px 12px; font-size: 13px; outline: none;" />
      </div>

      <!-- API Key -->
      <div id="agy-f-key-container" style="display: flex; flex-direction: column; gap: 5px;">
        <label style="font-size: 12px; font-weight: 500; color: #a1a1aa;">API Key <span id="agy-f-key-star" style="color: #ef4444;">*</span></label>
        <div style="position: relative; display: flex; align-items: center;">
          <input type="password" id="agy-f-api-key" placeholder="${modelToEdit ? '•••••••• (leave blank to keep current key)' : 'Enter API key'}" style="width: 100%; box-sizing: border-box; background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 9px 38px 9px 12px; font-size: 13px; outline: none;" />
          <button type="button" id="agy-f-key-toggle" style="position: absolute; right: 10px; background: transparent; border: none; color: #a1a1aa; cursor: pointer; padding: 2px; display: flex; align-items: center;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <!-- API URL -->
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <label style="font-size: 12px; font-weight: 500; color: #a1a1aa;">API URL Endpoint <span style="color: #ef4444;">*</span></label>
        <div style="position: relative; display: flex; align-items: center;">
          <input type="text" id="agy-f-api-url" placeholder="https://api.openai.com/v1/chat/completions" style="width: 100%; box-sizing: border-box; background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 9px 34px 9px 12px; font-size: 13px; outline: none;" required />
          <div id="agy-f-url-dot" style="position: absolute; right: 12px; width: 8px; height: 8px; border-radius: 50%; background-color: #71717a;" title="URL status"></div>
        </div>
        <div id="agy-f-url-err" style="font-size: 11px; color: #ef4444; display: none;"></div>
      </div>

      <!-- Inline Alert Box -->
      <div id="agy-f-alert" style="display: none; padding: 10px 14px; border-radius: 8px; font-size: 12px;"></div>

      <!-- Form Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 14px; border-top: 1px solid #27272a;">
        <button type="button" id="agy-f-btn-test" style="background-color: transparent; border: 1px solid #3f3f46; border-radius: 8px; color: #a1a1aa; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Test Connection</span>
        </button>
        <div style="display: flex; gap: 10px;">
          <button type="button" id="agy-f-btn-cancel" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #e4e4e7; padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer;">Cancel</button>
          <button type="button" id="agy-f-btn-save" style="background-color: #3b82f6; border: none; border-radius: 8px; color: #ffffff; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>${modelToEdit ? 'Update Model' : 'Save Model'}</span>
          </button>
        </div>
      </div>
    `;
        body.appendChild(form);
        const providerSel = form.querySelector('#agy-f-provider');
        const modelIdInput = form.querySelector('#agy-f-model-id');
        const nameInput = form.querySelector('#agy-f-display-name');
        const keyContainer = form.querySelector('#agy-f-key-container');
        const keyInput = form.querySelector('#agy-f-api-key');
        const keyToggle = form.querySelector('#agy-f-key-toggle');
        const keyStar = form.querySelector('#agy-f-key-star');
        const urlInput = form.querySelector('#agy-f-api-url');
        const urlDot = form.querySelector('#agy-f-url-dot');
        const alertBox = form.querySelector('#agy-f-alert');
        const modelErr = form.querySelector('#agy-f-model-err');
        const urlErr = form.querySelector('#agy-f-url-err');
        const testBtn = form.querySelector('#agy-f-btn-test');
        const cancelBtn = form.querySelector('#agy-f-btn-cancel');
        const saveBtn = form.querySelector('#agy-f-btn-save');
        // Toggle password visibility
        keyToggle.addEventListener('click', () => {
            keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
        });
        const updateUrlValidation = () => {
            const val = urlInput.value.trim();
            if (!val) {
                urlDot.style.backgroundColor = '#71717a';
                return;
            }
            try {
                const u = new URL(val);
                if (['http:', 'https:'].includes(u.protocol)) {
                    urlDot.style.backgroundColor = '#22c55e';
                    urlErr.style.display = 'none';
                }
                else {
                    urlDot.style.backgroundColor = '#fbbf24';
                }
            }
            catch {
                urlDot.style.backgroundColor = '#ef4444';
            }
        };
        urlInput.addEventListener('input', updateUrlValidation);
        // Auto-strip models/ prefix on model input
        modelIdInput.addEventListener('input', () => {
            if (modelIdInput.value.startsWith('models/')) {
                modelIdInput.value = modelIdInput.value.replace(/^models\//, '');
            }
            modelErr.style.display = 'none';
            if (providerSel.value === 'google') {
                const mid = modelIdInput.value.trim() || 'model-name';
                urlInput.value = `https://generativelanguage.googleapis.com/v1beta/models/${mid}:generateContent`;
                updateUrlValidation();
            }
        });
        // Provider select change
        providerSel.addEventListener('change', () => {
            const p = providerSel.value;
            if (p === 'ollama') {
                keyContainer.style.display = 'none';
                keyInput.value = '';
                keyStar.style.display = 'none';
            }
            else {
                keyContainer.style.display = 'flex';
                keyStar.style.display = modelToEdit ? 'none' : 'inline';
            }
            if (p === 'google') {
                const mid = modelIdInput.value.trim() || 'gemini-2.0-flash';
                urlInput.value = `https://generativelanguage.googleapis.com/v1beta/models/${mid}:generateContent`;
            }
            else {
                urlInput.value = PREFILLED_URLS[p] || '';
            }
            updateUrlValidation();
        });
        // Prepopulate if editing
        if (modelToEdit) {
            providerSel.value = modelToEdit.provider;
            const cleanMid = modelToEdit.externalModelName || modelToEdit.name.replace(/^models\//, '');
            modelIdInput.value = cleanMid;
            nameInput.value = modelToEdit.displayName || '';
            urlInput.value = modelToEdit.apiUrl || '';
            keyInput.value = '';
            keyStar.style.display = 'none';
            if (modelToEdit.provider === 'ollama') {
                keyContainer.style.display = 'none';
            }
            updateUrlValidation();
        }
        else {
            providerSel.value = defaultProvider;
            urlInput.value = PREFILLED_URLS[defaultProvider] || '';
            updateUrlValidation();
        }
        cancelBtn.addEventListener('click', () => renderView('list'));
        // Live test inside form
        testBtn.addEventListener('click', async () => {
            const p = providerSel.value;
            const u = urlInput.value.trim();
            const k = keyInput.value.trim() || (modelToEdit ? modelToEdit.apiKey : undefined);
            if (!u) {
                alertBox.style.display = 'block';
                alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                alertBox.style.color = '#ef4444';
                alertBox.textContent = 'Please enter an API URL endpoint before testing';
                return;
            }
            testBtn.disabled = true;
            testBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: agy-spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        <span>Testing...</span>
      `;
            try {
                const res = await storageAPI.testModelConnection({
                    name: modelToEdit?.name,
                    apiUrl: u,
                    provider: p,
                    apiKey: k,
                });
                alertBox.style.display = 'block';
                if (res.success) {
                    alertBox.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
                    alertBox.style.color = '#22c55e';
                    alertBox.textContent = res.message || 'Connection successful! Endpoint is reachable.';
                }
                else {
                    alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                    alertBox.style.color = '#ef4444';
                    alertBox.textContent = 'Connection test failed: ' + (res.error || 'Server returned error status');
                }
            }
            catch (err) {
                alertBox.style.display = 'block';
                alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                alertBox.style.color = '#ef4444';
                alertBox.textContent = 'Connection error: ' + err.message;
            }
            finally {
                testBtn.disabled = false;
                testBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Test Connection</span>
        `;
            }
        });
        // Save Model
        saveBtn.addEventListener('click', async () => {
            const p = providerSel.value;
            const rawModelId = modelIdInput.value.trim().replace(/^models\//, '');
            let displayName = nameInput.value.trim();
            const apiKey = keyInput.value.trim();
            const apiUrl = urlInput.value.trim();
            alertBox.style.display = 'none';
            modelErr.style.display = 'none';
            urlErr.style.display = 'none';
            let hasError = false;
            if (!rawModelId) {
                modelErr.textContent = 'Model identifier is required';
                modelErr.style.display = 'block';
                hasError = true;
            }
            else if (!/^[a-zA-Z0-9._/:-]+$/.test(rawModelId)) {
                modelErr.textContent = 'Only letters, numbers, hyphens, underscores, dots, colons, or slashes';
                modelErr.style.display = 'block';
                hasError = true;
            }
            if (p !== 'ollama' && !apiKey && !modelToEdit) {
                alertBox.style.display = 'block';
                alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                alertBox.style.color = '#ef4444';
                alertBox.textContent = 'API Key is required for ' + p;
                hasError = true;
            }
            if (!apiUrl) {
                urlErr.textContent = 'API URL endpoint is required';
                urlErr.style.display = 'block';
                hasError = true;
            }
            else {
                try {
                    const u = new URL(apiUrl);
                    if (!['http:', 'https:'].includes(u.protocol)) {
                        urlErr.textContent = 'Endpoint must start with http:// or https://';
                        urlErr.style.display = 'block';
                        hasError = true;
                    }
                }
                catch {
                    urlErr.textContent = 'Invalid URL format';
                    urlErr.style.display = 'block';
                    hasError = true;
                }
            }
            if (hasError)
                return;
            if (!displayName) {
                displayName = rawModelId;
            }
            const payload = {
                name: 'models/' + rawModelId,
                displayName: displayName,
                description: `${displayName} custom model routed through local proxy`,
                provider: p,
                apiKey: apiKey || (modelToEdit ? modelToEdit.apiKey : 'none'),
                apiUrl: apiUrl,
                externalModelName: rawModelId,
                originalModelName: modelToEdit ? modelToEdit.name : undefined,
            };
            saveBtn.disabled = true;
            saveBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: agy-spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        <span>Saving...</span>
      `;
            try {
                const res = await storageAPI.saveCustomModel(payload);
                if (res && res.success) {
                    // Instantly switch back to the models list view
                    renderView('list');
                }
                else {
                    alertBox.style.display = 'block';
                    alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                    alertBox.style.color = '#ef4444';
                    alertBox.textContent = 'Failed to save model: ' + (res?.error || 'Unknown error');
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = `<span>${modelToEdit ? 'Update Model' : 'Save Model'}</span>`;
                }
            }
            catch (err) {
                alertBox.style.display = 'block';
                alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                alertBox.style.color = '#ef4444';
                alertBox.textContent = 'Error saving model: ' + err.message;
                saveBtn.disabled = false;
                saveBtn.innerHTML = `<span>${modelToEdit ? 'Update Model' : 'Save Model'}</span>`;
            }
        });
    };
    // Start with requested initial view
    renderView(initialView, modelToEdit);
}
function openAddModelModal(modelToEdit) {
    openManageModelsModal('edit', modelToEdit);
}
function cleanInvasiveUI() {
    const ids = [
        'agy-chat-auto-switch',
        'agy-auto-switch-card',
        'agy-floating-models-btn',
        'agy-custom-models-section',
        'agy-manage-models-overlay',
        'agy-modal-overlay',
    ];
    for (const id of ids) {
        const el = document.getElementById(id);
        if (el)
            el.remove();
    }
}
// Ensure application DOM remains 100% pure default with zero injected UI elements
window.addEventListener('DOMContentLoaded', () => {
    cleanInvasiveUI();
});
// Global keyboard shortcut: Ctrl+Alt+M / Cmd+Option+M opens Custom Models modal on-demand only
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && !e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        openManageModelsModal('list');
    }
});
// Main-process IPC listener to open Custom Models modal on-demand (from Tray or App Menu)
electron_1.ipcRenderer.on('open-custom-models-modal', () => {
    openManageModelsModal('list');
});
// Global window helpers (callable from DevTools or menu without modifying DOM)
window.openCustomModelsModal = openManageModelsModal;
window.openAddModelModal = openAddModelModal;
//# sourceMappingURL=preload.js.map