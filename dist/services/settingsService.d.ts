export declare enum SettingKey {
    RUN_IN_BACKGROUND = "runInBackground",
    KEEP_COMPUTER_AWAKE = "keepComputerAwake",
    AUTO_CHECK_FOR_UPDATES = "autoCheckForUpdates",
    GRAVITY_AUTO_SWITCH_ENABLED = "gravityAutoSwitchEnabled"
}
export declare const DEFAULTS: Map<SettingKey, boolean>;
interface StorageManager {
    onDidChange(listener: (changes: Record<string, string | null>) => void): {
        dispose(): void;
    };
    getItems(): Promise<Record<string, string | null>>;
}
/**
 * A thin wrapper around StorageManager to listen for changes
 * in settings and apply their side effects.
 */
export declare class SettingsService {
    private storageManager;
    constructor(storageManager: StorageManager);
    initialize(): Promise<void>;
    applySideEffects(settings: Record<string, string | null>): void;
    getSetting(key: SettingKey): Promise<boolean>;
    onSettingChanged(key: SettingKey, listener: (enabled: boolean) => void): {
        dispose(): void;
    };
}
export {};
//# sourceMappingURL=settingsService.d.ts.map