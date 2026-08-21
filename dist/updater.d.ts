import { UpdateStateType } from './types';
export declare enum MenuUpdateStep {
    CheckForUpdates = "Check for Updates",
    CheckingForUpdates = "Checking for Updates...",
    DownloadingUpdate = "Downloading Update...",
    RestartToUpdate = "Restart to Update"
}
export declare const updateActions: Record<string, (() => void) | undefined>;
export declare function setAutoUpdateChecking(enabled: boolean): void;
export interface UpdaterState {
    type: UpdateStateType | string;
    update?: {
        version: string;
    };
    updateType?: number;
}
/** Broadcast a state change to every open BrowserWindow. */
export declare function broadcastState(state: UpdaterState): void;
/**
 * Returns the last update state broadcast to renderers.
 */
export declare function getLastState(): UpdaterState;
/**
 * Initializes the auto-updater and registers IPC handlers.
 * Call once after the first window is created.
 */
export declare function initAutoUpdater(isHeadless: boolean, settingsService?: {
    getSetting: (key: string) => Promise<boolean>;
    onSettingChanged: (key: string, listener: (enabled: boolean) => void) => {
        dispose(): void;
    };
}): void;
export declare function checkForUpdates(isManual?: boolean): void;
export declare function quitAndInstall(): void;
/**
 * Builds the update status served to the language server over the loopback
 * host bridge server.
 */
export declare function getHostUpdateStatus(): {
    currentVersion: string;
    latestVersion: string;
    updateAvailable: boolean;
};
/**
 * Applies an update on behalf of the language server.
 */
export declare function applyHostUpdate(): boolean;
//# sourceMappingURL=updater.d.ts.map