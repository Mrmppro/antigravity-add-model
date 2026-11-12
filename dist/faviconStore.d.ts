/** Custom scheme the Hub renderer uses to load cached favicon bytes. */
export declare const FAVICON_SCHEME = "agy-favicon";
/** Largest favicon body the main process accepts, cached, or serves. */
export declare const MAX_RAW_FAVICON_BYTES: number;
export interface ServableFavicon {
    url: string;
    mime: string;
    bytes: Buffer | Uint8Array;
}
export interface FaviconResolution {
    dataUrl?: string;
    servable?: ServableFavicon;
}
/**
 * Caches the outcome of fetching `iconUrl` in the guest session `sessionKey`.
 *
 * Mints a servable `agy-favicon://` URL when the bytes are non-empty, within
 * {@link MAX_RAW_FAVICON_BYTES}, and of an allowlisted MIME type. Returns
 * undefined, caching nothing, when there is neither a servable form nor a
 * `dataUrl`.
 */
export declare function resolveFaviconBytes(sessionKey: string, iconUrl: string, bytes: Buffer | Uint8Array, sniffedMime: string | undefined, dataUrl?: string): FaviconResolution | undefined;
/** Returns the cached resolution for `iconUrl` and marks it recently used. */
export declare function getCachedFavicon(sessionKey: string, iconUrl: string): FaviconResolution | undefined;
/**
 * Looks up the servable favicon for an `agy-favicon://` token. Never fetches
 * and leaves LRU order unchanged.
 */
export declare function lookupFaviconToken(token: string): ServableFavicon | undefined;
/** Total bytes currently held, for hermetic unit tests. */
export declare function getFaviconStoreBytesForTesting(): number;
/** Empties the store for hermetic unit tests. */
export declare function clearFaviconStoreForTesting(): void;
//# sourceMappingURL=faviconStore.d.ts.map