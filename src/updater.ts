import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow, dialog, Menu } from 'electron';
import * as path from 'path';
import { spawn } from 'child_process';
import { SettingKey } from './services/settingsService';
import { UpdateState, UpdateStateType } from './types';

export enum MenuUpdateStep {
  CheckForUpdates = 'Check for Updates',
  CheckingForUpdates = 'Checking for Updates...',
  DownloadingUpdate = 'Downloading Update...',
  RestartToUpdate = 'Restart to Update',
}

export const updateActions: Record<string, (() => void) | undefined> = {
  [MenuUpdateStep.CheckForUpdates]: () => checkForUpdates(true),
  [MenuUpdateStep.CheckingForUpdates]: undefined,
  [MenuUpdateStep.DownloadingUpdate]: undefined,
  [MenuUpdateStep.RestartToUpdate]: () => quitAndInstall(),
};

// True if the last call to check for updates was from a user click in the menu.
let isManualCheck = false;
// How long to wait after app start before first update check (ms)
const INITIAL_CHECK_DELAY_MS = 10000; // 10 seconds
// How often to re-check for updates after the initial check (ms)
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * States in which a newer version is known to exist. Anything else (idle,
 * checking for updates) means we have nothing newer to offer.
 */
const UPDATE_PENDING_STATES = new Set<string>([
  UpdateState.AvailableForDownload,
  UpdateState.Downloading,
  UpdateState.Ready,
]);

let updaterInitialized = false;
let periodicCheckInterval: ReturnType<typeof setInterval> | undefined;

function startAutoUpdateChecks(): void {
  if (periodicCheckInterval) {
    return;
  }
  console.log('[AutoUpdater] Starting auto update checks');
  checkForUpdates();
  periodicCheckInterval = setInterval(checkForUpdates, CHECK_INTERVAL_MS);
}

function stopAutoUpdateChecks(): void {
  console.log('[AutoUpdater] Stopping auto update checks');
  if (periodicCheckInterval) {
    clearInterval(periodicCheckInterval);
    periodicCheckInterval = undefined;
  }
}

export function setAutoUpdateChecking(enabled: boolean): void {
  if (!updaterInitialized) {
    return;
  }
  if (enabled) {
    startAutoUpdateChecks();
  } else {
    stopAutoUpdateChecks();
  }
}

export interface UpdaterState {
  type: UpdateStateType | string;
  update?: { version: string };
  updateType?: number;
}

// The last update state broadcast to renderers.
let lastState: UpdaterState = { type: UpdateState.Idle };

/** Broadcast a state change to every open BrowserWindow. */
export function broadcastState(state: UpdaterState): void {
  lastState = state;
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('updater:state-changed', state);
  }
}

/**
 * Returns the last update state broadcast to renderers.
 */
export function getLastState(): UpdaterState {
  return lastState;
}

/**
 * Updates the state of the menu item based on the current step of the updater.
 */
function updateMenuState(step: MenuUpdateStep): void {
  const menu = Menu.getApplicationMenu();
  if (menu) {
    const item = menu.getMenuItemById('check-for-updates');
    if (item) {
      item.label = step;
      item.enabled = updateActions[step] !== undefined;
    }
  }
}

/**
 * Initializes the auto-updater and registers IPC handlers.
 * Call once after the first window is created.
 */
export function initAutoUpdater(
  isHeadless: boolean,
  settingsService?: {
    getSetting: (key: string) => Promise<boolean>;
    onSettingChanged: (key: string, listener: (enabled: boolean) => void) => { dispose(): void };
  },
): void {
  if (!app.isPackaged) {
    autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.updateConfigPath = path.join(app.getAppPath(), 'dev-app-update.yml');
  }
  if (process.platform === 'win32') {
    autoUpdater.channel = `latest-${process.arch}-win`;
  } else {
    autoUpdater.channel = `latest-${process.arch}`;
  }
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = app.isPackaged;

  // Auto-updater event handlers → broadcast to renderer
  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for update…');
    broadcastState({ type: UpdateState.CheckingForUpdates });
    updateMenuState(MenuUpdateStep.CheckingForUpdates);
  });
  autoUpdater.on('update-available', (info) => {
    console.log(`[AutoUpdater] Update available: ${info.version}`);
    broadcastState({
      type: UpdateState.AvailableForDownload,
      update: { version: info.version },
    });
    updateMenuState(MenuUpdateStep.DownloadingUpdate);
    isManualCheck = false;
  });
  autoUpdater.on('update-not-available', (info) => {
    console.log(`[AutoUpdater] Up to date (${info.version})`);
    broadcastState({ type: UpdateState.Idle });
    updateMenuState(MenuUpdateStep.CheckForUpdates);
    if (isManualCheck && !isHeadless) {
      const win = BrowserWindow.getFocusedWindow();
      const options = {
        type: 'info' as const,
        title: 'Check for Updates',
        message: 'No updates available',
        buttons: ['OK'],
      };
      if (win) {
        dialog.showMessageBox(win, options);
      } else {
        dialog.showMessageBox(options);
      }
    }
    isManualCheck = false;
  });
  autoUpdater.on('download-progress', () => {
    broadcastState({ type: UpdateState.Downloading });
    updateMenuState(MenuUpdateStep.DownloadingUpdate);
  });
  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[AutoUpdater] Update downloaded: ${info.version}`);
    if (isHeadless) {
      if (app.isPackaged) {
        if (process.platform === 'linux') {
          const downloadedFilePath = info.downloadedFile;
          headlessQuitAndInstall(downloadedFilePath);
        } else {
          autoUpdater.quitAndInstall();
        }
      } else {
        console.log('[AutoUpdater] Headless mode: Skipping quitAndInstall (not packaged).');
      }
      return;
    }
    broadcastState({
      type: UpdateState.Ready,
      update: { version: info.version },
    });
    updateMenuState(MenuUpdateStep.RestartToUpdate);
  });
  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err.message);
    broadcastState({ type: UpdateState.Idle });
    updateMenuState(MenuUpdateStep.CheckForUpdates);
    isManualCheck = false;
  });

  updaterInitialized = true;
  if (settingsService) {
    setTimeout(async () => {
      const autoCheckEnabled = await settingsService.getSetting(SettingKey.AUTO_CHECK_FOR_UPDATES);
      setAutoUpdateChecking(autoCheckEnabled);
    }, INITIAL_CHECK_DELAY_MS);
    settingsService.onSettingChanged(SettingKey.AUTO_CHECK_FOR_UPDATES, (enabled: boolean) => {
      setAutoUpdateChecking(enabled);
    });
  } else {
    setTimeout(() => {
      checkForUpdates();
      setInterval(checkForUpdates, CHECK_INTERVAL_MS);
    }, INITIAL_CHECK_DELAY_MS);
  }
}

export function checkForUpdates(isManual = false): void {
  isManualCheck = isManual;
  autoUpdater.checkForUpdates().catch((err) => {
    console.error('[AutoUpdater] Failed to check for updates:', err.message);
  });
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall();
}

/**
 * Builds the update status served to the language server over the loopback
 * host bridge server.
 */
export function getHostUpdateStatus(): { currentVersion: string; latestVersion: string; updateAvailable: boolean } {
  const currentVersion = app.getVersion();
  const state = getLastState();
  const knownVersion = state.update?.version;
  const updateAvailable = UPDATE_PENDING_STATES.has(state.type) && knownVersion !== undefined;
  return {
    currentVersion,
    latestVersion: updateAvailable ? knownVersion : currentVersion,
    updateAvailable,
  };
}

/**
 * Applies an update on behalf of the language server.
 */
export function applyHostUpdate(): boolean {
  const state = getLastState();
  switch (state.type) {
    case UpdateState.Ready:
      if (!app.isPackaged) {
        console.log('[AutoUpdater] Skipping quitAndInstall (requires a packaged app).');
        return false;
      }
      quitAndInstall();
      return true;
    case UpdateState.AvailableForDownload:
    case UpdateState.Downloading:
      console.log('[AutoUpdater] Update already in progress.');
      return true;
    case UpdateState.CheckingForUpdates:
      return true;
    default:
      checkForUpdates();
      return true;
  }
}

function headlessQuitAndInstall(downloadedFilePath: string): void {
  console.log('[AutoUpdater] Headless mode: Scheduling post-quit restart.');
  try {
    const currentPid = process.pid;
    const appPath = process.env.APPIMAGE || process.execPath;
    const args = ['--ozone-platform=headless', '--headless', '--disable-gpu', '--no-sandbox'];
    let script = '';
    if (downloadedFilePath) {
      console.log(`[AutoUpdater] Will manually replace ${appPath} with ${downloadedFilePath}`);
      script = `
        while kill -0 ${currentPid} 2>/dev/null; do sleep 0.5; done
        cp -f "${downloadedFilePath}" "${appPath}"
        chmod +x "${appPath}"
        "${appPath}" ${args.join(' ')}
      `;
    } else {
      console.warn('[AutoUpdater] No downloaded file path found, relaunching without update.');
      script = `
        while kill -0 ${currentPid} 2>/dev/null; do sleep 0.5; done
        sleep 3
        "${appPath}" ${args.join(' ')}
      `;
    }
    const child = spawn('sh', ['-c', script], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, ELECTRON_OZONE_PLATFORM_HINT: 'headless' },
    });
    child.unref();
  } catch (e) {
    console.error('[AutoUpdater] Failed to schedule restart:', e);
  }
  app.quit();
}