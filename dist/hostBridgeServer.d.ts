import * as http from 'node:http';
export interface HostUpdateStatus {
    currentVersion: string;
    latestVersion: string;
    updateAvailable: boolean;
}
export interface HostBridgeServerOptions {
    getUpdateStatus: () => HostUpdateStatus | Promise<HostUpdateStatus>;
    applyUpdate: () => boolean | Promise<boolean>;
}
export interface HostBridgeServerHandle {
    url: string;
    token: string;
    port: number;
    server: http.Server;
    close: () => Promise<void>;
}
/**
 * Starts the host bridge server on an ephemeral loopback port and returns its
 * URL and the token callers must present.
 */
export declare function startHostBridgeServer(options: HostBridgeServerOptions): Promise<HostBridgeServerHandle>;
//# sourceMappingURL=hostBridgeServer.d.ts.map