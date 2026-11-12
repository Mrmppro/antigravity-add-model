import { app } from 'electron';
import * as fs from 'fs';
import path from 'path';
import os from 'os';
import { LS_LOG_FILE_NAME } from './constants';

export function getAppDataDirName(): string {
  if (!app.isPackaged) {
    return 'antigravity-dev';
  }
  return app.getName().toLowerCase().replace(/\s+/g, '');
}

export function getAppDataDir(): string {
  return path.join(os.homedir(), '.gemini', getAppDataDirName());
}

export function getSettingsPbPath(): string {
  return path.join(os.homedir(), '.gemini', 'config', 'config.json');
}

/**
 * Returns the path to the persistent app storage file.
 * This is used to back a lightweight key-value store for UI state,
 * and is not used for e.g. settings or other "core" app state.
 */
export function getAppStoragePath(): string {
  return path.join(app.getPath('userData'), 'app_storage.json');
}

/**
 * Returns the path to the persistent window geometry and state file.
 */
export function getWindowStatePath(): string {
  return path.join(app.getPath('userData'), 'window_state.json');
}

/**
 * Returns the path to the file used to communicate AGY Hub's remote debugging port.
 * Used by recording encoder.
 */
export function getActivePortFilePath(): string {
  return path.join(app.getPath('userData'), 'DevToolsActivePort');
}

/**
 * Best-effort POSIX hardening of `DevToolsActivePort`, which holds the CDP
 * WebSocket secret: restricts `userDataDir` to `0o700` and `activePortFile` to
 * `0o600`, each only if it exists, is owned by the current user, and is looser.
 * Never throws.
 */
export function tightenActivePortPermissions(userDataDir: string, activePortFile: string): void {
  if (process.platform === 'win32') {
    return;
  }
  for (const [target, mode] of [
    [userDataDir, 0o700],
    [activePortFile, 0o600],
  ] as const) {
    try {
      const st = fs.statSync(target);
      if (st.uid === process.getuid?.() && (st.mode & 0o777 & ~mode)) {
        fs.chmodSync(target, st.mode & mode);
      }
    } catch {
      // Missing path or foreign filesystem: leave as is.
    }
  }
}

export function getLsLogPath(): string {
  return path.join(app.getPath('logs'), LS_LOG_FILE_NAME);
}

/** User data dir for the old IDE (source for copy). */
export const IDE_OLD_DATA_DIR = path.join(os.homedir(), '.gemini', 'antigravity');
/** User data dir for the separately installed IDE (destination for copy). */
export const IDE_NEW_DATA_DIR = path.join(os.homedir(), '.gemini', 'antigravity-ide');
/** User data dir for backup (destination for backup copy). */
export const IDE_BACKUP_DATA_DIR = path.join(os.homedir(), '.gemini', 'antigravity-backup');
