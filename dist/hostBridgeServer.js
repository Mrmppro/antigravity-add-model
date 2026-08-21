"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHostBridgeServer = startHostBridgeServer;
const crypto = __importStar(require("node:crypto"));
const http = __importStar(require("node:http"));
const connect_node_1 = require("@connectrpc/connect-node");
const host_bridge_pb_1 = require("./proto/host_bridge_pb");
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
function isLoopbackAddress(remoteAddress) {
    return remoteAddress !== undefined && LOOPBACK_ADDRESSES.has(remoteAddress);
}
/** Extracts `<token>` from an `Authorization: Bearer <token>` header. */
function extractBearerToken(header) {
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
function tokenMatches(provided, expected) {
    const providedBytes = Buffer.from(provided, 'utf8');
    const expectedBytes = Buffer.from(expected, 'utf8');
    if (providedBytes.length !== expectedBytes.length) {
        return false;
    }
    return crypto.timingSafeEqual(providedBytes, expectedBytes);
}
function sendJson(res, statusCode, body) {
    const payload = JSON.stringify(body);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Cache-Control': 'no-store',
    });
    res.end(payload);
}
function logRejection(reason, detail) {
    const suffix = detail === undefined ? '' : ` (${detail})`;
    console.warn(`[HostBridgeServer] Rejected request: ${reason}${suffix}`);
}
function passesSecurityChecks(req, res, expectedHost, token) {
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
function buildRoutes(options) {
    return (router) => {
        router.service(host_bridge_pb_1.HostBridgeService, {
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
function startHostBridgeServer(options) {
    const token = crypto.randomBytes(32).toString('hex');
    const handleRequest = (0, connect_node_1.connectNodeAdapter)({ routes: buildRoutes(options) });
    return new Promise((resolve, reject) => {
        let expectedHost = '';
        const server = http.createServer((req, res) => {
            if (!passesSecurityChecks(req, res, expectedHost, token)) {
                return;
            }
            handleRequest(req, res);
        });
        const onStartupError = (err) => {
            server.removeListener('error', onStartupError);
            reject(err);
        };
        server.on('error', onStartupError);
        server.listen(0, BIND_HOST, () => {
            server.removeListener('error', onStartupError);
            server.on('error', (err) => {
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
                close: () => new Promise((closeResolve, closeReject) => {
                    // Drop keep-alive sockets so close() doesn't hang on shutdown.
                    server.closeAllConnections();
                    server.close((err) => {
                        if (err) {
                            closeReject(err);
                        }
                        else {
                            closeResolve();
                        }
                    });
                }),
            });
        });
    });
}
//# sourceMappingURL=hostBridgeServer.js.map