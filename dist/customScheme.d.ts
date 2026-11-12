export declare const extensionAuthorities: Map<string, string>;
export declare function registerCustomSchemes(): void;
/**
 * Handles `agy-favicon://<token>/` by looking the token up in the favicon
 * store. Never fetches: unknown tokens and any other path are 404.
 */
export declare function handleFaviconProtocolRequest(request: Request): Response;
export declare function registerCustomSchemeHandlers(): void;
//# sourceMappingURL=customScheme.d.ts.map