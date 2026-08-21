import * as crypto from 'node:crypto';
import * as http from 'node:http';
import { connectNodeAdapter } from '@connectrpc/connect-node';
import type { ConnectRouter } from '@connectrpc/connect';
import { HostBridgeService } from './proto/host_bridge_pb';

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

/** Only the loopback interface is served. */
const BIND_HOST = '127.0.0.1';

/**
 * Remote addresses we accept. Node reports IPv4 loopback as `127.0.0.1`, and
 * IPv6 loopback as `::1` or the IPv4-mapped form `::ffff:127.0.0.1`.
 */
const LOOPBACK_ADDRESSES = new Set([
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
]);

/** Generic bodies — never leak which security check rejected the request. */
const FORBIDDEN_BODY = { error: 'forbidden' };
const UNAUTHORIZED_BODY = { error: 'unauthorized' };

/** True when the socket's peer is on the loopback interface. */
function isLoopbackAddress(remoteAddress: string | undefined): boolean {
  return remoteAddress !== undefined && LOOPBACK_ADDRESSES.has(remoteAddress);
}

/** Extracts `<token>` from an `Authorization: Bearer <token>` header. */
function extractBearerToken(header: string | undefined): string | undefined {
  if (!header) {
    return undefined;
  }
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match ? match[1] : undefined;
}

/**
 * Constant-time token comparison. `timingSafeEqual` throws when the buffers
 * differ in length, so the lengths are checked first.
 */
function tokenMatches(provided: string, expected: string): boolean {
  const providedBytes = Buffer.from(provided, 'utf8');
  const expectedBytes = Buffer.from(expected, 'utf8');
  if (providedBytes.length !== expectedBytes.length) {
    return false;
  }
  return crypto.timingSafeEqual(providedBytes, expectedBytes);
}

function sendJson(res: http.ServerResponse, statusCode: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function logRejection(reason: string, detail?: string): void {
  const suffix = detail === undefined ? '' : ` (${detail})`;
  console.warn(`[HostBridgeServer] Rejected request: ${reason}${suffix}`);
}

function passesSecurityChecks(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  expectedHost: string,
  token: string,
): boolean {
  // 1. Loopback-only. Belt-and-braces on top of binding to 127.0.0.1.
  if (!isLoopbackAddress(req.socket.remoteAddress)) {
    logRejection('non-loopback peer', req.socket.remoteAddress);
    sendJson(res, 403, FORBIDDEN_BODY);
    return false;
  }
  // 2. Host header must be our own address (DNS-rebinding protection).
  if (req.headers.host !== expectedHost) {
    logRejection('unexpected Host header', req.headers.host);
    sendJson(res, 403, FORBIDDEN_BODY);
    return false;
  }
  // 3. Bearer token, compared in constant time.
  const provided = extractBearerToken(req.headers.authorization);
  if (provided === undefined || !tokenMatches(provided, token)) {
    logRejection(provided === undefined ? 'missing bearer token' : 'bad bearer token');
    sendJson(res, 401, UNAUTHORIZED_BODY);
    return false;
  }
  return true;
}

/** Registers the bridge implementation on the Connect router. */
function buildRoutes(options: HostBridgeServerOptions) {
  return (router: ConnectRouter) => {
    (router.service as (service: unknown, impl: unknown) => void)(HostBridgeService, {
      async getUpdateStatus() {
        return { status: await options.getUpdateStatus() };
      },
      async applyUpdate() {
        return { accepted: await options.applyUpdate() };
      },
    });
  };
}

/**
 * Starts the host bridge server on an ephemeral loopback port and returns its
 * URL and the token callers must present.
 */
export function startHostBridgeServer(options: HostBridgeServerOptions): Promise<HostBridgeServerHandle> {
  const token = crypto.randomBytes(32).toString('hex');
  const handleRequest = connectNodeAdapter({ routes: buildRoutes(options) });
  return new Promise((resolve, reject) => {
    let expectedHost = '';
    const server = http.createServer((req, res) => {
      if (!passesSecurityChecks(req, res, expectedHost, token)) {
        return;
      }
      handleRequest(req, res);
    });

    const onStartupError = (err: Error) => {
      server.removeListener('error', onStartupError);
      reject(err);
    };
    server.on('error', onStartupError);

    server.listen(0, BIND_HOST, () => {
      server.removeListener('error', onStartupError);
      server.on('error', (err: Error) => {
        console.error('[HostBridgeServer] Server error:', err.message);
      });
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Host bridge server did not report an address'));
        return;
      }
      const port = address.port;
      expectedHost = `${BIND_HOST}:${port}`;
      resolve({
        url: `http://${expectedHost}`,
        token,
        port,
        server,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            // Drop keep-alive sockets so close() doesn't hang on shutdown.
            server.closeAllConnections();
            server.close((err) => {
              if (err) {
                closeReject(err);
              } else {
                closeResolve();
              }
            });
          }),
      });
    });
  });
}
