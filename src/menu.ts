import { app, Menu, MenuItem, MenuItemConstructorOptions, shell } from 'electron';
import * as path from 'path';
import { createWindow, isMacOS, getHubWindows, getHubWebContents } from './utils';
import { MenuUpdateStep, updateActions } from './updater';
import {
  getActiveWslDistro,
  isWslAvailable,
  listWslDistros,
  persistWslDistro,
  WSL_STATE_FILE,
} from './wsl';
import { configureDebugConsoleMenu } from './debugConsole';
import { applyHubWindowZoom, resolveTargetHubWindow } from './hubZoom';

function createHubZoomMenuItem(options: {
  id: string;
  label: string;
  accelerator: string;
  action: 'in' | 'out' | 'reset';
  enabled?: boolean;
  visible?: boolean;
  acceleratorWorksWhenHidden?: boolean;
}): MenuItem {
  return new MenuItem({
    id: options.id,
    label: options.label,
    accelerator: options.accelerator,
    enabled: options.enabled ?? true,
    visible: options.visible ?? true,
    ...(options.acceleratorWorksWhenHidden !== undefined
      ? { acceleratorWorksWhenHidden: options.acceleratorWorksWhenHidden }
      : {}),
    click: (_menuItem, focusedWindow) => {
      void applyHubWindowZoom(resolveTargetHubWindow(focusedWindow), options.action).catch(() => undefined);
    },
  });
}

function configureViewZoomMenu(appMenu: Menu): void {
  const viewMenuItem = appMenu.items?.find((item) => item.label === 'View');
  const viewSubmenu = viewMenuItem?.submenu;
  if (!viewSubmenu || !Array.isArray(viewSubmenu.items)) {
    return;
  }
  const hasBuiltInZoomRole = viewSubmenu.items.some((item) => {
    const role = item.role?.toLowerCase();
    return role === 'resetzoom' || role === 'zoomin' || role === 'zoomout';
  });
  if (!hasBuiltInZoomRole) {
    return;
  }
  const nextItems: MenuItem[] = [];
  for (const item of viewSubmenu.items) {
    const role = item.role?.toLowerCase();
    if (role === 'resetzoom') {
      nextItems.push(
        createHubZoomMenuItem({
          id: 'hub-reset-zoom',
          label: item.label || 'Actual Size',
          accelerator: item.accelerator || 'CmdOrCtrl+0',
          action: 'reset',
          enabled: item.enabled,
          visible: item.visible,
        })
      );
    } else if (role === 'zoomin') {
      nextItems.push(
        createHubZoomMenuItem({
          id: 'hub-zoom-in',
          label: item.label || 'Zoom In',
          accelerator: item.accelerator || 'CmdOrCtrl+Plus',
          action: 'in',
          enabled: item.enabled,
          visible: item.visible,
        }),
        createHubZoomMenuItem({
          id: 'hub-zoom-in-equal',
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          action: 'in',
          enabled: item.enabled,
          visible: false,
          acceleratorWorksWhenHidden: true,
        })
      );
    } else if (role === 'zoomout') {
      nextItems.push(
        createHubZoomMenuItem({
          id: 'hub-zoom-out',
          label: item.label || 'Zoom Out',
          accelerator: item.accelerator || 'CmdOrCtrl+-',
          action: 'out',
          enabled: item.enabled,
          visible: item.visible,
        })
      );
    } else {
      nextItems.push(item);
    }
  }
  const submenuWithInternals = viewSubmenu as any;
  if (
    typeof submenuWithInternals.clear === 'function' &&
    typeof viewSubmenu.insert === 'function'
  ) {
    submenuWithInternals.clear();
    viewSubmenu.items.length = 0;
    if (submenuWithInternals.commandsMap) {
      submenuWithInternals.commandsMap = {};
    }
    nextItems.forEach((nextItem, index) => {
      viewSubmenu.insert(index, nextItem);
    });
  } else {
    viewSubmenu.items.splice(0, viewSubmenu.items.length, ...nextItems);
  }
}

/**
 * Applies modifications to the default application menu.
 */
export function setupApplicationMenu(url: string): void {
  const menu = Menu.getApplicationMenu();
  if (!menu) {
    return;
  }

  // Adds a "New Window" item to the top of the existing File menu.
  addItemToSubmenu(
    menu,
    'File',
    0,
    new MenuItem({
      label: 'New Window',
      accelerator: 'CmdOrCtrl+Shift+N',
      click: () => {
        createWindow(url, undefined, { cascade: true });
      },
    })
  );

  // Adds "Manage Custom Models" to File menu.
  addItemToSubmenu(
    menu,
    'File',
    1,
    new MenuItem({
      label: 'Manage Custom Models...',
      accelerator: 'CmdOrCtrl+Alt+M',
      click: () => {
        const wins = getHubWindows();
        if (wins.length > 0) {
          const contents = getHubWebContents(wins[0]);
          contents?.send('open-custom-models-modal');
        }
      },
    })
  );

  // Add "Check for Updates" to the application menu on macOS.
  if (isMacOS()) {
    const appSubmenu = menu.items[0]?.submenu;
    if (appSubmenu) {
      appSubmenu.insert(
        1,
        new MenuItem({
          id: 'check-for-updates',
          label: MenuUpdateStep.CheckForUpdates,
          click: (menuItem) => {
            const action = updateActions[menuItem.label as MenuUpdateStep];
            action?.();
          },
        })
      );
    }
  }

  // Adds Docs to the Help menu.
  addItemToSubmenu(
    menu,
    'Help',
    0,
    new MenuItem({
      label: 'Docs',
      click: async () => {
        await shell.openExternal('https://antigravity.google/docs');
      },
    })
  );

  configureViewZoomMenu(menu);
  configureDebugConsoleMenu(menu);

  // Re-apply the menu so the change takes effect.
  Menu.setApplicationMenu(menu);

  // Asynchronously adds "Connect to WSL" (Windows only, when WSL is present).
  void addWslConnectMenu(menu);
}

/**
 * Builds a "Connect to WSL" submenu of installed distros.
 */
export async function wslConnectMenuTemplate(): Promise<MenuItemConstructorOptions | null> {
  if (!isWslAvailable()) {
    return null;
  }
  let distros;
  try {
    distros = await listWslDistros();
  } catch (err) {
    console.error('Failed to list WSL distros:', err);
    return null;
  }
  if (distros.length === 0) {
    return null;
  }
  const active = getActiveWslDistro();
  const submenu: MenuItemConstructorOptions[] = distros.map((d) => ({
    label: d.name,
    type: 'checkbox',
    checked: d.name === active,
    click: () => relaunchWithWslDistro(d.name),
  }));
  return { label: 'Connect to WSL', submenu };
}

/** "Reopen Locally" item leaving WSL mode, or null when already local. */
export function wslReopenLocallyTemplate(): MenuItemConstructorOptions | null {
  if (!getActiveWslDistro()) {
    return null;
  }
  return { label: 'Reopen Locally', click: () => relaunchWithWslDistro('') };
}

/** Adds the WSL items to the File menu. */
async function addWslConnectMenu(menu: Menu): Promise<void> {
  const template = await wslConnectMenuTemplate();
  if (!template) {
    return;
  }
  addItemToSubmenu(menu, 'File', 2, new MenuItem(template));
  const reopen = wslReopenLocallyTemplate();
  if (reopen) {
    addItemToSubmenu(menu, 'File', 3, new MenuItem(reopen));
  }
  Menu.setApplicationMenu(menu);
}

/** Relaunches the app connected to `distro` ('' = local mode). */
export function relaunchWithWslDistro(distro: string): void {
  if (distro === getActiveWslDistro()) {
    return;
  }
  persistWslDistro(path.join(app.getPath('userData'), WSL_STATE_FILE), distro);
  const args = process.argv.slice(1).filter((a) => !a.startsWith('--wsl-distro'));
  if (distro) {
    args.push(`--wsl-distro=${distro}`);
  }
  app.relaunch({ args });
  app.quit();
}

/**
 * Adds a menu item to a submenu of the main application menu.
 */
function addItemToSubmenu(
  appMenu: Menu,
  submenuLabel: string,
  position: number,
  item: MenuItem
): void {
  const submenuItem = appMenu.items.find((item) => item.label === submenuLabel);
  if (!submenuItem?.submenu) {
    return;
  }
  submenuItem.submenu.insert(position, item);
}
