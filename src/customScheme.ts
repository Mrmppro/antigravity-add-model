import { protocol, net } from 'electron';
import { FAVICON_SCHEME, lookupFaviconToken } from './faviconStore';

// A map of extension authority -> original URL (http://localhost:<port>)
// The authority is usually a hash of unique extension identifiers
// like extension ID + port + project ID. An extension running on localhost:<port>
// is then exposed on plugin://<authority>.
export const extensionAuthorities = new Map<string, string>();

export function registerCustomSchemes(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'plugin',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        allowServiceWorkers: true,
        codeCache: true,
      },
    },
    {
      // Serves cached favicon bytes to the Hub renderer's <img> tags only, so
      // no fetch, CORS, or service-worker privileges.
      scheme: FAVICON_SCHEME,
      privileges: { standard: true, secure: true },
    },
  ]);
}

/**
 * Handles `agy-favicon://<token>/` by looking the token up in the favicon
 * store. Never fetches: unknown tokens and any other path are 404.
 */
export function handleFaviconProtocolRequest(request: Request): Response {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405 });
  }
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return new Response(null, { status: 404 });
  }
  const favicon = url.pathname === '/' ? lookupFaviconToken(url.hostname) : undefined;
  if (!favicon) {
    return new Response(null, { status: 404 });
  }
  return new Response(new Uint8Array(favicon.bytes), {
    status: 200,
    headers: {
      'Content-Type': favicon.mime,
      'X-Content-Type-Options': 'nosniff',
      // A top-level load of an SVG favicon must not run as a document.
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cache-Control': 'no-store',
    },
  });
}

export function registerCustomSchemeHandlers(): void {
  // Handle custom scheme for UI extensions
  protocol.handle('plugin', async (request) => {
    const url = new URL(request.url);
    const authority = url.hostname;
    const originalHost = extensionAuthorities.get(authority);
    if (!originalHost) {
      return new Response(null, { status: 404 });
    }
    const targetUrl = new URL(url.pathname + url.search, originalHost);
    try {
      const fetchOptions: RequestInit & { duplex?: string } = {
        method: request.method,
        headers: request.headers,
        body: request.body,
      };
      if (request.body) {
        // Required by Electron's net.fetch when the body is a stream
        fetchOptions.duplex = 'half';
      }
      const response = await net.fetch(targetUrl.toString(), fetchOptions);
      return response;
    } catch (err) {
      console.error(`Failed to proxy request to ${targetUrl}:`, err);
      return new Response(null, { status: 500 });
    }
  });

  // Module-level `protocol` binds to the default session only: the Hub
  // renderer's session, never a guest partition.
  protocol.handle(FAVICON_SCHEME, handleFaviconProtocolRequest);
}
