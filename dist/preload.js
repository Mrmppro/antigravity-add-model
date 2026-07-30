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
    setTitleBarOverlay: (options) => electron_1.ipcRenderer.invoke('window:set-title-bar-overlay', options),
    minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
    maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
    unmaximize: () => electron_1.ipcRenderer.invoke('window:unmaximize'),
    isMaximized: () => electron_1.ipcRenderer.invoke('window:is-maximized'),
    close: () => electron_1.ipcRenderer.invoke('window:close'),
    toggleDevTools: () => electron_1.ipcRenderer.invoke('window:toggle-devtools'),
    zoomIn: () => {
        const current = electron_1.webFrame.getZoomLevel();
        electron_1.webFrame.setZoomLevel(current + 0.5);
    },
    zoomOut: () => {
        const current = electron_1.webFrame.getZoomLevel();
        electron_1.webFrame.setZoomLevel(current - 0.5);
    },
    resetZoom: () => {
        electron_1.webFrame.setZoomLevel(0);
    },
    openExternal: (url) => electron_1.ipcRenderer.invoke('shell:open-external', url),
    revealInFilePicker: (path) => electron_1.ipcRenderer.invoke('shell:reveal-in-file-picker', path),
};
const ideAPI = {
    isInstalled: () => electron_1.ipcRenderer.invoke('ide:is-installed'),
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
// ─── Custom Models UI Injection ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    function findRefreshButton() {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find((b) => b.textContent?.trim() === 'Refresh') || null;
    }
    function findCustomizationSectionContainer() {
        const refreshBtn = findRefreshButton();
        if (refreshBtn?.parentElement?.parentElement?.parentNode) {
            const headerRow = refreshBtn.parentElement.parentElement;
            return {
                mainContainer: headerRow.parentNode,
                headerRow,
                contentBlock: headerRow.nextElementSibling,
            };
        }
        const customizationMarker = Array.from(document.querySelectorAll('[aria-label], [data-testid], h1, h2, h3, [role="heading"]'))
            .find((element) => /^(customization|custom models|mcp|skills)$/i.test((element.textContent || '').trim()));
        if (!customizationMarker)
            return null;
        const headerRow = customizationMarker.closest('section, [role="region"], div') || customizationMarker.parentElement;
        const mainContainer = headerRow?.parentNode;
        if (!headerRow || !mainContainer)
            return null;
        return {
            mainContainer,
            headerRow,
            contentBlock: headerRow.nextElementSibling,
        };
    }
    // ─── Provider Icons & Status Helpers ──────────────────────────────
    const PROVIDER_ICONS = {
        openai: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
        anthropic: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="4" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="5" width="4" height="14" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="17" y="2" width="4" height="20" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>`,
        google: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M12 4a8 8 0 0 1 5.66 13.66L12 12V4z" fill="currentColor" fill-opacity="0.2"/></svg>`,
        ollama: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M8 15c1 1.5 3 2 4 2s3-.5 4-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
        openrouter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3"/></svg>`,
        custom: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    };
    const PROVIDER_COLORS = {
        openai: '#10a37f',
        anthropic: '#d97757',
        google: '#4285f4',
        ollama: '#f0f0f0',
        openrouter: '#ff7a45',
        custom: '#a855f7',
    };
    function getProviderIcon(provider) {
        return PROVIDER_ICONS[provider] || PROVIDER_ICONS.custom;
    }
    function getProviderColor(provider) {
        return PROVIDER_COLORS[provider] || PROVIDER_COLORS.custom;
    }
    async function renderCustomModelsList() {
        const contentArea = document.getElementById('agy-custom-models-content');
        if (!contentArea)
            return;
        contentArea.innerHTML = '';
        try {
            const models = await storageAPI.getCustomModels();
            if (!models || models.length === 0) {
                const placeholder = document.createElement('div');
                placeholder.style.display = 'flex';
                placeholder.style.flexDirection = 'column';
                placeholder.style.alignItems = 'center';
                placeholder.style.justifyContent = 'center';
                placeholder.style.padding = '24px';
                placeholder.style.backgroundColor = '#18181b';
                placeholder.style.border = '1px solid #27272a';
                placeholder.style.borderRadius = '8px';
                placeholder.style.textAlign = 'center';
                placeholder.innerHTML = `
                    <div style="font-size: 15px; font-weight: 600; color: #f4f4f5; margin-bottom: 4px;">No Custom Models</div>
                    <div style="font-size: 13px; color: #a1a1aa;">You currently don't have any custom models installed. Add a custom model above.</div>
                `;
                contentArea.appendChild(placeholder);
            }
            else {
                models.forEach((model) => {
                    const item = document.createElement('div');
                    item.style.display = 'flex';
                    item.style.justifyContent = 'space-between';
                    item.style.alignItems = 'center';
                    item.style.padding = '12px 16px';
                    item.style.backgroundColor = '#18181b';
                    item.style.border = '1px solid #27272a';
                    item.style.borderRadius = '8px';
                    item.style.transition = 'border-color 0.15s ease, background-color 0.15s ease';
                    item.style.marginBottom = '8px';
                    item.addEventListener('mouseenter', () => {
                        item.style.borderColor = '#3f3f46';
                        item.style.backgroundColor = '#1c1c1f';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.borderColor = '#27272a';
                        item.style.backgroundColor = '#18181b';
                    });
                    // ─── Left: Provider icon + model info ────────────
                    const left = document.createElement('div');
                    left.style.display = 'flex';
                    left.style.alignItems = 'center';
                    left.style.gap = '12px';
                    // Provider icon bubble
                    const iconWrapper = document.createElement('div');
                    iconWrapper.style.width = '32px';
                    iconWrapper.style.height = '32px';
                    iconWrapper.style.borderRadius = '8px';
                    iconWrapper.style.display = 'flex';
                    iconWrapper.style.alignItems = 'center';
                    iconWrapper.style.justifyContent = 'center';
                    iconWrapper.style.backgroundColor = getProviderColor(model.provider) + '18';
                    iconWrapper.style.color = getProviderColor(model.provider);
                    iconWrapper.style.flexShrink = '0';
                    iconWrapper.innerHTML = getProviderIcon(model.provider);
                    // Text info
                    const info = document.createElement('div');
                    info.style.display = 'flex';
                    info.style.flexDirection = 'column';
                    info.style.gap = '2px';
                    // Title row with status dot
                    const titleRow = document.createElement('div');
                    titleRow.style.display = 'flex';
                    titleRow.style.alignItems = 'center';
                    titleRow.style.gap = '6px';
                    // Status indicator dot
                    const statusDot = document.createElement('span');
                    statusDot.style.width = '6px';
                    statusDot.style.height = '6px';
                    statusDot.style.borderRadius = '50%';
                    statusDot.style.flexShrink = '0';
                    statusDot.style.backgroundColor = '#71717a'; // neutral = unknown
                    statusDot.title = 'Connection status unknown (test to verify)';
                    statusDot.style.transition = 'background-color 0.3s ease';
                    const title = document.createElement('div');
                    title.style.fontSize = '14px';
                    title.style.fontWeight = '500';
                    title.style.color = '#f4f4f5';
                    title.textContent = model.displayName || model.name;
                    titleRow.appendChild(statusDot);
                    titleRow.appendChild(title);
                    // Subtitle with provider badge
                    const sub = document.createElement('div');
                    sub.style.fontSize = '12px';
                    sub.style.color = '#a1a1aa';
                    sub.style.display = 'flex';
                    sub.style.alignItems = 'center';
                    sub.style.gap = '8px';
                    // Provider badge
                    const badge = document.createElement('span');
                    badge.style.fontSize = '10px';
                    badge.style.fontWeight = '600';
                    badge.style.textTransform = 'uppercase';
                    badge.style.letterSpacing = '0.5px';
                    badge.style.padding = '2px 6px';
                    badge.style.borderRadius = '4px';
                    badge.style.backgroundColor = getProviderColor(model.provider) + '22';
                    badge.style.color = getProviderColor(model.provider);
                    badge.textContent = model.provider;
                    sub.appendChild(badge);
                    sub.appendChild(document.createTextNode(model.apiUrl));
                    info.appendChild(titleRow);
                    info.appendChild(sub);
                    left.appendChild(iconWrapper);
                    left.appendChild(info);
                    // ─── Right: Action buttons ──────────────────
                    const actions = document.createElement('div');
                    actions.style.display = 'flex';
                    actions.style.gap = '4px';
                    actions.style.alignItems = 'center';
                    // Test Connection button
                    const testBtn = document.createElement('button');
                    testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
                    testBtn.style.background = 'transparent';
                    testBtn.style.border = 'none';
                    testBtn.style.color = '#a1a1aa';
                    testBtn.style.cursor = 'pointer';
                    testBtn.style.padding = '6px';
                    testBtn.style.borderRadius = '4px';
                    testBtn.style.display = 'flex';
                    testBtn.style.alignItems = 'center';
                    testBtn.style.justifyContent = 'center';
                    testBtn.style.transition = 'color 0.15s ease, background-color 0.15s ease';
                    testBtn.title = 'Test connection';
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
                        // Show loading spinner
                        const originalHtml = testBtn.innerHTML;
                        testBtn.style.color = '#fbbf24';
                        testBtn.style.cursor = 'wait';
                        testBtn.disabled = true;
                        testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`;
                        try {
                            const result = await storageAPI.testModelConnection({
                                apiUrl: model.apiUrl,
                                provider: model.provider,
                                apiKey: model.apiKey,
                                allowUnauthorized: model.allowUnauthorized,
                            });
                            if (result.success) {
                                statusDot.style.backgroundColor = '#22c55e'; // green
                                statusDot.title = result.message || 'Connected';
                                testBtn.title = 'Connected ✓';
                                testBtn.style.color = '#22c55e';
                                testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
                            }
                            else {
                                statusDot.style.backgroundColor = '#ef4444'; // red
                                const errMsg = result.error || 'Connection failed';
                                statusDot.title = errMsg;
                                testBtn.title = errMsg;
                                testBtn.style.color = '#ef4444';
                                testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
                            }
                        }
                        catch (err) {
                            statusDot.style.backgroundColor = '#ef4444';
                            statusDot.title = 'Connection test failed';
                            testBtn.title = 'Connection test failed';
                            testBtn.style.color = '#ef4444';
                            testBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
                        }
                        testBtn.style.cursor = 'pointer';
                        // Reset to neutral after 3 seconds
                        setTimeout(() => {
                            testBtn.disabled = false;
                            testBtn.style.cursor = 'pointer';
                            testBtn.style.color = '#a1a1aa';
                            testBtn.style.borderColor = '#3f3f46';
                            testBtn.innerHTML = originalHtml;
                        }, 3000);
                    });
                    // Delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    `;
                    deleteBtn.style.background = 'transparent';
                    deleteBtn.style.border = 'none';
                    deleteBtn.style.color = '#a1a1aa';
                    deleteBtn.style.cursor = 'pointer';
                    deleteBtn.style.padding = '6px';
                    deleteBtn.style.borderRadius = '4px';
                    deleteBtn.style.display = 'flex';
                    deleteBtn.style.alignItems = 'center';
                    deleteBtn.style.justifyContent = 'center';
                    deleteBtn.style.transition = 'color 0.15s ease, background-color 0.15s ease';
                    deleteBtn.addEventListener('mouseenter', () => {
                        deleteBtn.style.color = '#ef4444';
                        deleteBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    });
                    deleteBtn.addEventListener('mouseleave', () => {
                        deleteBtn.style.color = '#a1a1aa';
                        deleteBtn.style.backgroundColor = 'transparent';
                    });
                    deleteBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete the model "${model.displayName || model.name}"?`)) {
                            await storageAPI.deleteCustomModel(model.name);
                            await renderCustomModelsList();
                            const refreshBtn = findRefreshButton();
                            if (refreshBtn)
                                refreshBtn.click();
                        }
                    });
                    actions.appendChild(testBtn);
                    actions.appendChild(deleteBtn);
                    item.appendChild(left);
                    item.appendChild(actions);
                    contentArea.appendChild(item);
                });
            }
        }
        catch (err) {
            console.error('Failed to load custom models in list:', err);
        }
    }
    async function renderAutoSwitchCard(section) {
        if (document.getElementById('agy-auto-switch-card'))
            return;
        const existingThemeStyles = document.getElementById('agy-auto-switch-theme');
        if (!existingThemeStyles) {
            const themeStyles = document.createElement('style');
            themeStyles.id = 'agy-auto-switch-theme';
            themeStyles.textContent = `
        #agy-auto-switch-card {
          --agy-bg: var(--vscode-editorWidget-background, var(--vscode-editor-background, Canvas));
          --agy-fg: var(--vscode-foreground, CanvasText);
          --agy-muted: var(--vscode-descriptionForeground, var(--vscode-foreground, CanvasText));
          --agy-border: var(--vscode-widget-border, var(--vscode-panel-border, GrayText));
          --agy-accent: var(--vscode-focusBorder, Highlight);
          display: flex; flex-direction: column; gap: 14px; padding: 18px;
          color: var(--agy-fg); background: var(--agy-bg); border: 1px solid var(--agy-border);
          border-left: 4px solid var(--agy-accent); border-radius: 10px; box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
          color-scheme: light dark;
        }
        #agy-auto-switch-card *, #agy-auto-switch-card option { color: inherit; }
        #agy-auto-switch-card .agy-auto-description, #agy-auto-switch-card .agy-auto-label,
        #agy-auto-switch-card .agy-auto-status { color: var(--agy-muted) !important; }
        #agy-auto-switch-card .agy-auto-control {
          min-height: 34px; padding: 7px 9px; background: var(--vscode-input-background, Field);
          color: var(--vscode-input-foreground, FieldText) !important; border: 1px solid var(--vscode-input-border, var(--agy-border));
          border-radius: 6px;
        }
        #agy-auto-switch-card .agy-auto-control:focus-visible {
          outline: 2px solid var(--agy-accent); outline-offset: 2px;
        }
        #agy-auto-switch-card .agy-auto-button { cursor: pointer; color: var(--vscode-button-secondaryForeground, var(--agy-fg)) !important; background: var(--vscode-button-secondaryBackground, ButtonFace); }
        #agy-auto-switch-card .agy-auto-button:hover { background: var(--vscode-button-secondaryHoverBackground, var(--vscode-list-hoverBackground, ButtonFace)); }
        #agy-auto-switch-card .agy-auto-primary { color: var(--vscode-button-foreground, ButtonText) !important; background: var(--vscode-button-background, Highlight); border-color: var(--vscode-button-background, Highlight); }
        #agy-auto-switch-card .agy-auto-primary:hover { background: var(--vscode-button-hoverBackground, Highlight); }
        #agy-auto-switch-card .agy-auto-status-pill { color: var(--vscode-badge-foreground, var(--agy-fg)) !important; background: var(--vscode-badge-background, var(--vscode-editorWidget-background, Canvas)); border: 1px solid var(--agy-border); border-radius: 999px; padding: 4px 8px; }
        #agy-auto-switch-card .agy-auto-credit { color: var(--vscode-textLink-foreground, var(--agy-accent)) !important; text-decoration: none; }
        #agy-auto-switch-card .agy-auto-credit:hover { color: var(--vscode-textLink-activeForeground, var(--agy-accent)) !important; text-decoration: underline; }
        #agy-auto-switch-card .agy-auto-credit:focus-visible { outline: 2px solid var(--agy-accent); outline-offset: 2px; }
        #agy-auto-switch-card input[type="checkbox"] { accent-color: var(--agy-accent); width: 16px; height: 16px; }
        #agy-auto-switch-card .agy-auto-tier-select { min-width: 148px; }
        #agy-auto-switch-card .agy-auto-priority { display:flex; align-items:center; gap:5px; font-size:11px; white-space:nowrap; }
        #agy-auto-switch-card .agy-auto-order-button { min-height:28px; min-width:30px; padding:3px 7px; }
        @media (forced-colors: active) { #agy-auto-switch-card { border: 2px solid CanvasText; box-shadow: none; } }
      `;
            document.head.appendChild(themeStyles);
        }
        const card = document.createElement('section');
        card.id = 'agy-auto-switch-card';
        card.setAttribute('aria-label', 'Gravity Auto Switch settings');
        card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
        <div>
          <div style="font-size:15px; font-weight:700;">Gravity Auto Switch</div>
          <div class="agy-auto-description" style="margin-top:4px; font-size:12px; line-height:1.5;">Auto Switch picks the cheapest of <strong>your own</strong> API models that can finish each request. Google models are always used exactly as you select them and are never changed.</div>
          <a id="agy-auto-mrmp-pro-link" class="agy-auto-credit" href="https://mrmp.pro" target="_blank" rel="noopener noreferrer" aria-label="Visit MR MP PRO" style="display:inline-block; margin-top:7px; font-size:11px; font-weight:700; letter-spacing:.04em;">MR MP PRO ↗</a>
        </div>
        <span id="agy-auto-enabled-label" class="agy-auto-status-pill" aria-live="polite">Checking status…</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:end;">
        <label class="agy-auto-label" style="display:flex; flex-direction:column; gap:5px; font-size:12px; min-width:260px;">How should Auto Switch spend your money?
          <select id="agy-auto-mode" aria-label="Gravity Auto Switch spending mode" class="agy-auto-control">
            <option value="off">Off — always use the model I picked</option>
            <option value="budget">Budget friendly — cheapest model that can do the job</option>
            <option value="balanced">Balanced — mid-priced by default, strong only when needed</option>
            <option value="max-performance">Max performance — strongest for real work, cheap for trivial steps</option>
          </select>
        </label>
        <button id="agy-auto-enable" type="button" class="agy-auto-control agy-auto-button agy-auto-primary">Turn on Auto Switch</button>
        <button id="agy-auto-turn-off" type="button" class="agy-auto-control agy-auto-button">Turn off Auto Switch</button>
      </div>
      <label class="agy-auto-label" style="display:flex; align-items:center; gap:8px; font-size:12px;">
        <input id="agy-auto-prefer-local" type="checkbox" aria-label="Prefer my local model when it can handle the request" />
        Prefer my local model when it can handle the request (costs nothing)
      </label>
      <label class="agy-auto-label" style="display:flex; align-items:center; gap:8px; font-size:12px;">
        <input id="agy-auto-reverify" type="checkbox" aria-label="Re-check my models every 30 days" />
        Re-check my models every 30 days and tell me if one stops working
      </label>
       <div>
         <div class="agy-auto-label" style="font-size:12px; font-weight:600; margin-bottom:4px;">Your models</div>
         <div class="agy-auto-description" style="font-size:11px; line-height:1.45; margin-bottom:7px;">Choose what each verified model is for. Spending mode chooses the tier; <strong>Primary</strong> is tried first and later models are fallbacks.</div>
         <div id="agy-auto-model-rows" style="display:flex; flex-direction:column; gap:8px;"></div>
       </div>
      <div id="agy-auto-status" role="status" class="agy-auto-status" style="font-size:12px; font-weight:500;">Loading routing status…</div>
    `;
        section.prepend(card);
        const enabledLabel = card.querySelector('#agy-auto-enabled-label');
        const enableButton = card.querySelector('#agy-auto-enable');
        const turnOffButton = card.querySelector('#agy-auto-turn-off');
        const modeSelect = card.querySelector('#agy-auto-mode');
        const preferLocalInput = card.querySelector('#agy-auto-prefer-local');
        const reverifyInput = card.querySelector('#agy-auto-reverify');
        const modelRows = card.querySelector('#agy-auto-model-rows');
        const status = card.querySelector('#agy-auto-status');
        const models = await storageAPI.getCustomModels();
        /** Google models cannot be Auto Switch targets, so they are not offered here. */
        const routableModels = models.filter((model) => (model.provider || '').toLowerCase() !== 'google');
        const TIER_LABELS = {
            cheap: 'Cheap',
            mid: 'Mid-priced',
            strong: 'Strong',
        };
        const describeRoute = (route) => {
            if (!route || route.verified.verifiedAt === 0) {
                return route?.verified.lastError
                    ? `Not usable yet — ${route.verified.lastError}`
                    : 'Not checked yet — press Verify before Auto Switch can use it.';
            }
            const parts = [`${TIER_LABELS[route.tier] || route.tier} tier`];
            parts.push(route.verified.tools ? 'tools confirmed' : 'no tool support');
            if (route.isLocal)
                parts.push('runs locally');
            if (route.verified.contextLimit)
                parts.push(`${route.verified.contextLimit.toLocaleString()} token limit`);
            return `Verified — ${parts.join(', ')}.`;
        };
        /**
         * Saves a change and repaints. Every write goes through the main process
         * validator, so an unverified model can never end up as a live route.
         */
        const update = async (changes) => {
            try {
                const current = await autoSwitchAPI.getPolicy();
                const saved = await autoSwitchAPI.savePolicy({ ...current, ...changes });
                paint(saved);
            }
            catch (error) {
                status.textContent = `Could not save Gravity Auto settings: ${error instanceof Error ? error.message : 'unknown error'}`;
            }
        };
        const paint = (policy) => {
            const usable = policy.routes.filter((route) => route.enabled && route.verified.reachable);
            enabledLabel.textContent = policy.enabled ? 'Status: Active' : 'Status: Off';
            enableButton.disabled = policy.enabled || usable.length === 0 || policy.mode === 'off';
            turnOffButton.disabled = !policy.enabled;
            modeSelect.value = policy.mode;
            preferLocalInput.checked = policy.preferLocal;
            reverifyInput.checked = policy.reverifyDays > 0;
            modelRows.replaceChildren();
            if (routableModels.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'agy-auto-status';
                empty.style.fontSize = '11px';
                empty.textContent = 'Add a model with Add Model above, then press Verify to let Auto Switch use it.';
                modelRows.appendChild(empty);
            }
            const normalizeTierPriorities = (routes) => {
                for (const tier of ['cheap', 'mid', 'strong']) {
                    const ordered = routes
                        .filter((candidate) => candidate.tier === tier)
                        .sort((left, right) => left.priority - right.priority || left.displayName.localeCompare(right.displayName));
                    ordered.forEach((candidate, index) => {
                        candidate.priority = index + 1;
                    });
                }
            };
            for (const model of routableModels) {
                const route = policy.routes.find((candidate) => candidate.id === model.name);
                const row = document.createElement('div');
                row.style.cssText =
                    'display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:9px 10px; border:1px solid var(--agy-border); border-radius:8px;';
                const useLabel = document.createElement('label');
                useLabel.style.cssText = 'display:flex; align-items:center; gap:5px; font-size:11px; white-space:nowrap;';
                const useToggle = document.createElement('input');
                useToggle.type = 'checkbox';
                useToggle.id = `agy-auto-use-${model.name.replace(/[^a-z0-9]+/gi, '-')}`;
                useToggle.setAttribute('aria-label', `Include ${model.displayName || model.name} in Auto Switch`);
                useToggle.disabled = !route?.verified.reachable;
                useToggle.checked = route?.enabled === true;
                useLabel.append(useToggle, document.createTextNode('Include in Auto'));
                const nameAndDetail = document.createElement('div');
                nameAndDetail.style.cssText = 'flex:1 1 190px; min-width:160px;';
                const name = document.createElement('div');
                name.style.cssText = 'font-size:12px; font-weight:600;';
                name.textContent = model.displayName || model.name;
                const detail = document.createElement('div');
                detail.className = 'agy-auto-status';
                detail.style.cssText = 'margin-top:2px; font-size:11px; line-height:1.4;';
                detail.textContent = describeRoute(route);
                nameAndDetail.append(name, detail);
                const tierLabel = document.createElement('label');
                tierLabel.className = 'agy-auto-label';
                tierLabel.style.cssText = 'display:flex; align-items:center; gap:5px; font-size:11px; white-space:nowrap;';
                tierLabel.append(document.createTextNode('Use for:'));
                const tierSelect = document.createElement('select');
                tierSelect.id = `agy-auto-tier-${model.name.replace(/[^a-z0-9]+/gi, '-')}`;
                tierSelect.className = 'agy-auto-control agy-auto-tier-select';
                tierSelect.setAttribute('aria-label', `Choose the work tier for ${model.displayName || model.name}`);
                tierSelect.disabled = !route?.verified.reachable;
                tierSelect.innerHTML = '<option value="cheap">Cheap tasks</option><option value="mid">Mid-priced work</option><option value="strong">Strong work</option>';
                tierSelect.value = route?.tier || 'mid';
                tierLabel.append(tierSelect);
                const peers = route
                    ? policy.routes.filter((candidate) => candidate.tier === route.tier).sort((left, right) => left.priority - right.priority)
                    : [];
                const position = route ? Math.max(peers.findIndex((candidate) => candidate.id === route.id) + 1, 1) : 0;
                const priorityBox = document.createElement('div');
                priorityBox.className = 'agy-auto-priority';
                priorityBox.textContent = route ? (position === 1 ? `Primary for ${TIER_LABELS[route.tier]}` : `Fallback ${position - 1}`) : 'Verify to assign';
                const moveUp = document.createElement('button');
                moveUp.type = 'button';
                moveUp.id = `agy-auto-up-${model.name.replace(/[^a-z0-9]+/gi, '-')}`;
                moveUp.className = 'agy-auto-control agy-auto-button agy-auto-order-button';
                moveUp.textContent = '↑';
                moveUp.setAttribute('aria-label', `Make ${model.displayName || model.name} a higher priority in its tier`);
                moveUp.disabled = !route?.verified.reachable || position <= 1;
                const moveDown = document.createElement('button');
                moveDown.type = 'button';
                moveDown.id = `agy-auto-down-${model.name.replace(/[^a-z0-9]+/gi, '-')}`;
                moveDown.className = 'agy-auto-control agy-auto-button agy-auto-order-button';
                moveDown.textContent = '↓';
                moveDown.setAttribute('aria-label', `Make ${model.displayName || model.name} a lower priority in its tier`);
                moveDown.disabled = !route?.verified.reachable || position === 0 || position >= peers.length;
                priorityBox.append(moveUp, moveDown);
                const verifyButton = document.createElement('button');
                verifyButton.type = 'button';
                verifyButton.className = 'agy-auto-control agy-auto-button';
                verifyButton.textContent = route?.verified.reachable ? 'Re-verify' : 'Verify';
                verifyButton.setAttribute('aria-label', `Verify ${model.displayName || model.name}`);
                verifyButton.addEventListener('click', () => {
                    void (async () => {
                        verifyButton.disabled = true;
                        verifyButton.textContent = 'Verifying…';
                        detail.textContent = 'Sending two very small test requests to this model…';
                        try {
                            const result = await autoSwitchAPI.verifyModel(model.name);
                            if (result.ok) {
                                detail.textContent = [describeRoute(result.route), ...result.messages].join(' ');
                                paint(await autoSwitchAPI.getPolicy());
                                return;
                            }
                            detail.textContent = result.messages.join(' ') || 'Verification failed.';
                        }
                        catch (error) {
                            detail.textContent = `Verification failed: ${error instanceof Error ? error.message : 'unknown error'}`;
                        }
                        verifyButton.disabled = false;
                        verifyButton.textContent = route?.verified.reachable ? 'Re-verify' : 'Verify';
                    })();
                });
                useToggle.addEventListener('change', () => {
                    void (async () => {
                        const current = await autoSwitchAPI.getPolicy();
                        const target = current.routes.find((candidate) => candidate.id === model.name);
                        if (!target)
                            return;
                        target.enabled = useToggle.checked;
                        const stillUsable = current.routes.some((candidate) => candidate.enabled && candidate.verified.reachable);
                        await update(stillUsable ? { routes: current.routes } : { routes: current.routes, mode: 'off', enabled: false, chatMode: 'manual' });
                    })();
                });
                tierSelect.addEventListener('change', () => {
                    void (async () => {
                        const current = await autoSwitchAPI.getPolicy();
                        const target = current.routes.find((candidate) => candidate.id === model.name);
                        if (!target)
                            return;
                        target.tier = tierSelect.value;
                        target.priority = current.routes.filter((candidate) => candidate.tier === target.tier && candidate.id !== target.id).length + 1;
                        normalizeTierPriorities(current.routes);
                        await update({ routes: current.routes });
                    })();
                });
                const move = (direction) => {
                    void (async () => {
                        const current = await autoSwitchAPI.getPolicy();
                        const target = current.routes.find((candidate) => candidate.id === model.name);
                        if (!target)
                            return;
                        const siblings = current.routes.filter((candidate) => candidate.tier === target.tier).sort((left, right) => left.priority - right.priority);
                        const currentIndex = siblings.findIndex((candidate) => candidate.id === target.id);
                        const swap = siblings[currentIndex + direction];
                        if (!swap)
                            return;
                        [target.priority, swap.priority] = [swap.priority, target.priority];
                        normalizeTierPriorities(current.routes);
                        await update({ routes: current.routes });
                    })();
                };
                moveUp.addEventListener('click', () => move(-1));
                moveDown.addEventListener('click', () => move(1));
                row.append(useLabel, nameAndDetail, tierLabel, priorityBox, verifyButton);
                modelRows.appendChild(row);
            }
            if (policy.enabled && policy.mode !== 'off') {
                status.textContent = `Active — ${modeSelect.selectedOptions[0]?.text || policy.mode} using ${usable.length} verified model${usable.length === 1 ? '' : 's'}. Choose Auto on the chat control to route a conversation.`;
            }
            else if (usable.length === 0) {
                status.textContent = 'Off — verify at least one of your models, choose a spending mode, then turn Auto Switch on.';
            }
            else {
                status.textContent = `Off — ${usable.length} verified model${usable.length === 1 ? '' : 's'} ready. Choose a spending mode, then turn Auto Switch on.`;
            }
            void injectChatAutoSwitchControl();
        };
        modeSelect.addEventListener('change', () => {
            const mode = modeSelect.value;
            // Selecting Off should visibly stop routing rather than leaving a mode
            // enabled that no longer matches what the dropdown shows.
            void update(mode === 'off' ? { mode, enabled: false, chatMode: 'manual' } : { mode });
        });
        preferLocalInput.addEventListener('change', () => void update({ preferLocal: preferLocalInput.checked }));
        reverifyInput.addEventListener('change', () => void update({ reverifyDays: reverifyInput.checked ? 30 : 0 }));
        enableButton.addEventListener('click', () => void update({ enabled: true }));
        turnOffButton.addEventListener('click', () => void update({ enabled: false, chatMode: 'manual' }));
        try {
            paint(await autoSwitchAPI.getPolicy());
        }
        catch (error) {
            status.textContent = `Could not read Gravity Auto settings: ${error instanceof Error ? error.message : 'unknown error'}`;
        }
    }
    async function injectCustomizationSection() {
        const layout = findCustomizationSectionContainer();
        if (!layout)
            return;
        const { mainContainer, headerRow, contentBlock } = layout;
        if (document.getElementById('agy-custom-models-section'))
            return;
        const section = document.createElement('div');
        section.id = 'agy-custom-models-section';
        section.style.marginTop = '24px';
        section.style.display = 'flex';
        section.style.flexDirection = 'column';
        section.style.gap = '12px';
        const newHeaderRow = document.createElement('div');
        newHeaderRow.className = headerRow.className;
        newHeaderRow.style.cssText = headerRow.style.cssText;
        newHeaderRow.style.display = 'flex';
        newHeaderRow.style.justifyContent = 'space-between';
        newHeaderRow.style.alignItems = 'center';
        newHeaderRow.style.marginBottom = '8px';
        const originalHeading = headerRow.firstElementChild;
        const newHeading = document.createElement(originalHeading ? originalHeading.tagName : 'div');
        if (originalHeading) {
            newHeading.className = originalHeading.className;
            newHeading.style.cssText = originalHeading.style.cssText;
        }
        newHeading.textContent = 'Custom Models';
        const newBtnGroup = document.createElement('div');
        const originalBtnGroup = headerRow.lastElementChild;
        if (originalBtnGroup) {
            newBtnGroup.className = originalBtnGroup.className;
            newBtnGroup.style.cssText = originalBtnGroup.style.cssText;
        }
        newBtnGroup.style.display = 'flex';
        newBtnGroup.style.gap = '8px';
        newBtnGroup.style.alignItems = 'center';
        const addModelBtn = document.createElement('button');
        addModelBtn.id = 'agy-add-model-btn';
        addModelBtn.textContent = 'Add Model';
        const refreshBtn = findRefreshButton();
        if (refreshBtn) {
            addModelBtn.className = refreshBtn.className;
            addModelBtn.style.cssText = refreshBtn.style.cssText;
        }
        addModelBtn.style.cursor = 'pointer';
        addModelBtn.addEventListener('click', () => {
            openAddModelModal();
        });
        newBtnGroup.appendChild(addModelBtn);
        newHeaderRow.appendChild(newHeading);
        newHeaderRow.appendChild(newBtnGroup);
        const contentArea = document.createElement('div');
        contentArea.id = 'agy-custom-models-content';
        contentArea.style.display = 'flex';
        contentArea.style.flexDirection = 'column';
        contentArea.style.gap = '8px';
        section.appendChild(newHeaderRow);
        section.appendChild(contentArea);
        await renderAutoSwitchCard(section);
        if (contentBlock && contentBlock.nextSibling) {
            mainContainer.insertBefore(section, contentBlock.nextSibling);
        }
        else {
            mainContainer.appendChild(section);
        }
        await renderCustomModelsList();
    }
    function openAddModelModal() {
        // Remove existing modal if any
        const existing = document.getElementById('agy-modal-overlay');
        if (existing)
            existing.remove();
        // Modal overlay backdrop
        const overlay = document.createElement('div');
        overlay.id = 'agy-modal-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        overlay.style.backdropFilter = 'blur(6px)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '999999';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease-in-out';
        // Modal card container
        const modal = document.createElement('div');
        modal.id = 'agy-modal-card';
        modal.style.width = '520px';
        modal.style.maxHeight = '90vh';
        modal.style.overflowY = 'auto';
        modal.style.backgroundColor = '#18181b';
        modal.style.border = '1px solid #27272a';
        modal.style.borderRadius = '16px';
        modal.style.padding = '32px';
        modal.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)';
        modal.style.color = '#f4f4f5';
        modal.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        modal.style.transform = 'scale(0.9) translateY(20px)';
        modal.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div id="agy-modal-provider-icon" style="width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; background-color: #10a37f18; color: #10a37f;">${PROVIDER_ICONS.openai}</div>
                    <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #f4f4f5;">Add Custom AI Model</h3>
                </div>
                <button id="agy-modal-close" style="background: transparent; border: none; color: #a1a1aa; cursor: pointer; font-size: 20px; line-height: 1; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.15s ease;">&times;</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
                <!-- Provider -->
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 500; color: #a1a1aa;">API Provider</label>
                    <select id="agy-provider" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 10px 12px; font-size: 14px; outline: none; cursor: pointer; transition: border-color 0.15s ease;">
                        <option value="openai">OpenAI (ChatGPT)</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="google">Google AI Studio (Gemini)</option>
                        <option value="ollama">Ollama (Local)</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="deepseek">DeepSeek</option>
                        <option value="groq">Groq</option>
                        <option value="mistral">Mistral</option>
                        <option value="cerebras">Cerebras</option>
                        <option value="kimi">Kimi (Moonshot)</option>
                        <option value="fireworks">Fireworks AI</option>
                        <option value="lmstudio">LM Studio (Local)</option>
                        <option value="llamacpp">llama.cpp (Local)</option>
                        <option value="nvidia">NVIDIA NIM</option>
                        <option value="custom">Custom / Other</option>
                    </select>
                </div>

                <!-- Model ID -->
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 500; color: #a1a1aa;">Model Name / ID <span style="color: #ef4444;">*</span></label>
                    <input type="text" id="agy-model-id" placeholder="e.g. gpt-4o" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 10px 12px; font-size: 14px; outline: none; transition: border-color 0.15s ease;" required />
                    <div id="agy-model-id-error" style="font-size: 11px; color: #ef4444; display: none; margin-top: 2px;"></div>
                </div>

                <!-- Friendly Display Name -->
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 500; color: #a1a1aa;">Friendly Display Name</label>
                    <input type="text" id="agy-display-name" placeholder="e.g. GPT-4o (OpenAI)" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 10px 12px; font-size: 14px; outline: none; transition: border-color 0.15s ease;" />
                </div>

                <!-- API Key -->
                <div id="agy-key-container" style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 500; color: #a1a1aa;">API Key <span id="agy-key-required" style="color: #ef4444;">*</span></label>
                    <input type="password" id="agy-api-key" placeholder="Enter API key" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 10px 12px; font-size: 14px; outline: none; transition: border-color 0.15s ease;" />
                </div>

                <!-- API URL -->
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 500; color: #a1a1aa;">API URL <span style="color: #ef4444;">*</span></label>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <input type="text" id="agy-api-url" placeholder="https://api.openai.com/v1/chat/completions" style="flex: 1; background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #f4f4f5; padding: 10px 12px; font-size: 14px; outline: none; transition: border-color 0.15s ease;" required />
                        <div id="agy-url-status" style="width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background-color: #71717a; transition: background-color 0.3s ease;" title="URL not yet validated"></div>
                    </div>
                    <div id="agy-url-error" style="font-size: 11px; color: #ef4444; display: none; margin-top: 2px;"></div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button id="agy-btn-test" style="background-color: transparent; border: 1px solid #3f3f46; border-radius: 8px; color: #a1a1aa; padding: 10px 14px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Test Connection
                </button>
                <div style="display: flex; gap: 12px;">
                    <button id="agy-btn-cancel" style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: #e4e4e7; padding: 10px 18px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease;">Cancel</button>
                    <button id="agy-btn-save" style="background-color: #e4e4e7; border: none; border-radius: 8px; color: #18181b; padding: 10px 22px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.15s ease, opacity 0.15s ease;">Save Model</button>
                </div>
            </div>
        `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        // Animate in
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1) translateY(0)';
        }, 10);
        // Close handler
        const closeModal = () => {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.9) translateY(20px)';
            setTimeout(() => overlay.remove(), 200);
        };
        document.getElementById('agy-modal-close').addEventListener('click', closeModal);
        document.getElementById('agy-btn-cancel').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay)
                closeModal();
        });
        const providerSelect = document.getElementById('agy-provider');
        const urlInput = document.getElementById('agy-api-url');
        const keyContainer = document.getElementById('agy-key-container');
        const keyInput = document.getElementById('agy-api-key');
        const modelInput = document.getElementById('agy-model-id');
        const nameInput = document.getElementById('agy-display-name');
        const urlStatus = document.getElementById('agy-url-status');
        const urlError = document.getElementById('agy-url-error');
        const modelIdError = document.getElementById('agy-model-id-error');
        const providerIcon = document.getElementById('agy-modal-provider-icon');
        const keyRequired = document.getElementById('agy-key-required');
        const testBtn = document.getElementById('agy-btn-test');
        const saveBtn = document.getElementById('agy-btn-save');
        const prefilledUrls = {
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
        // Real-time URL validation
        const validateUrl = () => {
            const val = urlInput.value.trim();
            if (!val) {
                urlStatus.style.backgroundColor = '#71717a';
                urlStatus.title = 'URL required';
                return;
            }
            try {
                const u = new URL(val);
                if (['http:', 'https:'].includes(u.protocol)) {
                    urlStatus.style.backgroundColor = '#22c55e';
                    urlStatus.title = 'Valid URL format';
                    urlError.style.display = 'none';
                }
                else {
                    urlStatus.style.backgroundColor = '#fbbf24';
                    urlStatus.title = 'URL must use http or https';
                }
            }
            catch {
                urlStatus.style.backgroundColor = '#ef4444';
                urlStatus.title = 'Invalid URL format';
                urlError.textContent = 'Please enter a valid URL (e.g. https://api.openai.com/v1)';
                urlError.style.display = 'block';
            }
        };
        // Model ID validation
        const validateModelId = () => {
            const val = modelInput.value.trim();
            if (val && !/^[a-zA-Z0-9._/-]+$/.test(val)) {
                modelIdError.textContent = 'Use only letters, numbers, dots, hyphens, underscores, forward slashes';
                modelIdError.style.display = 'block';
                modelInput.style.borderColor = '#ef4444';
            }
            else {
                modelIdError.style.display = 'none';
                modelInput.style.borderColor = '#3f3f46';
            }
        };
        urlInput.addEventListener('input', validateUrl);
        modelInput.addEventListener('input', () => {
            validateModelId();
            if (providerSelect.value === 'google') {
                const modelId = modelInput.value.trim() || 'model-name';
                urlInput.value = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;
                validateUrl();
            }
        });
        const updatePrefills = () => {
            const val = providerSelect.value;
            const modelId = modelInput.value.trim() || 'model-name';
            if (val === 'google') {
                urlInput.value = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;
            }
            else {
                urlInput.value = prefilledUrls[val] || '';
            }
            // Update provider icon
            providerIcon.style.backgroundColor = getProviderColor(val) + '18';
            providerIcon.style.color = getProviderColor(val);
            providerIcon.innerHTML = getProviderIcon(val);
            // Update key requirement indicator
            if (val === 'ollama') {
                keyContainer.style.display = 'none';
                keyInput.value = '';
                keyRequired.style.display = 'none';
                modelInput.placeholder = 'e.g. llama3';
                nameInput.placeholder = 'e.g. Llama 3 (Ollama)';
            }
            else {
                keyContainer.style.display = 'flex';
                keyRequired.style.display = 'inline';
                if (val === 'openai') {
                    modelInput.placeholder = 'e.g. gpt-4o';
                    nameInput.placeholder = 'e.g. GPT-4o (OpenAI)';
                }
                else if (val === 'anthropic') {
                    modelInput.placeholder = 'e.g. claude-3-5-sonnet-latest';
                    nameInput.placeholder = 'e.g. Claude 3.5 Sonnet';
                }
                else if (val === 'google') {
                    modelInput.placeholder = 'e.g. gemini-2.0-flash';
                    nameInput.placeholder = 'e.g. Gemini 2.0 Flash';
                }
                else {
                    modelInput.placeholder = 'e.g. model-name';
                    nameInput.placeholder = 'e.g. My Custom Model';
                }
            }
            validateUrl();
        };
        providerSelect.addEventListener('change', updatePrefills);
        // ─── Test Connection in Modal ────────────────────
        testBtn.addEventListener('click', async () => {
            const provider = providerSelect.value;
            const modelId = modelInput.value.trim();
            const apiKey = keyInput.value.trim();
            const apiUrl = urlInput.value.trim();
            if (!apiUrl) {
                alert('Please enter an API URL first');
                return;
            }
            testBtn.disabled = true;
            testBtn.style.cursor = 'wait';
            testBtn.style.color = '#fbbf24';
            testBtn.style.borderColor = '#fbbf24';
            const originalHtml = testBtn.innerHTML;
            testBtn.innerHTML = '<span>Testing...</span>';
            try {
                const result = await storageAPI.testModelConnection({
                    apiUrl,
                    provider,
                    apiKey,
                });
                if (result.success) {
                    urlStatus.style.backgroundColor = '#22c55e';
                    urlStatus.title = result.message || 'Connection successful!';
                    testBtn.style.color = '#22c55e';
                    testBtn.style.borderColor = '#22c55e';
                }
                else {
                    urlStatus.style.backgroundColor = '#ef4444';
                    urlStatus.title = result.error || 'Connection failed';
                    testBtn.style.color = '#ef4444';
                    testBtn.style.borderColor = '#ef4444';
                }
            }
            catch (err) {
                urlStatus.style.backgroundColor = '#ef4444';
                urlStatus.title = 'Test connection failed';
                testBtn.style.color = '#ef4444';
                testBtn.style.borderColor = '#ef4444';
            }
            setTimeout(() => {
                testBtn.disabled = false;
                testBtn.style.cursor = 'pointer';
                testBtn.style.color = '#a1a1aa';
                testBtn.style.borderColor = '#3f3f46';
                testBtn.innerHTML = originalHtml;
            }, 3000);
        });
        saveBtn.addEventListener('click', async () => {
            const provider = providerSelect.value;
            const modelId = modelInput.value.trim();
            let displayName = nameInput.value.trim();
            const apiKey = keyInput.value.trim();
            const apiUrl = urlInput.value.trim();
            // Clear previous errors
            modelIdError.style.display = 'none';
            urlError.style.display = 'none';
            modelInput.style.borderColor = '#3f3f46';
            urlInput.style.borderColor = '#3f3f46';
            let hasError = false;
            if (!modelId) {
                modelIdError.textContent = 'Model ID is required';
                modelIdError.style.display = 'block';
                modelInput.style.borderColor = '#ef4444';
                hasError = true;
            }
            else if (!/^[a-zA-Z0-9._/-]+$/.test(modelId)) {
                modelIdError.textContent = 'Use only letters, numbers, dots, hyphens, underscores, forward slashes';
                modelIdError.style.display = 'block';
                modelInput.style.borderColor = '#ef4444';
                hasError = true;
            }
            if (provider !== 'ollama' && !apiKey) {
                alert('API Key is required.');
                hasError = true;
            }
            if (!apiUrl) {
                urlError.textContent = 'API URL is required';
                urlError.style.display = 'block';
                urlInput.style.borderColor = '#ef4444';
                hasError = true;
            }
            else {
                try {
                    const u = new URL(apiUrl);
                    if (!['http:', 'https:'].includes(u.protocol)) {
                        urlError.textContent = 'URL must start with http:// or https://';
                        urlError.style.display = 'block';
                        urlInput.style.borderColor = '#ef4444';
                        hasError = true;
                    }
                }
                catch {
                    urlError.textContent = 'Invalid URL format';
                    urlError.style.display = 'block';
                    urlInput.style.borderColor = '#ef4444';
                    hasError = true;
                }
            }
            if (hasError)
                return;
            if (!displayName) {
                const providerNames = {
                    openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google Studio',
                    ollama: 'Ollama', openrouter: 'OpenRouter', custom: 'Custom',
                    deepseek: 'DeepSeek', groq: 'Groq', mistral: 'Mistral',
                    cerebras: 'Cerebras', kimi: 'Kimi', fireworks: 'Fireworks',
                    lmstudio: 'LM Studio', llamacpp: 'llama.cpp', nvidia: 'NVIDIA',
                };
                displayName = `${modelId} (${providerNames[provider]})`;
            }
            const newModel = {
                name: 'models/' + modelId,
                displayName: displayName,
                description: `${displayName} custom model redirected through local proxy`,
                provider: provider,
                apiKey: apiKey || 'none',
                apiUrl: apiUrl,
                externalModelName: modelId,
            };
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            try {
                const res = await storageAPI.saveCustomModel(newModel);
                if (res && res.success) {
                    closeModal();
                    // Re-render the custom models list immediately!
                    await renderCustomModelsList();
                    // Trigger native refresh button if available
                    const refreshBtn = findRefreshButton();
                    if (refreshBtn) {
                        refreshBtn.click();
                    }
                }
                else {
                    alert('Failed to save model: ' + (res?.error || 'Unknown error'));
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Model';
                }
            }
            catch (err) {
                alert('Error saving model: ' + err.message);
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Model';
            }
        });
    }
    /**
     * Chat-first control: it changes only the persisted routing mode. Native model
     * choices retain their normal behavior and no virtual model is inserted anywhere.
     */
    async function injectChatAutoSwitchControl() {
        const existingControl = document.getElementById('agy-chat-auto-switch');
        let policy;
        try {
            policy = await autoSwitchAPI.getPolicy();
        }
        catch {
            existingControl?.remove();
            return;
        }
        // A globally disabled switch should have no chat affordance. The policy and
        // route bindings remain saved so a later re-enable restores the control.
        if (!policy.enabled) {
            existingControl?.remove();
            return;
        }
        if (existingControl)
            return;
        const composer = document.querySelector('textarea, [contenteditable="true"]');
        if (!composer)
            return;
        const control = document.createElement('div');
        control.id = 'agy-chat-auto-switch';
        control.setAttribute('role', 'group');
        control.setAttribute('aria-label', 'Gravity Auto Switch chat mode');
        control.style.cssText = [
            'position:fixed', 'right:18px', 'bottom:18px', 'z-index:2147483000',
            'display:flex', 'align-items:center', 'gap:5px', 'padding:6px',
            'border:1px solid var(--vscode-widget-border, rgba(127,127,127,.45))',
            'border-radius:999px', 'background:var(--vscode-editorWidget-background, rgba(30,30,30,.96))',
            'box-shadow:0 8px 24px rgba(0,0,0,.22)', 'font:12px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        ].join(';');
        control.innerHTML = `
      <span style="padding:0 5px 0 7px; color:var(--vscode-descriptionForeground,inherit); font-weight:600; white-space:nowrap;">Gravity</span>
      <button id="agy-chat-mode-manual" type="button" aria-pressed="true" title="Use the model selected in Antigravity" style="border:0;border-radius:999px;padding:5px 9px;cursor:pointer;">Manual</button>
      <button id="agy-chat-mode-auto" type="button" aria-pressed="false" title="Route this chat according to your Gravity Auto Switch settings" style="border:0;border-radius:999px;padding:5px 9px;cursor:pointer;">Auto</button>
    `;
        document.body.appendChild(control);
        const manual = control.querySelector('#agy-chat-mode-manual');
        const auto = control.querySelector('#agy-chat-mode-auto');
        const paint = (autoSelected) => {
            manual.setAttribute('aria-pressed', String(!autoSelected));
            auto.setAttribute('aria-pressed', String(autoSelected));
            manual.style.background = autoSelected ? 'transparent' : 'var(--vscode-button-secondaryBackground, #3a3d41)';
            manual.style.color = 'var(--vscode-button-secondaryForeground, inherit)';
            auto.style.background = autoSelected ? 'var(--vscode-button-background, #0e639c)' : 'transparent';
            auto.style.color = autoSelected ? 'var(--vscode-button-foreground, white)' : 'var(--vscode-descriptionForeground, inherit)';
        };
        try {
            const policy = await autoSwitchAPI.getPolicy();
            paint(policy.chatMode === 'auto');
        }
        catch {
            paint(false);
        }
        manual.addEventListener('click', async () => {
            const policy = await autoSwitchAPI.getPolicy();
            await autoSwitchAPI.savePolicy({ ...policy, chatMode: 'manual' });
            paint(false);
        });
        auto.addEventListener('click', async () => {
            const policy = await autoSwitchAPI.getPolicy();
            if (!policy.enabled || policy.mode === 'off' || !policy.routes.some((route) => route.enabled && route.verified.reachable)) {
                auto.title = 'Verify at least one of your models in Customization and turn Auto Switch on before using Auto.';
                return;
            }
            await autoSwitchAPI.savePolicy({ ...policy, chatMode: 'auto' });
            paint(true);
        });
    }
    // Efficient DOM tracking via MutationObserver — instead of setInterval
    let injectionObserver = null;
    let injectionDebounceTimer = null;
    function setupInjectionObserver() {
        // Retry immediately and as the single-page Settings UI finishes rendering.
        void injectCustomizationSection();
        void injectChatAutoSwitchControl();
        if (injectionObserver)
            return;
        injectionObserver = new MutationObserver(() => {
            if (injectionDebounceTimer)
                clearTimeout(injectionDebounceTimer);
            injectionDebounceTimer = setTimeout(() => {
                void injectCustomizationSection();
                void injectChatAutoSwitchControl();
            }, 200);
        });
        injectionObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
    // URL tracking for re-injection on SPA page transitions
    let lastUrl = location.href;
    setInterval(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            // Page changed — clean up previous observer and re-initialize
            if (injectionObserver) {
                injectionObserver.disconnect();
                injectionObserver = null;
            }
            // Re-initialize after a short delay (for new DOM to render)
            setTimeout(setupInjectionObserver, 500);
        }
    }, 1500);
    // The native model catalog is intentionally left untouched. The proxy performs
    // custom-model and Auto Switch routing only after a valid native generation
    // request has been created.
    // Start the observer
    setupInjectionObserver();
});
//# sourceMappingURL=preload.js.map