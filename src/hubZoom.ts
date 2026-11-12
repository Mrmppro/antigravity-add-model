import { getFocusedHubWindow, getHubWindows, getHubWebContents } from './utils';

export const ZOOM_LEVEL_KEY = 'zoomLevel';
export const ZOOM_STEP = 0.5;

let registeredStorageManager: any;

/**
 * Registers the main-process storage updater used to persist Hub window zoom
 * changes initiated from IPC, application menu items, or keyboard shortcuts.
 */
export function setHubZoomStorageManager(storageManager: any): void {
  registeredStorageManager = storageManager;
}

function isWebviewPopupWindow(win: any): boolean {
  return Boolean(win && typeof win === 'object' && win.__isWebviewPopupWindow);
}

/**
 * Resolves the target top-level Hub window for a menu or IPC zoom action.
 */
export function resolveTargetHubWindow(win?: any): any {
  if (win && !win.isDestroyed?.() && !isWebviewPopupWindow(win)) {
    return win;
  }
  return getFocusedHubWindow() ?? getHubWindows()[0];
}

/**
 * Maps a `Cmd`/`Ctrl`-modified keyboard input payload to its corresponding Hub zoom action.
 */
export function resolveHubZoomShortcutAction(
  input: { key?: string; code?: string; shift?: boolean },
  keyLower = (input.key || '').toLowerCase()
): 'in' | 'out' | 'reset' | null {
  const code = input.code || '';
  if (keyLower === '+' || keyLower === '=' || code === 'NumpadAdd') {
    return 'in';
  }
  if (keyLower === '-' || keyLower === '_' || code === 'NumpadSubtract') {
    return 'out';
  }
  if (!input.shift && (keyLower === '0' || code === 'Digit0' || code === 'Numpad0')) {
    return 'reset';
  }
  return null;
}

/**
 * Adjusts or resets the zoom level strictly on `win`'s Hub UI `WebContents`.
 */
export async function applyHubWindowZoom(win: any, action: 'in' | 'out' | 'reset'): Promise<void> {
  if (!win || win.isDestroyed?.()) {
    return;
  }
  const hubContents = getHubWebContents(win);
  if (!hubContents || hubContents.isDestroyed?.()) {
    return;
  }
  let newLevel = 0;
  if (action !== 'reset') {
    const current = typeof hubContents.getZoomLevel === 'function' ? hubContents.getZoomLevel() : 0;
    const baseLevel = typeof current === 'number' && Number.isFinite(current) ? current : 0;
    newLevel = action === 'in' ? baseLevel + ZOOM_STEP : baseLevel - ZOOM_STEP;
  }
  hubContents.setZoomLevel?.(newLevel);
  if (typeof registeredStorageManager?.updateItems === 'function') {
    await registeredStorageManager.updateItems({
      [ZOOM_LEVEL_KEY]: String(newLevel),
    });
  }
}
