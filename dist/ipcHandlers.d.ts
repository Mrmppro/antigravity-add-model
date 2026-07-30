import { StorageManager } from './storage';
/**
 * Registers all IPC handlers for the main process.
 */
export declare function registerIpcHandlers(storageManager: StorageManager): void;
interface ReverifyResult {
    checked: number;
    /** Display names of routes that stopped working and were disabled. */
    failed: string[];
}
/**
 * Re-checks routes whose verification has aged past the user's window.
 *
 * A route that no longer passes is disabled rather than silently trusted, so a
 * revoked key or retired model degrades into "use my manual choice" instead of
 * failing every request. Safe to call when Auto Switch is unused: it exits early.
 */
export declare function reverifyStaleRoutes(): Promise<ReverifyResult>;
/**
 * Startup entry point for the optional 30-day re-check.
 *
 * Runs detached and never rejects, because Auto Switch maintenance must not be
 * able to delay or break application launch.
 */
export declare function scheduleAutoSwitchReverification(): void;
export {};
//# sourceMappingURL=ipcHandlers.d.ts.map