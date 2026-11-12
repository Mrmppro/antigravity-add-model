/**
 * Lowercase URL schemes (without trailing `:`) never forwarded to OS protocol
 * handlers from renderer-reachable entry points.
 */
export declare const DENIED_EXTERNAL_SCHEMES: Set<string>;
/**
 * Classifies an untrusted candidate URL for launching via the OS handler under
 * `policy`.
 */
export declare function classifyExternalUrl(url: string, policy: 'unconfirmed' | 'confirmed'): 'allow' | 'deny';
/**
 * Validates `url` under `policy` and, when allowed, opens the normalized
 * `URL.href` with `shell.openExternal`. Logs a scheme-only warning without
 * throwing when denied or when `shell.openExternal` rejects.
 */
export declare function openExternalSafely(url: string, policy: 'unconfirmed' | 'confirmed'): Promise<void>;
/**
 * Returns `true` iff `targetUrl` and `currentUrl` parse as valid URLs with
 * matching non-opaque (`!== 'null'`) origins.
 */
export declare function isSameOrigin(targetUrl: string, currentUrl: string): boolean;
//# sourceMappingURL=externalUrl.d.ts.map