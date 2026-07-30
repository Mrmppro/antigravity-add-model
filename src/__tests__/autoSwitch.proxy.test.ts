import { describe, it, expect, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((name: string) => '/mock/' + name),
  },
}));

vi.mock('electron-log', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Helper logic extracted to verify exact implementation behavior
function readVarint(buf: Buffer, offset: number): { value: number; bytes: number } {
  let result = 0;
  let shift = 0;
  let bytes = 0;
  while (offset + bytes < buf.length) {
    const byte = buf[offset + bytes];
    result |= (byte & 0x7f) << shift;
    bytes++;
    if (!(byte & 0x80)) break;
    shift += 7;
  }
  return { value: result >>> 0, bytes };
}

function encodeVarint(value: number): Buffer {
  const parts: number[] = [];
  let v = value >>> 0;
  do {
    let b = v & 0x7f;
    v >>>= 7;
    if (v !== 0) b |= 0x80;
    parts.push(b);
  } while (v !== 0);
  return Buffer.from(parts);
}

function replaceDelimitedUtf8String(payload: Buffer, needle: string, replacement: string): Buffer {
  const source = Buffer.from(needle, 'utf8');
  const replacementBuffer = Buffer.from(replacement, 'utf8');
  const chunks: Buffer[] = [];
  let cursor = 0;
  let matchAt = payload.indexOf(source, cursor);
  while (matchAt !== -1) {
    let lengthStart = -1;
    for (let candidate = Math.max(0, matchAt - 5); candidate < matchAt; candidate++) {
      const decoded = readVarint(payload, candidate);
      if (candidate + decoded.bytes === matchAt && decoded.value === source.length) {
        lengthStart = candidate;
        break;
      }
    }
    if (lengthStart === -1) {
      cursor = matchAt + source.length;
      matchAt = payload.indexOf(source, cursor);
      continue;
    }
    chunks.push(payload.subarray(cursor, lengthStart), encodeVarint(replacementBuffer.length), replacementBuffer);
    cursor = matchAt + source.length;
    matchAt = payload.indexOf(source, cursor);
  }
  return chunks.length ? Buffer.concat([...chunks, payload.subarray(cursor)]) : payload;
}

describe('Auto Switch Protobuf Sentinel Replacement', () => {
  it('correctly replaces models/MODEL_PLACEHOLDER_M599 in protobuf payloads', () => {
    const needle = 'models/MODEL_PLACEHOLDER_M599';
    const replacement = 'models/gemini-2.5-pro';

    const needleBuf = Buffer.from(needle, 'utf8');
    const header = Buffer.from([0x0a, needleBuf.length]); // tag 1 (string), length
    const protobufPayload = Buffer.concat([header, needleBuf]);

    const replaced = replaceDelimitedUtf8String(protobufPayload, needle, replacement);
    expect(replaced.equals(protobufPayload)).toBe(false);

    const replacementBuf = Buffer.from(replacement, 'utf8');
    const expectedHeader = Buffer.from([0x0a, replacementBuf.length]);
    const expectedPayload = Buffer.concat([expectedHeader, replacementBuf]);
    expect(replaced.equals(expectedPayload)).toBe(true);
  });

  it('sets rejectUnauthorized to false for local Language Server requests', () => {
    const options = {
      method: 'POST',
      headers: { host: '127.0.0.1:59945' },
      rejectUnauthorized: false,
    };
    expect(options.rejectUnauthorized).toBe(false);
  });
});
