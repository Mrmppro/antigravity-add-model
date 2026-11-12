import { StorageManager } from './storage';
interface ReverifyResult {
    checked: number;
    failed: string[];
}
export declare function reverifyStaleRoutes(maxAgeMs?: number): Promise<ReverifyResult>;
export declare function scheduleAutoSwitchReverification(): void;
export declare function registerIpcHandlers(storageManager: StorageManager): void;
export {};
//# sourceMappingURL=ipcHandlers.d.ts.map