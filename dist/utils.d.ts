import { WebContentsView, WebContents } from 'electron';
import { StorageManager } from './storage';
export declare let showQuitConfirmation: boolean;
export declare function setShowQuitConfirmation(value: boolean): void;
export declare function isMacOS(): boolean;
export declare const HUB_SURFACE_COLOR_STORAGE_KEY = "hubSurfaceBackgroundColor";
/** Validates a 6-digit `#RRGGBB` hex color string and returns it normalized to uppercase. */
export declare function normalizeHexSurfaceColor(color: unknown): string | undefined;
/** Builds the minimal opaque HTML document URL loaded into `curtainView` so its compositor surface paints. */
export declare function buildHubCurtainDataUrl(color: string): string;
/** Marks a child `BrowserWindow` created by `<webview>` `window.open()` so `getHubWindows()` ignores it. */
export declare function markWebviewPopupWindow(win: any): void;
/** Associates `contents` (`hubWcv` or `browserWcv`) with its owning `HubWindow`. */
export declare function registerWindowWebContents(win: any, contents: any): void;
/** Returns the primary Hub UI `WebContentsView` (`hubWcv`) for `win`. */
export declare function getHubView(win: any): WebContentsView | undefined;
/** Returns the opaque background `View` curtain separating hidden background `browserWcv` tabs from `hubWcv`. */
export declare function getHubCurtainView(win: any): WebContentsView | undefined;
/** Returns the theme surface and curtain background color (`#RRGGBB`) for `win`. */
export declare function getHubCurtainColor(win?: any): string;
/** Updates a Hub window's `baseWin` and opaque `curtainView` document to `color` (`#RRGGBB`). */
export declare function setHubCurtainColor(win: any, color: string): string | undefined;
/** Returns the trusted Hub UI `WebContents` (`hubWcv.webContents`) for `win`. */
export declare function getHubWebContents(win: any): WebContents | undefined;
/** Resolves the owning `HubWindow` for `hubWcv`, `browserWcv`, or `<webview>` `contents`. */
export declare function resolveHubWindowFromWebContents(contents: any): any;
/** Returns all open top-level Hub windows. */
export declare function getHubWindows(): any[];
/** Returns the currently focused top-level `HubWindow`, if any. */
export declare function getFocusedHubWindow(): any;
export interface CreateWindowOptions {
    cascade?: boolean;
}
/**
 * Creates and returns a new Hub window pointed at `url`.
 */
export declare function createWindow(url: string, storageManager?: StorageManager, options?: CreateWindowOptions): any;
/**
 * Focuses a window if it exists, or creates a new one.
 */
export declare const showOrCreateWindow: (port: number, storageManager?: StorageManager) => void;
/**
 * Manages the power save blocker to keep the computer awake.
 */
export declare class SleepBlocker {
    private static instance;
    private currentBlockerId;
    static getInstance(): SleepBlocker;
    shouldKeepComputerAwake(keep: boolean | undefined): void;
}
export declare function getNodeWrapperPaths(envPath: string, os: string, isPackaged: boolean, userDataPath: string, baseDir: string): {
    newEnvPath: string;
    nodeWrapperPath?: string;
    binPath?: string;
};
/**
 * Sets up a wrapper script for Node.js that runs Electron as Node.
 */
export declare function setupNodeWrapper(env: Record<string, string | undefined>): void;
//# sourceMappingURL=utils.d.ts.map