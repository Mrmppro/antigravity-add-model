/**
 * Preload script — runs in every BrowserWindow before the page loads.
 * Exposes a minimal, secure API via contextBridge so the renderer can
 * communicate with the main-process auto-updater without nodeIntegration.
 */
import type { AutoSwitchPolicy, AutoSwitchRoute } from './autoSwitch/types';
interface UpdaterState {
    type: string;
    update?: {
        version: string;
    };
}
type UnsubscribeFn = () => void;
interface UpdaterAPI {
    onStateChanged: (callback: (state: UpdaterState) => void) => UnsubscribeFn;
    applyUpdate: () => Promise<void>;
    quitAndInstall: () => Promise<void>;
    checkForUpdates: () => Promise<void>;
    getState: () => Promise<UpdaterState>;
}
interface DialogAPI {
    showOpenDialog: () => Promise<string | undefined>;
    showOpenMultipleFolderDialog: () => Promise<string[]>;
}
interface NotificationOptions {
    title: string;
    body: string;
    silent?: boolean;
    payload?: unknown;
}
interface NotificationAPI {
    send: (options: NotificationOptions) => Promise<void>;
    openSystemPreferences: () => Promise<void>;
    onClicked: (callback: (payload: unknown) => void) => UnsubscribeFn;
}
interface StorageAPI {
    getItems: () => Promise<Record<string, string | null>>;
    updateItems: (changes: Record<string, string | null>) => Promise<void>;
    onChanged: (callback: (changes: Record<string, string | null>) => void) => UnsubscribeFn;
    getCustomModels: () => Promise<CustomModelEntry[]>;
    saveCustomModel: (model: CustomModelEntry & {
        originalModelName?: string;
    }) => Promise<{
        success: boolean;
        error?: string;
    }>;
    deleteCustomModel: (modelName: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    testModelConnection: (model: TestModelParams & {
        name?: string;
    }) => Promise<ConnectionTestResult>;
    updateProviderKeys: (provider: string, apiKey: string) => Promise<{
        success: boolean;
        updatedCount?: number;
        error?: string;
    }>;
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
interface AutoSwitchAPI {
    getPolicy: () => Promise<AutoSwitchPolicy>;
    savePolicy: (policy: AutoSwitchPolicy) => Promise<AutoSwitchPolicy>;
    setEnabled: (enabled: boolean) => Promise<AutoSwitchPolicy>;
    /** Probes one of the user's models and records what it can actually do. */
    verifyModel: (modelName: string) => Promise<VerifyModelResult>;
    reverifyStale: () => Promise<ReverifyResult>;
}
interface LogsAPI {
    getElectronLogs: () => Promise<string>;
}
interface ExtensionsAPI {
    sendAuthorities: (authoritiesMap: Record<string, string>) => Promise<void>;
}
interface DeepLinkAPI {
    onDeepLink: (callback: (url: string) => void) => UnsubscribeFn;
    getStoredDeepLink: () => Promise<string | undefined>;
}
interface AgentAPI {
    updateActiveAgentCount: (count: number) => Promise<void>;
}
interface TitleBarOverlayOptions {
    color: string;
    symbolColor: string;
}
interface ContextMenuItem {
    id: string;
    label?: string;
    type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
    checked?: boolean;
    disabled?: boolean;
    accelerator?: string;
    submenu?: ContextMenuItem[];
}
interface ElectronNativeAPI {
    getZoomLevel: () => number;
    getPathForFile: (file: File) => string;
    setTitleBarOverlay: (options: TitleBarOverlayOptions) => Promise<void>;
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    unmaximize: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    close: () => Promise<void>;
    toggleDevTools: () => Promise<void>;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    openExternal: (url: string) => Promise<void>;
    revealInFilePicker: (path: string) => Promise<void>;
    showContextMenu: (items: ContextMenuItem[]) => Promise<string | null>;
    closeContextMenu: () => Promise<void>;
    onWebviewDeviceChooserEvent?: (callback: (payload: any) => void) => () => void;
    respondWebviewDeviceChooser?: (requestId: any, resolution: any) => Promise<any>;
    getWebviewMemoryUsage?: (webContentsIds: any) => Promise<any>;
    getDefaultDownloadDirectory?: () => Promise<string>;
    executeJavaScriptInIsolatedWorld?: (wcId: any, worldId: any, code: any) => Promise<any>;
    scriptJailProtocol?: number;
    listWebviewFrames?: (wcId: any) => Promise<any>;
    executeJavaScriptInFrameIsolatedWorld?: (wcId: any, frameId: any, code: any, expectedOrigin: any) => Promise<any>;
    runScriptInJail?: (req: any) => Promise<any>;
    abortScriptJail?: (jailId: any) => Promise<any>;
    warmScriptJail?: () => Promise<any>;
    subscribeWebviewSecurityState?: (webContentsId: any, callback: any) => () => void;
    allowWebviewCertificate?: (webContentsId: any, url: any) => Promise<any>;
    clearWebviewSiteData?: (webContentsId: any, origin: any) => Promise<any>;
    onWebviewOpenNewTab?: (callback: (url: string, webContentsId: number) => void) => () => void;
    setWebviewDownloadDirectory?: (webContentsId: any, downloadDir: any) => Promise<any>;
    setWebviewAgentControlled?: (webContentsId: any, active: any) => Promise<any>;
    openWebviewDownload?: (downloadId: any) => Promise<any>;
    showWebviewDownloadInFolder?: (downloadId: any) => Promise<any>;
    cancelWebviewDownload?: (downloadId: any) => Promise<any>;
    resolveWebviewDownload?: (downloadId: any, approve: any) => Promise<any>;
    selectDownloadDirectory?: (defaultPath: any) => Promise<any>;
    onWebviewFaviconUpdated?: (callback: any) => () => void;
    onWebviewDownloadProgress?: (callback: any) => () => void;
    setWebviewDialogPolicy?: (webContentsId: any, policy: any) => Promise<any>;
    handleWebviewDialog?: (webContentsId: any, decision: any) => Promise<any>;
    onWebviewDialogOpening?: (callback: any) => () => void;
    getWebviewNetworkRequests?: (webContentsId: any) => Promise<any>;
    clearWebviewNetworkRequests?: (webContentsId: any) => Promise<any>;
    onWebviewNetworkRequest?: (callback: any) => () => void;
    onWebviewPromptRequest?: (callback: any) => () => void;
    respondWebviewPrompt?: (promptId: any, value: any) => Promise<any>;
    setWebviewFileChooserPolicy?: (webContentsId: any, policy: any) => Promise<any>;
    handleWebviewFileChooser?: (webContentsId: any, decision: any) => Promise<any>;
    setWebviewInputFiles?: (webContentsId: any, request: any) => Promise<any>;
    resolveWebviewUploadFiles?: (request: any) => Promise<any>;
    onWebviewFileChooserOpened?: (callback: any) => () => void;
    setWebviewWebMcpEnabled?: (enabled: any) => Promise<any>;
    listWebviewWebMcpTools?: (webContentsId: any, origin: any) => Promise<any>;
    callWebviewWebMcpTool?: (webContentsId: any, origin: any, params: any) => Promise<any>;
    cancelWebviewWebMcpToolCall?: (webContentsId: any, callId: any) => Promise<any>;
    wcvBrowser?: any;
}
interface DesktopMicAPI {
    getAccessStatus: () => Promise<unknown>;
    requestAccess: () => Promise<unknown>;
    openSystemPreferences: () => Promise<unknown>;
}
interface IdeAPI {
    isInstalled: () => Promise<boolean>;
}
interface WslDistroInfo {
    name: string;
    isDefault: boolean;
}
interface WslState {
    available: boolean;
    activeDistro: string | null;
    distros: WslDistroInfo[];
}
interface WslAPI {
    getState: () => Promise<WslState>;
    connect: (distro: string) => Promise<void>;
}
interface CustomModelEntry {
    name: string;
    displayName?: string;
    description?: string;
    provider: string;
    apiKey: string;
    apiUrl: string;
    externalModelName: string;
    allowUnauthorized?: boolean;
    encrypted?: boolean;
    keyValid?: boolean;
    originalModelName?: string;
    [key: string]: unknown;
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
declare global {
    interface Window {
        electronUpdater: UpdaterAPI;
        dialog: DialogAPI;
        nativeNotifications: NotificationAPI;
        nativeStorage: StorageAPI;
        autoSwitch: AutoSwitchAPI;
        logs: LogsAPI;
        extensions: ExtensionsAPI;
        deepLink: DeepLinkAPI;
        agent: AgentAPI;
        electronNative: ElectronNativeAPI;
        ide: IdeAPI;
        wsl: WslAPI;
        desktopMic: DesktopMicAPI;
    }
}
export {};
//# sourceMappingURL=preload.d.ts.map