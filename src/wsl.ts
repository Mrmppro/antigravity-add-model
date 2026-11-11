import { execFile, spawn } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { load as yamlLoad } from 'js-yaml';

export const WSL_EXE = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'wsl.exe');

/** Auto-updater service; /releases maps stable versions to build execution ids. */
export const DEFAULT_UPDATER_BASE_URL = 'https://antigravity-hub-auto-updater-974169037036.us-central1.run.app';

/** Public GCS bucket (HTTPS view) where release artifacts are published. */
export const PUBLIC_ARTIFACT_BASE_URL = 'https://storage.googleapis.com/antigravity-public';

/** userData file persisting the distro choice across relaunches that drop switches. */
export const WSL_STATE_FILE = 'wsl_state.json';

export interface WslDistro {
  isDefault: boolean;
  name: string;
  version: number;
}

export interface WindowsToDistroPathResult {
  path?: string;
  error?: string;
  warning?: string;
}

/** POSIX path of the versioned server directory inside the distro. */
export function serverInstallDir(version: string): string {
  return `$HOME/.antigravity-server/bin/${version}`;
}

/** POSIX path of the server binary inside the distro. */
export function serverBinaryPath(version: string): string {
  return `${serverInstallDir(version)}/language_server`;
}

export function isWslAvailable(): boolean {
  return process.platform === 'win32' && fs.existsSync(WSL_EXE);
}

/**
 * Decodes wsl.exe output. wsl.exe's own messages (e.g. --list) are UTF-16LE
 * while output of Linux programs is UTF-8
 */
export function decodeWslOutput(buf: Buffer): string {
  return buf.includes(0) ? buf.toString('utf16le').replace(/^\uFEFF/, '') : buf.toString('utf8');
}

/**
 * Parses `wsl.exe --list --verbose` output ("* Ubuntu  Running  2" rows);
 * the header row never matches (its last column is not a number).
 */
export function parseWslListOutput(output: string): WslDistro[] {
  const distros: WslDistro[] = [];
  for (const line of output.split(/\r?\n/)) {
    const m = /^(\*?)\s*(\S+)\s+\S+\s+(\d+)\s*$/.exec(line);
    if (m) {
      distros.push({
        isDefault: m[1] === '*',
        name: m[2],
        version: parseInt(m[3], 10),
      });
    }
  }
  return distros;
}

/** True for WSL 2 distros that aren't container runtimes (docker/rancher/podman). */
export function isSupportedDevDistro(d: WslDistro): boolean {
  return d.version === 2 && !/^(docker-desktop|rancher-|podman-)/i.test(d.name);
}

const execFileAsync = promisify(execFile);

async function execWsl(args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync(WSL_EXE, args, {
      encoding: 'buffer',
      timeout: 30000,
    });
    return decodeWslOutput(stdout as Buffer);
  } catch (err) {
    const e = err as Error & { stderr?: Buffer };
    const stderr = e.stderr ? `\n${decodeWslOutput(e.stderr)}` : '';
    throw new Error(`wsl.exe ${args.join(' ')} failed: ${e.message}${stderr}`);
  }
}

/** Lists installed distros suitable as dev environments. */
export async function listWslDistros(): Promise<WslDistro[]> {
  const output = await execWsl(['--list', '--verbose']);
  return parseWslListOutput(output).filter(isSupportedDevDistro);
}

// ---------------------------------------------------------------------------
// Active session state and path translation
// ---------------------------------------------------------------------------

let _activeDistro = '';

/** Marks the distro this app instance's LS runs in ('' = local mode). */
export function setActiveWslDistro(distro: string): void {
  _activeDistro = distro;
}

/** The distro this app instance's LS runs in, or '' in local mode. */
export function getActiveWslDistro(): string {
  return _activeDistro;
}

/** Reads the persisted distro choice ('' = local mode or no/invalid state). */
export function readPersistedWslDistro(stateFilePath: string): string {
  try {
    const parsed = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
    const distro = parsed.distro;
    return typeof distro === 'string' ? distro : '';
  } catch {
    return '';
  }
}

/** Persists the distro choice ('' = local mode). Best-effort: logs failures, never throws. */
export function persistWslDistro(stateFilePath: string, distro: string): void {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify({ distro }), 'utf-8');
  } catch (err) {
    console.error('Failed to persist WSL distro choice:', err);
  }
}

/**
 * Translates a path picked in a Windows dialog into the distro's view.
 * Handles \\wsl.localhost\ and legacy \\wsl$\ UNC paths, drive letters
 * (mapped to /mnt/<drive> with a performance warning), and passes through
 * POSIX paths. Paths in a different distro are rejected.
 */
export function windowsToDistroPath(winPath: string, distro: string): WindowsToDistroPathResult {
  const p = winPath.trim();
  if (p.startsWith('/')) {
    return { path: p };
  }
  const unc = /^\\\\wsl(?:\.localhost|\$)\\([^\\]+)(\\.*)?$/i.exec(p);
  if (unc) {
    if (unc[1].toLowerCase() !== distro.toLowerCase()) {
      return {
        error: `This folder belongs to the WSL distro "${unc[1]}", but this window is connected to "${distro}".`,
      };
    }
    const rest = (unc[2] || '/').replace(/\\/g, '/');
    return { path: rest === '' ? '/' : rest };
  }
  const drive = /^([A-Za-z]):([\\/].*)?$/.exec(p);
  if (drive) {
    const rest = (drive[2] || '/').replace(/\\/g, '/');
    return {
      path: `/mnt/${drive[1].toLowerCase()}${rest}`,
      warning:
        'This folder is on the Windows filesystem. Accessing it from WSL (via /mnt) can be slow — for best performance keep projects inside the WSL filesystem.',
    };
  }
  return { error: `This location cannot be opened in WSL: ${winPath}` };
}

/** Maps a POSIX path inside the distro to its \\wsl.localhost UNC view. */
export function distroToWindowsPath(posixPath: string, distro: string): string {
  return `\\\\wsl.localhost\\${distro}${posixPath.replace(/\//g, '\\')}`;
}

/** Returns $HOME inside the distro. */
export async function getDistroHome(distro: string): Promise<string> {
  const home = (await execWsl(wslShellArgs(distro, 'echo "$HOME"'))).trim();
  if (!home.startsWith('/')) {
    throw new Error(`Could not resolve $HOME in distro ${distro}: "${home}"`);
  }
  return home;
}

/**
 * Runs `sh -c <script>` in the distro. LS args are passed as positional
 * parameters to avoid quoting issues. Uses --exec so no intermediate shell
 * reinterprets the arguments.
 */
export function wslShellArgs(distro: string, script: string, positional: string[] = []): string[] {
  return ['-d', distro, '--exec', 'sh', '-c', script, 'sh', ...positional];
}

/** True if the given server version is already installed in the distro. */
export async function isServerInstalled(distro: string, version: string): Promise<boolean> {
  try {
    await execWsl(wslShellArgs(distro, `test -x "${serverBinaryPath(version)}"`));
    return true;
  } catch {
    return false;
  }
}

/** Builds the interruption-safe install script run inside the distro. */
export function buildInstallScript(version: string, sha256: string): string {
  const dir = serverInstallDir(version);
  return [
    'set -e',
    `dir="${dir}"`,
    'mkdir -p "$dir"',
    'tmp="$dir/.language_server.partial.$$"',
    'trap \'rm -f "$tmp"\' EXIT',
    'cat > "$tmp"',
    `echo "${sha256}  $tmp" | sha256sum -c - >/dev/null`,
    'chmod +x "$tmp"',
    'mv -f "$tmp" "$dir/language_server"',
    'trap - EXIT',
  ].join('; ');
}

/**
 * Writes a Linux language server binary into the distro's versioned install
 * dir. Skips the copy when already installed.
 */
export async function installServerBinary(distro: string, version: string, data: Buffer): Promise<void> {
  if (await isServerInstalled(distro, version)) {
    console.log(`[WSL] Server ${version} already installed in ${distro}`);
    return;
  }
  const sha256 = crypto.createHash('sha256').update(data).digest('hex');
  const script = buildInstallScript(version, sha256);
  console.log(`[WSL] Installing server ${version} into ${distro}…`);
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(WSL_EXE, wslShellArgs(distro, script), {
      stdio: ['pipe', 'ignore', 'pipe'],
    });
    const stderrChunks: Buffer[] = [];
    proc.stderr?.on('data', (d: Buffer) => stderrChunks.push(d));
    proc.stdin?.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code !== 'EPIPE') {
        reject(err);
      }
    });
    proc.stdin?.end(data);
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`WSL install failed (code=${code}): ${decodeWslOutput(Buffer.concat(stderrChunks))}`));
      }
    });
  });
  console.log(`[WSL] Installed server ${version} into ${distro}`);
}

/** URL of the GCS folder with stable `version` artifacts (antigravity-hub/<version>-<execution_id>/). */
export async function resolveStableArtifactDir(version: string): Promise<string> {
  const url = `${DEFAULT_UPDATER_BASE_URL}/releases`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to list releases: HTTP ${res.status}`);
  }
  const releases = (await res.json()) as Array<{ version: string; execution_id: string }>;
  const release = releases.find((r) => r.version === version);
  if (!release) {
    throw new Error(`Release ${version} not found at ${url}`);
  }
  return `${PUBLIC_ARTIFACT_BASE_URL}/antigravity-hub/${version}-${release.execution_id}`;
}

/** URL of the GCS folder for the latest insiders version, as published in the latest-<arch>-linux.yml channel file. */
export async function resolveInsidersArtifactDir(arch: string): Promise<string> {
  const url = `${PUBLIC_ARTIFACT_BASE_URL}/insiders/latest-${arch}-linux.yml`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch insiders channel file: HTTP ${res.status}`);
  }
  const match = yamlLoad(await res.text()) as { version?: string };
  if (!match?.version) {
    throw new Error(`No version in insiders channel file at ${url}`);
  }
  return `${PUBLIC_ARTIFACT_BASE_URL}/insiders/${String(match.version)}`;
}

/**
 * Returns the Linux LS binary from the same build as this Hub, downloaded
 * from the release bucket. ANTIGRAVITY_WSL_LS_PATH overrides (for dev).
 */
export async function resolveServerBinarySource(version: string, isInsiders: boolean): Promise<Buffer> {
  const override = process.env.ANTIGRAVITY_WSL_LS_PATH;
  if (override) {
    if (!fs.existsSync(override)) {
      throw new Error(`ANTIGRAVITY_WSL_LS_PATH does not exist: ${override}`);
    }
    return fs.promises.readFile(override);
  }
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  const artifactDir = isInsiders ? await resolveInsidersArtifactDir(arch) : await resolveStableArtifactDir(version);
  const url = `${artifactDir}/unsigned/language_server-linux-${arch}`;
  console.log(`[WSL] Downloading server binary from ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download WSL server binary: HTTP ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Installs the server into the distro if missing; returns its POSIX path. */
export async function ensureServerInstalled(
  distro: string,
  version: string,
  isInsiders: boolean,
  onStatus?: (status: string) => void,
): Promise<string> {
  if (!(await isServerInstalled(distro, version))) {
    onStatus?.('Downloading the Antigravity binary\u2026');
    const data = await resolveServerBinarySource(version, isInsiders);
    onStatus?.(`Installing into ${distro}\u2026`);
    await installServerBinary(distro, version, data);
  }
  return serverBinaryPath(version);
}
