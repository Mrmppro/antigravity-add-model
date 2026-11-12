import {
  app,
  BaseWindow,
  BrowserWindow,
  nativeTheme,
  nativeImage,
  powerSaveBlocker,
  WebContentsView,
  WebContents,
} from 'electron';
import { WINDOW_ORIGIN } from './constants';
import { isSameOrigin, openExternalSafely } from './externalUrl';
import { registerKeybindings } from './keybindings';
import path from 'path';
import * as fs from 'fs';
import { getSettingsPbPath, getAppStoragePath } from './paths';
import { attachLoadingOverlay } from './loadingOverlay';
import { getActiveWslDistro } from './wsl';
import { isDebugConsoleEnabled } from './debugConsole';
import {
  resolveInitialWindowState,
  trackWindowState,
  MIN_WINDOW_WIDTH,
  MIN_WINDOW_HEIGHT,
} from './windowState';
import { StorageManager } from './storage';

export let showQuitConfirmation = false;

export function setShowQuitConfirmation(value: boolean): void {
  showQuitConfirmation = value;
}

export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * Reads the user's theme preference from the settings file.
 */
function getThemeMode(): string {
  try {
    const filePath = getSettingsPbPath();
    if (!fs.existsSync(filePath)) {
      return 'DARK';
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const config = JSON.parse(content) as Record<string, any>;
    const themeMode = config?.userSettings?.themeMode;
    if (themeMode && themeMode.includes('INHERIT')) {
      return nativeTheme.shouldUseDarkColors ? 'DARK' : 'LIGHT';
    }
    if (themeMode && themeMode.includes('LIGHT')) {
      return 'LIGHT';
    }
    return 'DARK';
  } catch (e) {
    console.error('Error reading theme mode:', e);
    return 'DARK';
  }
}

/**
 * Ensures the app is visible in the dock for MacOS with the icon set.
 */
function ensureAppIsInDock(): void {
  void app.dock?.show();
  if (isMacOS() && app.dock) {
    const iconPath = path.join(__dirname, '..', 'icon.png');
    app.dock.setIcon(nativeImage.createFromPath(iconPath));
  }
}

export const HUB_SURFACE_COLOR_STORAGE_KEY = 'hubSurfaceBackgroundColor';
const HEX_COLOR_6_RE = /^#[0-9a-fA-F]{6}$/;

const hubWindows = new WeakSet<any>();
const hubViewByWindow = new WeakMap<any, WebContentsView>();
const hubCurtainViewByWindow = new WeakMap<any, WebContentsView>();
const hubCurtainColorByWindow = new WeakMap<any, string>();
const hubCurtainStateByWindow = new WeakMap<any, { cssKey?: string; chain: Promise<any> }>();
const windowByWebContents = new WeakMap<any, any>();
const windowByWebContentsId = new Map<number, any>();

/** Validates a 6-digit `#RRGGBB` hex color string and returns it normalized to uppercase. */
export function normalizeHexSurfaceColor(color: unknown): string | undefined {
  const s = typeof color === 'string' ? color.trim() : '';
  return HEX_COLOR_6_RE.test(s) ? s.toUpperCase() : undefined;
}

/** Builds the minimal opaque HTML document URL loaded into `curtainView` so its compositor surface paints. */
export function buildHubCurtainDataUrl(color: string): string {
  const c = encodeURIComponent(color);
  return `data:text/html,<!doctype html><html style="margin:0;height:100%;background:${c}"><body style="margin:0;height:100%;background:${c}"></body></html>`;
}

function isPopupWindow(win: any): boolean {
  return Boolean(win && typeof win === 'object' && win.__isWebviewPopupWindow);
}

/** Marks a child `BrowserWindow` created by `<webview>` `window.open()` so `getHubWindows()` ignores it. */
export function markWebviewPopupWindow(win: any): void {
  if (win && typeof win === 'object') {
    win.__isWebviewPopupWindow = true;
  }
}

/** Associates `contents` (`hubWcv` or `browserWcv`) with its owning `HubWindow`. */
export function registerWindowWebContents(win: any, contents: any): void {
  if (!win || !contents || typeof contents !== 'object') {
    return;
  }
  const hubWin = win;
  windowByWebContents.set(contents, hubWin);
  if (typeof contents.id === 'number') {
    windowByWebContentsId.set(contents.id, hubWin);
    contents.once?.('destroyed', () => {
      if (windowByWebContentsId.get(contents.id) === hubWin) {
        windowByWebContentsId.delete(contents.id);
      }
    });
  }
}

/** Returns the primary Hub UI `WebContentsView` (`hubWcv`) for `win`. */
export function getHubView(win: any): WebContentsView | undefined {
  return win && typeof win === 'object' ? hubViewByWindow.get(win) : undefined;
}

/** Returns the opaque background `View` curtain separating hidden background `browserWcv` tabs from `hubWcv`. */
export function getHubCurtainView(win: any): WebContentsView | undefined {
  return win && typeof win === 'object' ? hubCurtainViewByWindow.get(win) : undefined;
}

/** Returns the theme surface and curtain background color (`#RRGGBB`) for `win`. */
export function getHubCurtainColor(win?: any): string {
  if (win && typeof win === 'object') {
    const cached = hubCurtainColorByWindow.get(win);
    if (cached) {
      return cached;
    }
  }
  try {
    const storagePath = getAppStoragePath();
    if (fs.existsSync(storagePath)) {
      const parsed = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
      const stored = normalizeHexSurfaceColor(parsed?.[HUB_SURFACE_COLOR_STORAGE_KEY]);
      if (stored) {
        return stored;
      }
    }
  } catch {
    // Fall back to theme settings below.
  }
  return getThemeMode().toUpperCase().includes('LIGHT') ? '#FAFAFA' : '#131313';
}

/** Updates a Hub window's `baseWin` and opaque `curtainView` document to `color` (`#RRGGBB`). */
export function setHubCurtainColor(win: any, color: string): string | undefined {
  const normalized = normalizeHexSurfaceColor(color);
  const curtain = win && typeof win === 'object' ? hubCurtainViewByWindow.get(win) : undefined;
  if (!normalized || !win || !curtain) {
    return undefined;
  }
  hubCurtainColorByWindow.set(win, normalized);
  const w = win;
  if (!w.isDestroyed?.()) {
    w.setBackgroundColor?.(normalized);
  }
  if (!curtain.webContents?.isDestroyed?.()) {
    curtain.setBackgroundColor?.(normalized);
    const st = hubCurtainStateByWindow.get(win) ?? { chain: Promise.resolve() };
    st.chain = st.chain.then(async () => {
      if (
        curtain.webContents?.isDestroyed?.() ||
        hubCurtainColorByWindow.get(win) !== normalized
      ) {
        return;
      }
      const prev = st.cssKey;
      const css = `html, body { background: ${normalized} !important; }`;
      const key = await curtain.webContents
        .insertCSS(css, { cssOrigin: 'user' })
        .catch(() => undefined);
      if (typeof key === 'string' && key) {
        st.cssKey = key;
        if (prev && prev !== key) {
          await curtain.webContents
            .removeInsertedCSS(prev)
            .catch(() => undefined);
        }
      }
    });
    hubCurtainStateByWindow.set(win, st);
  }
  return normalized;
}

/** Returns the trusted Hub UI `WebContents` (`hubWcv.webContents`) for `win`. */
export function getHubWebContents(win: any): WebContents | undefined {
  if (!win || typeof win !== 'object') {
    return undefined;
  }
  return (
    hubViewByWindow.get(win)?.webContents ??
    win.webContents
  );
}

/** Resolves the owning `HubWindow` for `hubWcv`, `browserWcv`, or `<webview>` `contents`. */
export function resolveHubWindowFromWebContents(contents: any): any {
  if (!contents || typeof contents !== 'object') {
    return undefined;
  }
  const direct =
    windowByWebContents.get(contents) ??
    (typeof contents.id === 'number'
      ? windowByWebContentsId.get(contents.id)
      : undefined);
  if (direct && !direct.isDestroyed?.() && !isPopupWindow(direct)) {
    return direct;
  }
  if (contents.hostWebContents && contents.hostWebContents !== contents) {
    const fromHost = resolveHubWindowFromWebContents(contents.hostWebContents);
    if (fromHost) {
      return fromHost;
    }
  }
  for (const win of getHubWindows()) {
    const hubContents = getHubWebContents(win);
    if (
      hubContents === contents ||
      (typeof contents.id === 'number' && hubContents?.id === contents.id)
    ) {
      return win;
    }
  }
  if (typeof BrowserWindow?.fromWebContents === 'function') {
    const candidate =
      (contents.hostWebContents
        ? BrowserWindow.fromWebContents(contents.hostWebContents)
        : null) ?? BrowserWindow.fromWebContents(contents);
    if (candidate && !candidate.isDestroyed?.() && !isPopupWindow(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

/** Returns all open top-level Hub windows. */
export function getHubWindows(): any[] {
  const candidates: any[] = [];
  const seen = new Set<any>();
  const baseWins =
    typeof BaseWindow?.getAllWindows === 'function'
      ? BaseWindow.getAllWindows()
      : [];
  const browserWins =
    typeof BrowserWindow?.getAllWindows === 'function'
      ? BrowserWindow.getAllWindows()
      : [];
  for (const win of [...baseWins, ...browserWins]) {
    if (!win || typeof win !== 'object' || seen.has(win) || win.isDestroyed?.()) {
      continue;
    }
    seen.add(win);
    if (hubWindows.has(win) || !isPopupWindow(win)) {
      candidates.push(win);
    }
  }
  return candidates;
}

/** Returns the currently focused top-level `HubWindow`, if any. */
export function getFocusedHubWindow(): any {
  const focused =
    (typeof BaseWindow?.getFocusedWindow === 'function'
      ? BaseWindow.getFocusedWindow()
      : null) ??
    (typeof BrowserWindow?.getFocusedWindow === 'function'
      ? BrowserWindow.getFocusedWindow()
      : null);
  return focused &&
    !focused.isDestroyed?.() &&
    (hubWindows.has(focused) || !isPopupWindow(focused))
    ? focused
    : undefined;
}

export interface CreateWindowOptions {
  cascade?: boolean;
}

/**
 * Creates and returns a new Hub window pointed at `url`.
 */
export function createWindow(
  url: string,
  storageManager?: StorageManager,
  options?: CreateWindowOptions
): any {
  ensureAppIsInDock();
  const existingWindows = options?.cascade ? getHubWindows() : [];
  const initialWindowState = resolveInitialWindowState({
    cascadeFromWindow:
      existingWindows.length > 0
        ? (getFocusedHubWindow() ?? existingWindows[existingWindows.length - 1])
        : undefined,
  });
  const theme = getThemeMode().toUpperCase();
  const isLight = theme.includes('LIGHT');
  const backgroundColor = isLight ? '#FAFAFA' : '#131313';
  const foregroundColor = isLight ? '#383A42' : '#FAFAFA';
  const wslBadge = getActiveWslDistro() ? ` (WSL: ${getActiveWslDistro()})` : '';

  const windowOptions: any = {
    ...(initialWindowState.x !== undefined && initialWindowState.y !== undefined
      ? { x: initialWindowState.x, y: initialWindowState.y }
      : {}),
    width: initialWindowState.width,
    height: initialWindowState.height,
    ...(initialWindowState.isFullScreen ? { fullscreen: true } : {}),
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    title: app.getName() + wslBadge,
    icon: path.join(__dirname, '..', 'icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: isMacOS()
      ? false
      : {
          color: backgroundColor,
          symbolColor: foregroundColor,
          height: 30,
        },
    backgroundColor,
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDebugConsoleEnabled(),
      webviewTag: true,
    },
  };

  const curtainColor = getHubCurtainColor();
  const { webPreferences, ...baseWindowOptions } = windowOptions;

  const baseWin = new BaseWindow({
    ...baseWindowOptions,
    backgroundColor: curtainColor,
  });

  const curtainView = new WebContentsView({
    webPreferences: { sandbox: true, javascript: false },
  });
  curtainView.setBackgroundColor?.(curtainColor);
  const initialCurtainLoad = Promise.resolve(
    curtainView.webContents?.loadURL?.(buildHubCurtainDataUrl(curtainColor))
  ).catch(() => undefined);

  const hubWcv = new WebContentsView({
    webPreferences: { ...webPreferences, transparent: true },
  });
  hubWcv.setBackgroundColor?.('#00000000');

  baseWin.contentView.addChildView(curtainView);
  baseWin.contentView.addChildView(hubWcv);

  const syncHubViewBounds = () => {
    if (!baseWin.isDestroyed?.() && !hubWcv.webContents?.isDestroyed?.()) {
      const [width, height] = baseWin.getContentSize();
      curtainView.setBounds({ x: 0, y: 0, width, height });
      hubWcv.setBounds({ x: 0, y: 0, width, height });
    }
  };
  syncHubViewBounds();
  baseWin.on('resize', syncHubViewBounds);

  const win: any = baseWin;
  Object.defineProperty(win, 'webContents', {
    get: () => hubWcv.webContents,
    configurable: true,
  });
  win.loadURL = (targetUrl: string, opts?: any) => hubWcv.webContents.loadURL(targetUrl, opts);

  hubViewByWindow.set(win, hubWcv);
  hubCurtainViewByWindow.set(win, curtainView);
  hubCurtainColorByWindow.set(win, curtainColor);
  hubCurtainStateByWindow.set(win, { chain: initialCurtainLoad });

  const onCurtainProcessGone = () => {
    if (!baseWin.isDestroyed?.() && !curtainView.webContents?.isDestroyed?.()) {
      const currentColor = hubCurtainColorByWindow.get(win) ?? curtainColor;
      const st = hubCurtainStateByWindow.get(win) ?? {
        chain: Promise.resolve(),
      };
      st.cssKey = undefined;
      st.chain = st.chain.then(() =>
        Promise.resolve(
          curtainView.webContents?.loadURL?.(buildHubCurtainDataUrl(currentColor))
        ).catch(() => undefined)
      );
      hubCurtainStateByWindow.set(win, st);
    }
  };
  curtainView.webContents?.on?.('render-process-gone', onCurtainProcessGone as any);

  if (initialWindowState.isFullScreen) {
    if (!win.isFullScreen?.()) {
      win.setFullScreen?.(true);
    }
    syncHubViewBounds?.();
  } else if (initialWindowState.isMaximized) {
    win.maximize?.();
    syncHubViewBounds?.();
  }

  trackWindowState(win, initialWindowState);

  const hubContents = getHubWebContents(win);
  if (!hubContents) {
    throw new Error('Failed to initialize Hub WebContents');
  }
  hubWindows.add(win);
  registerWindowWebContents(win, hubContents);

  const handleTitleUpdate = (_event: any, title: string) => {
    if (win.isDestroyed?.()) {
      return;
    }
    const maxLength = 25;
    const truncated = title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
    win.setTitle(truncated + wslBadge);
  };
  hubContents.on?.('page-title-updated', handleTitleUpdate);

  const guardExternalNavigation = (event: any) => {
    if (!event.isMainFrame) {
      return;
    }
    if (isSameOrigin(event.url, hubContents.getURL())) {
      return;
    }
    event.preventDefault();
    void openExternalSafely(event.url, 'unconfirmed');
  };

  win.on('closed', () => {
    for (const [id, mappedWin] of windowByWebContentsId.entries()) {
      if (mappedWin === win) {
        windowByWebContentsId.delete(id);
      }
    }
    win.off?.('resize', syncHubViewBounds);
    hubContents.off?.('page-title-updated', handleTitleUpdate);
    hubContents.off?.('will-navigate', guardExternalNavigation);
    hubContents.off?.('will-redirect', guardExternalNavigation);
    hubViewByWindow.delete(win);
    const curtainContents = hubCurtainViewByWindow.get(win)?.webContents;
    curtainContents?.off?.('render-process-gone', onCurtainProcessGone as any);
    if (curtainContents && !curtainContents.isDestroyed?.()) {
      curtainContents.close?.();
    }
    hubCurtainViewByWindow.delete(win);
    hubCurtainColorByWindow.delete(win);
    hubCurtainStateByWindow.delete(win);
    if (!hubContents.isDestroyed?.()) {
      hubContents.close?.();
    }
  });

  hubContents.setWindowOpenHandler((details) => {
    void openExternalSafely(details.url, 'unconfirmed');
    return { action: 'deny' };
  });

  hubContents.on('will-navigate', guardExternalNavigation);
  hubContents.on('will-redirect', guardExternalNavigation);

  attachLoadingOverlay(win, foregroundColor, backgroundColor);
  registerKeybindings(win, {
    createNewWindow: () => {
      void createWindow(url, storageManager, { cascade: true });
    },
    onQuitRequested: () => {
      showQuitConfirmation = true;
      app.quit();
    },
  });

  // Zoom persistence
  if (storageManager) {
    const ZOOM_LEVEL_KEY = 'zoomLevel';
    let isRestoringZoom = false;
    const applyStoredZoomLevel = async () => {
      const items = await storageManager.getItems();
      if (win.isDestroyed?.() || hubContents.isDestroyed?.()) {
        return;
      }
      const stored = items[ZOOM_LEVEL_KEY];
      if (stored !== undefined) {
        const level = parseFloat(stored);
        if (!isNaN(level)) {
          isRestoringZoom = true;
          hubContents.setZoomLevel(level);
          isRestoringZoom = false;
        }
      }
    };
    const handleDidFinishLoad = () => {
      if (!win.isDestroyed?.() && !hubContents.isDestroyed?.()) {
        void applyStoredZoomLevel();
      }
    };
    hubContents.on('did-finish-load', handleDidFinishLoad);
    const handleZoomChanged = (_event: any, _direction: any) => {
      if (isRestoringZoom || win.isDestroyed?.() || hubContents.isDestroyed?.()) {
        return;
      }
      const currentLevel = hubContents.getZoomLevel();
      void storageManager.updateItems({
        [ZOOM_LEVEL_KEY]: String(currentLevel),
      });
    };
    hubContents.on('zoom-changed', handleZoomChanged);
    win.on('closed', () => {
      hubContents.off?.('did-finish-load', handleDidFinishLoad);
      hubContents.off?.('zoom-changed', handleZoomChanged);
    });
  }

  void win.loadURL(url);
  return win;
}

/**
 * Focuses a window if it exists, or creates a new one.
 */
export const showOrCreateWindow = (port: number, storageManager?: StorageManager): void => {
  const wins = getHubWindows();
  if (wins.length > 0) {
    if (wins[0].isMinimized()) {
      wins[0].restore();
    }
    wins[0].show();
    wins[0].focus();
  } else {
    createWindow(`${WINDOW_ORIGIN}:${port}/`, storageManager);
  }
};

/**
 * Manages the power save blocker to keep the computer awake.
 */
export class SleepBlocker {
  private static instance: SleepBlocker;
  private currentBlockerId: number | null = null;

  static getInstance(): SleepBlocker {
    if (!SleepBlocker.instance) {
      SleepBlocker.instance = new SleepBlocker();
    }
    return SleepBlocker.instance;
  }

  shouldKeepComputerAwake(keep: boolean | undefined): void {
    if (keep) {
      if (this.currentBlockerId === null) {
        this.currentBlockerId = powerSaveBlocker.start('prevent-display-sleep');
        console.log('Power save blocker started:', this.currentBlockerId);
      }
    } else {
      if (this.currentBlockerId !== null) {
        powerSaveBlocker.stop(this.currentBlockerId);
        console.log('Power save blocker stopped:', this.currentBlockerId);
        this.currentBlockerId = null;
      }
    }
  }
}

export function getNodeWrapperPaths(
  envPath: string,
  os: string,
  isPackaged: boolean,
  userDataPath: string,
  baseDir: string
): { newEnvPath: string; nodeWrapperPath?: string; binPath?: string } {
  const delimiter = os === 'win32' ? ';' : ':';
  if (!isPackaged) {
    const devBinPath = path.join(baseDir, '..', 'node_modules', '.bin');
    return {
      newEnvPath: `${devBinPath}${delimiter}${envPath || ''}`,
      nodeWrapperPath: undefined,
      binPath: undefined,
    };
  }
  const binPath = path.join(userDataPath, 'bin');
  const nodeWrapperPath = path.join(binPath, os === 'win32' ? 'agy-node.cmd' : 'agy-node');
  return {
    newEnvPath: `${binPath}${delimiter}${envPath || ''}`,
    nodeWrapperPath,
    binPath,
  };
}

/**
 * Sets up a wrapper script for Node.js that runs Electron as Node.
 */
export function setupNodeWrapper(env: Record<string, string | undefined>): void {
  const userDataPath = app.isPackaged ? app.getPath('userData') : '';
  const isWindows = process.platform === 'win32';
  const pathKey = isWindows
    ? Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH'
    : 'PATH';
  const { newEnvPath, nodeWrapperPath, binPath } = getNodeWrapperPaths(
    env[pathKey] || '',
    process.platform,
    app.isPackaged,
    userDataPath,
    __dirname
  );
  env[pathKey] = newEnvPath;
  if (!nodeWrapperPath || !binPath) {
    return;
  }
  if (!fs.existsSync(binPath)) {
    fs.mkdirSync(binPath, { recursive: true });
  }
  let nodeWrapperContent = '';
  switch (process.platform) {
    case 'win32':
      nodeWrapperContent = `@echo off\nset ELECTRON_RUN_AS_NODE=1\n"${process.execPath}" %*\n`;
      break;
    case 'darwin': {
      const appName = path.basename(process.execPath);
      let electronBinary = process.execPath;
      const helperPath = path.join(
        path.dirname(process.execPath),
        '..',
        'Frameworks',
        `${appName} Helper.app`,
        'Contents',
        'MacOS',
        `${appName} Helper`
      );
      if (fs.existsSync(helperPath)) {
        electronBinary = helperPath;
      }
      nodeWrapperContent = `#!/bin/sh\nELECTRON_RUN_AS_NODE=1 exec "${electronBinary}" "$@"\n`;
      break;
    }
    default:
      nodeWrapperContent = `#!/bin/sh\nELECTRON_RUN_AS_NODE=1 exec "${process.execPath}" "$@"\n`;
      break;
  }
  try {
    const existingContent = fs.existsSync(nodeWrapperPath)
      ? fs.readFileSync(nodeWrapperPath, 'utf-8')
      : '';
    if (existingContent !== nodeWrapperContent) {
      fs.writeFileSync(nodeWrapperPath, nodeWrapperContent);
      if (process.platform !== 'win32') {
        fs.chmodSync(nodeWrapperPath, 0o755);
      }
    }
  } catch (err) {
    console.error(`Failed to create node wrapper: ${err}`);
  }
}
