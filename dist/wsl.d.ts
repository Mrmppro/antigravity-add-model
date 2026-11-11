export declare const WSL_EXE: string;
/** Auto-updater service; /releases maps stable versions to build execution ids. */
export declare const DEFAULT_UPDATER_BASE_URL = "https://antigravity-hub-auto-updater-974169037036.us-central1.run.app";
/** Public GCS bucket (HTTPS view) where release artifacts are published. */
export declare const PUBLIC_ARTIFACT_BASE_URL = "https://storage.googleapis.com/antigravity-public";
/** userData file persisting the distro choice across relaunches that drop switches. */
export declare const WSL_STATE_FILE = "wsl_state.json";
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
export declare function serverInstallDir(version: string): string;
/** POSIX path of the server binary inside the distro. */
export declare function serverBinaryPath(version: string): string;
export declare function isWslAvailable(): boolean;
/**
 * Decodes wsl.exe output. wsl.exe's own messages (e.g. --list) are UTF-16LE
 * while output of Linux programs is UTF-8
 */
export declare function decodeWslOutput(buf: Buffer): string;
/**
 * Parses `wsl.exe --list --verbose` output ("* Ubuntu  Running  2" rows);
 * the header row never matches (its last column is not a number).
 */
export declare function parseWslListOutput(output: string): WslDistro[];
/** True for WSL 2 distros that aren't container runtimes (docker/rancher/podman). */
export declare function isSupportedDevDistro(d: WslDistro): boolean;
/** Lists installed distros suitable as dev environments. */
export declare function listWslDistros(): Promise<WslDistro[]>;
/** Marks the distro this app instance's LS runs in ('' = local mode). */
export declare function setActiveWslDistro(distro: string): void;
/** The distro this app instance's LS runs in, or '' in local mode. */
export declare function getActiveWslDistro(): string;
/** Reads the persisted distro choice ('' = local mode or no/invalid state). */
export declare function readPersistedWslDistro(stateFilePath: string): string;
/** Persists the distro choice ('' = local mode). Best-effort: logs failures, never throws. */
export declare function persistWslDistro(stateFilePath: string, distro: string): void;
/**
 * Translates a path picked in a Windows dialog into the distro's view.
 * Handles \\wsl.localhost\ and legacy \\wsl$\ UNC paths, drive letters
 * (mapped to /mnt/<drive> with a performance warning), and passes through
 * POSIX paths. Paths in a different distro are rejected.
 */
export declare function windowsToDistroPath(winPath: string, distro: string): WindowsToDistroPathResult;
/** Maps a POSIX path inside the distro to its \\wsl.localhost UNC view. */
export declare function distroToWindowsPath(posixPath: string, distro: string): string;
/** Returns $HOME inside the distro. */
export declare function getDistroHome(distro: string): Promise<string>;
/**
 * Runs `sh -c <script>` in the distro. LS args are passed as positional
 * parameters to avoid quoting issues. Uses --exec so no intermediate shell
 * reinterprets the arguments.
 */
export declare function wslShellArgs(distro: string, script: string, positional?: string[]): string[];
/** True if the given server version is already installed in the distro. */
export declare function isServerInstalled(distro: string, version: string): Promise<boolean>;
/** Builds the interruption-safe install script run inside the distro. */
export declare function buildInstallScript(version: string, sha256: string): string;
/**
 * Writes a Linux language server binary into the distro's versioned install
 * dir. Skips the copy when already installed.
 */
export declare function installServerBinary(distro: string, version: string, data: Buffer): Promise<void>;
/** URL of the GCS folder with stable `version` artifacts (antigravity-hub/<version>-<execution_id>/). */
export declare function resolveStableArtifactDir(version: string): Promise<string>;
/** URL of the GCS folder for the latest insiders version, as published in the latest-<arch>-linux.yml channel file. */
export declare function resolveInsidersArtifactDir(arch: string): Promise<string>;
/**
 * Returns the Linux LS binary from the same build as this Hub, downloaded
 * from the release bucket. ANTIGRAVITY_WSL_LS_PATH overrides (for dev).
 */
export declare function resolveServerBinarySource(version: string, isInsiders: boolean): Promise<Buffer>;
/** Installs the server into the distro if missing; returns its POSIX path. */
export declare function ensureServerInstalled(distro: string, version: string, isInsiders: boolean, onStatus?: (status: string) => void): Promise<string>;
//# sourceMappingURL=wsl.d.ts.map