export declare const ZOOM_LEVEL_KEY = "zoomLevel";
export declare const ZOOM_STEP = 0.5;
/**
 * Registers the main-process storage updater used to persist Hub window zoom
 * changes initiated from IPC, application menu items, or keyboard shortcuts.
 */
export declare function setHubZoomStorageManager(storageManager: any): void;
/**
 * Resolves the target top-level Hub window for a menu or IPC zoom action.
 */
export declare function resolveTargetHubWindow(win?: any): any;
/**
 * Maps a `Cmd`/`Ctrl`-modified keyboard input payload to its corresponding Hub zoom action.
 */
export declare function resolveHubZoomShortcutAction(input: {
    key?: string;
    code?: string;
    shift?: boolean;
}, keyLower?: string): 'in' | 'out' | 'reset' | null;
/**
 * Adjusts or resets the zoom level strictly on `win`'s Hub UI `WebContents`.
 */
export declare function applyHubWindowZoom(win: any, action: 'in' | 'out' | 'reset'): Promise<void>;
//# sourceMappingURL=hubZoom.d.ts.map