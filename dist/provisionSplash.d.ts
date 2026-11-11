export interface ProvisionSplashHandle {
    setStatus(text: string): void;
    close(): void;
}
/**
 * Small frameless window shown while the WSL language server is downloaded
 * and installed at startup (first launch per version), so the app doesn't
 * appear dead during the multi-minute provisioning.
 */
export declare function createProvisionSplash(distro: string): ProvisionSplashHandle;
//# sourceMappingURL=provisionSplash.d.ts.map