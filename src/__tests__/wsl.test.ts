import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  parseWslListOutput,
  isSupportedDevDistro,
  decodeWslOutput,
  buildInstallScript,
  wslShellArgs,
  serverBinaryPath,
  windowsToDistroPath,
  distroToWindowsPath,
  getActiveWslDistro,
  setActiveWslDistro,
  resolveStableArtifactDir,
  resolveInsidersArtifactDir,
  resolveServerBinarySource,
  persistWslDistro,
  readPersistedWslDistro,
  PUBLIC_ARTIFACT_BASE_URL,
  DEFAULT_UPDATER_BASE_URL,
} from '../wsl';

const SAMPLE_LIST = [
  '  NAME              STATE           VERSION',
  '* Ubuntu            Running         2',
  '  Debian            Stopped         2',
  '  docker-desktop    Running         2',
  '  rancher-desktop   Stopped         2',
  '  podman-machine    Stopped         2',
  '  LegacyDistro      Stopped         1',
  '',
].join('\r\n');

describe('parseWslListOutput', () => {
  it('parses names, states, versions and the default marker', () => {
    const distros = parseWslListOutput(SAMPLE_LIST);
    expect(distros).toHaveLength(6);
    expect(distros[0]).toEqual({
      name: 'Ubuntu',
      version: 2,
      isDefault: true,
    });
    expect(distros[1].isDefault).toBe(false);
    expect(distros[5].version).toBe(1);
  });

  it('returns empty on garbage output', () => {
    expect(parseWslListOutput('')).toEqual([]);
    expect(parseWslListOutput('no distros installed')).toEqual([]);
  });
});

describe('isSupportedDevDistro', () => {
  it('keeps WSL 2 user distros and drops container runtimes and WSL 1', () => {
    const supported = parseWslListOutput(SAMPLE_LIST).filter(isSupportedDevDistro);
    expect(supported.map((d) => d.name)).toEqual(['Ubuntu', 'Debian']);
  });
});

describe('decodeWslOutput', () => {
  it('decodes UTF-16LE output from wsl.exe itself', () => {
    const buf = Buffer.from('* Ubuntu Running 2', 'utf16le');
    expect(decodeWslOutput(buf)).toBe('* Ubuntu Running 2');
  });

  it('decodes UTF-8 output from Linux programs', () => {
    expect(decodeWslOutput(Buffer.from('hello', 'utf8'))).toBe('hello');
  });
});

describe('buildInstallScript', () => {
  it('writes to a temp file, verifies the checksum, then renames', () => {
    const script = buildInstallScript('1.2.3', 'abc123');
    expect(script).toContain('$HOME/.antigravity-server/bin/1.2.3');
    expect(script).toContain('cat > "$tmp"');
    expect(script).toContain('sha256sum -c');
    expect(script).toContain('abc123');
    expect(script).toContain('mv -f "$tmp" "$dir/language_server"');
    // Interrupted installs must not leave partial files behind.
    expect(script).toContain(`trap 'rm -f "$tmp"' EXIT`);
  });
});

describe('wslShellArgs', () => {
  it('passes positional args after the script', () => {
    expect(wslShellArgs('Ubuntu', 'exec "$1"', ['--flag'])).toEqual([
      '-d',
      'Ubuntu',
      '--exec',
      'sh',
      '-c',
      'exec "$1"',
      'sh',
      '--flag',
    ]);
  });
});

describe('serverBinaryPath', () => {
  it('is versioned under ~/.antigravity-server', () => {
    expect(serverBinaryPath('2.12.3')).toBe('$HOME/.antigravity-server/bin/2.12.3/language_server');
  });
});

describe('windowsToDistroPath', () => {
  it('translates wsl.localhost UNC paths for the active distro', () => {
    expect(windowsToDistroPath('\\\\wsl.localhost\\Ubuntu\\home\\user\\proj', 'Ubuntu')).toEqual({
      path: '/home/user/proj',
    });
  });

  it('translates legacy wsl$ UNC paths', () => {
    expect(windowsToDistroPath('\\\\wsl$\\Ubuntu\\home\\user', 'Ubuntu')).toEqual({
      path: '/home/user',
    });
  });

  it('is case-insensitive on the distro name', () => {
    expect(windowsToDistroPath('\\\\wsl.localhost\\ubuntu\\tmp', 'Ubuntu')).toEqual({ path: '/tmp' });
  });

  it('rejects paths from a different distro', () => {
    const t = windowsToDistroPath('\\\\wsl.localhost\\Debian\\home', 'Ubuntu');
    expect(t.path).toBeUndefined();
    expect(t.error).toContain('Debian');
    expect(t.error).toContain('Ubuntu');
  });

  it('maps drive letters to /mnt with a performance warning', () => {
    const t = windowsToDistroPath('C:\\Users\\me\\code', 'Ubuntu');
    expect(t.path).toBe('/mnt/c/Users/me/code');
    expect(t.warning).toContain('slow');
    expect(t.error).toBeUndefined();
  });

  it('handles the distro root and drive root', () => {
    expect(windowsToDistroPath('\\\\wsl.localhost\\Ubuntu', 'Ubuntu').path).toBe('/');
    expect(windowsToDistroPath('D:\\', 'Ubuntu').path).toBe('/mnt/d/');
  });

  it('passes through POSIX paths', () => {
    expect(windowsToDistroPath('/home/user', 'Ubuntu')).toEqual({
      path: '/home/user',
    });
  });

  it('rejects other UNC and relative paths', () => {
    expect(windowsToDistroPath('\\\\server\\share\\x', 'Ubuntu').error).toBeDefined();
    expect(windowsToDistroPath('relative\\path', 'Ubuntu').error).toBeDefined();
  });
});

describe('distroToWindowsPath', () => {
  it('maps POSIX paths to the wsl.localhost UNC view', () => {
    expect(distroToWindowsPath('/home/user/proj', 'Ubuntu')).toBe('\\\\wsl.localhost\\Ubuntu\\home\\user\\proj');
  });
});

describe('active distro state', () => {
  it('defaults to empty and round-trips', () => {
    expect(getActiveWslDistro()).toBe('');
    setActiveWslDistro('Ubuntu');
    expect(getActiveWslDistro()).toBe('Ubuntu');
    setActiveWslDistro('');
  });
});

describe('resolveStableArtifactDir', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('maps a version to its <version>-<execution_id> release folder', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [
        { version: '2.13.0', execution_id: '6362815968182272' },
        { version: '2.12.2', execution_id: '6298742303883264' },
      ],
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveStableArtifactDir('2.12.2')).resolves.toBe(
      `${PUBLIC_ARTIFACT_BASE_URL}/antigravity-hub/2.12.2-6298742303883264`,
    );
    expect(fetchMock).toHaveBeenCalledWith(`${DEFAULT_UPDATER_BASE_URL}/releases`);
  });

  it('rejects when the running version has no published release', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [] })));
    await expect(resolveStableArtifactDir('9.9.9')).rejects.toThrow('9.9.9');
  });
});

describe('resolveInsidersArtifactDir', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads the version from the latest-<arch>-linux.yml channel file', async () => {
    const yml = [
      'version: 1.0.20260911110044',
      'files:',
      '  - url: 1.0.20260911110044/Antigravity - Insiders-x86_64.AppImage',
      'path: 1.0.20260911110044/Antigravity - Insiders-x86_64.AppImage',
    ].join('\n');
    const fetchMock = vi.fn(async () => ({ ok: true, text: async () => yml }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveInsidersArtifactDir('x64')).resolves.toBe(
      `${PUBLIC_ARTIFACT_BASE_URL}/insiders/1.0.20260911110044`,
    );
    expect(fetchMock).toHaveBeenCalledWith(`${PUBLIC_ARTIFACT_BASE_URL}/insiders/latest-x64-linux.yml`);
  });

  it('rejects when the channel file has no version field', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => 'files:\n' })));
    await expect(resolveInsidersArtifactDir('x64')).rejects.toThrow('No version');
  });
});

describe('resolveServerBinarySource', () => {
  afterEach(() => vi.unstubAllGlobals());
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';

  it('downloads the stable LS from its release folder under unsigned/', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url === `${DEFAULT_UPDATER_BASE_URL}/releases`
        ? {
            ok: true,
            status: 200,
            json: async () => [{ version: '2.12.2', execution_id: '629' }],
          }
        : { ok: false, status: 404, json: async () => ({}) },
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveServerBinarySource('2.12.2', false)).rejects.toThrow('HTTP 404');
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${PUBLIC_ARTIFACT_BASE_URL}/antigravity-hub/2.12.2-629/unsigned/language_server-linux-${arch}`,
    );
  });

  it('downloads the insiders LS from the folder named by the channel file', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url === `${PUBLIC_ARTIFACT_BASE_URL}/insiders/latest-${arch}-linux.yml`
        ? { ok: true, status: 200, text: async () => 'version: 1.0.42\nfiles:' }
        : { ok: false, status: 404, text: async () => '' },
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveServerBinarySource('1.0.42', true)).rejects.toThrow('HTTP 404');
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${PUBLIC_ARTIFACT_BASE_URL}/insiders/1.0.42/unsigned/language_server-linux-${arch}`,
    );
  });
});

describe('persistWslDistro / readPersistedWslDistro', () => {
  const stateFile = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wsl-state-')), 'wsl_state.json');

  it('round-trips a distro name', () => {
    const file = stateFile();
    persistWslDistro(file, 'Ubuntu');
    expect(readPersistedWslDistro(file)).toBe('Ubuntu');
  });

  it('round-trips local mode (empty string)', () => {
    const file = stateFile();
    persistWslDistro(file, 'Ubuntu');
    persistWslDistro(file, '');
    expect(readPersistedWslDistro(file)).toBe('');
  });

  it('returns "" when the state file is missing', () => {
    expect(readPersistedWslDistro(stateFile())).toBe('');
  });

  it('returns "" for malformed or unexpected state contents', () => {
    const file = stateFile();
    fs.writeFileSync(file, 'not json');
    expect(readPersistedWslDistro(file)).toBe('');
    fs.writeFileSync(file, JSON.stringify({ distro: 42 }));
    expect(readPersistedWslDistro(file)).toBe('');
  });

  it('does not throw when the state file cannot be written', () => {
    const unwritable = path.join(os.tmpdir(), 'no-such-dir', 'deep', 'wsl_state.json');
    expect(() => persistWslDistro(unwritable, 'Ubuntu')).not.toThrow();
  });
});
