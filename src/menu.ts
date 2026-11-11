import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, shell } from 'electron';
import * as path from 'path';
import { createWindow, isMacOS } from './utils';
import { MenuUpdateStep, updateActions } from './updater';
import { getActiveWslDistro, isWslAvailable, listWslDistros, persistWslDistro, WSL_STATE_FILE } from './wsl';

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
        createWindow(url);
      },
    }),
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
        const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
        win?.webContents.send('open-custom-models-modal');
      },
    }),
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
            const action = updateActions[menuItem.label];
            action?.();
          },
        }),
      );
    }
  }
  // Adds Docs and Toggle Developer Tools to the Help menu
  addItemToSubmenu(
    menu,
    'Help',
    0,
    new MenuItem({
      label: 'Docs',
      click: async () => {
        await shell.openExternal('https://antigravity.google/docs');
      },
    }),
  );

  const hideDevTools = (menuInstance: Menu): void => {
    menuInstance.items?.forEach((item) => {
      // Typing specifies this as 'toggleDevTools', but observing this
      // having the value 'toggledevtools'.
      if (item.role?.toLocaleLowerCase() === 'toggledevtools') {
        item.visible = false;
      }
      // Recursively search submenus (like 'View').
      if (item.submenu) {
        hideDevTools(item.submenu);
      }
    });
  };
  hideDevTools(menu);

  // Re-apply the menu so the change takes effect.
  Menu.setApplicationMenu(menu);

  // Asynchronously adds "Connect to WSL" (Windows only, when WSL is present).
  void addWslConnectMenu(menu);
}

/**
 * Builds a "Connect to WSL" submenu of installed distros (null when WSL
 * isn't applicable); selecting one relaunches the app connected to it.
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
  addItemToSubmenu(menu, 'File', 1, new MenuItem(template));
  // Local mode is not a WSL distro, so "Reopen Locally" is a sibling item
  // rather than an entry in the distro submenu.
  const reopen = wslReopenLocallyTemplate();
  if (reopen) {
    addItemToSubmenu(menu, 'File', 2, new MenuItem(reopen));
  }
  Menu.setApplicationMenu(menu);
}

/** Relaunches the app connected to `distro` ('' = local mode). */
export function relaunchWithWslDistro(distro: string): void {
  if (distro === getActiveWslDistro()) {
    return;
  }
  // Persist so the choice survives relaunches that drop command-line switches.
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
function addItemToSubmenu(appMenu: Menu, submenuLabel: string, position: number, item: MenuItem): void {
  const submenuItem = appMenu.items.find((i) => i.label === submenuLabel);
  if (!submenuItem?.submenu) {
    return;
  }
  submenuItem.submenu.insert(position, item);
}
