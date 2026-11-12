import { Display } from 'electron';
export declare const DEFAULT_WINDOW_WIDTH = 1400;
export declare const DEFAULT_WINDOW_HEIGHT = 900;
export declare const MIN_WINDOW_WIDTH = 500;
export declare const MIN_WINDOW_HEIGHT = 400;
export interface WindowState {
    x?: number;
    y?: number;
    width: number;
    height: number;
    isMaximized?: boolean;
    isFullScreen?: boolean;
}
export interface WindowStateTracker {
    win: any;
    clearTimer: () => void;
    captureAndSave: () => void;
    dispose: () => void;
}
/**
 * Validates and normalizes raw parsed JSON into a safe `WindowState`.
 */
export declare function parseWindowState(raw: unknown): WindowState;
/**
 * Reads persisted window state from disk, returning defaults if missing or invalid.
 */
export declare function readPersistedWindowState(stateFilePath?: string): WindowState;
/**
 * Writes window state to disk on a best-effort basis without throwing.
 */
export declare function persistWindowState(state: WindowState, stateFilePath?: string): void;
/**
 * Ensures `state` fits on one of the currently connected `displays`.
 */
export declare function resolveWindowStateForDisplays(state: WindowState, displays: Display[], primaryDisplay?: Display): WindowState;
/**
 * Offsets `baseState` slightly when opening an additional window while another
 * Hub window is already open, wrapping within the display's usable area.
 */
export declare function cascadeWindowState(baseState: WindowState, displays: Display[]): WindowState;
export interface ResolveInitialWindowStateOptions {
    stateFilePath?: string;
    cascadeFromWindow?: any;
}
/**
 * Resolves the initial bounds and state to apply to a newly created Hub window.
 */
export declare function resolveInitialWindowState(options?: ResolveInitialWindowStateOptions): WindowState;
/**
 * Attaches listeners to `win` so moves, resizes, maximize, and full-screen
 * transitions are persisted to `window_state.json`.
 */
export declare function trackWindowState(win: any, initialState: WindowState, stateFilePath?: string): void;
/**
 * Synchronously flushes window state before app quit destroys open windows.
 */
export declare function flushTrackedWindowState(preferredWindow?: any): void;
//# sourceMappingURL=windowState.d.ts.map