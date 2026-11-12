import { shell } from 'electron';

/**
 * Lowercase URL schemes (without trailing `:`) never forwarded to OS protocol
 * handlers from renderer-reachable entry points.
 */
export const DENIED_EXTERNAL_SCHEMES = new Set([
  'afp',
  'applescript',
  'data',
  'disk',
  'disks',
  'file',
  'hcp',
  'ie.http',
  'javascript',
  'mk',
  'ms-help',
  'nntp',
  'res',
  'shell',
  'vbscript',
  'view-source',
  'vnd.ms.radio',
  'about',
  'blob',
  'filesystem',
  'plugin',
  'ms-word',
  'ms-excel',
  'ms-powerpoint',
  'ms-visio',
  'ms-access',
  'ms-project',
  'ms-publisher',
  'ms-spd',
  'ms-infopath',
  'ms-msdt',
  'search-ms',
  'search',
  'ms-officecmd',
  'ms-cxh',
  'ms-cxh-full',
  'ms-appinstaller',
  'smb',
]);

const UNCONFIRMED_ALLOWED_SCHEMES = new Set(['http', 'https', 'mailto']);

function parseUrl(url: string): URL | null {
  if (typeof url !== 'string') {
    return null;
  }
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function classifyParsedExternalUrl(parsed: URL, policy: 'unconfirmed' | 'confirmed'): 'allow' | 'deny' {
  const scheme = parsed.protocol.slice(0, -1);
  if (scheme.length === 1 || DENIED_EXTERNAL_SCHEMES.has(scheme)) {
    return 'deny';
  }
  if (policy === 'unconfirmed' && !UNCONFIRMED_ALLOWED_SCHEMES.has(scheme)) {
    return 'deny';
  }
  return 'allow';
}

/**
 * Classifies an untrusted candidate URL for launching via the OS handler under
 * `policy`.
 */
export function classifyExternalUrl(url: string, policy: 'unconfirmed' | 'confirmed'): 'allow' | 'deny' {
  const parsed = parseUrl(url);
  return parsed ? classifyParsedExternalUrl(parsed, policy) : 'deny';
}

/**
 * Validates `url` under `policy` and, when allowed, opens the normalized
 * `URL.href` with `shell.openExternal`. Logs a scheme-only warning without
 * throwing when denied or when `shell.openExternal` rejects.
 */
export async function openExternalSafely(url: string, policy: 'unconfirmed' | 'confirmed'): Promise<void> {
  const parsed = parseUrl(url);
  const scheme = parsed ? parsed.protocol.slice(0, -1) : '<invalid>';
  if (!parsed || classifyParsedExternalUrl(parsed, policy) !== 'allow') {
    console.warn(`[externalUrl] Blocked external URL with scheme "${scheme}"`);
    return;
  }
  try {
    await shell.openExternal(parsed.href);
  } catch (err: unknown) {
    const errType = err instanceof Error ? err.name : typeof err;
    console.warn(`[externalUrl] Failed to open external URL with scheme "${scheme}" (${errType})`);
  }
}

/**
 * Returns `true` iff `targetUrl` and `currentUrl` parse as valid URLs with
 * matching non-opaque (`!== 'null'`) origins.
 */
export function isSameOrigin(targetUrl: string, currentUrl: string): boolean {
  if (!URL.canParse(targetUrl) || !URL.canParse(currentUrl)) {
    return false;
  }
  const targetOrigin = new URL(targetUrl).origin;
  const currentOrigin = new URL(currentUrl).origin;
  if (targetOrigin === 'null' || currentOrigin === 'null') {
    return false;
  }
  return targetOrigin === currentOrigin;
}
