import { MenuItemConstructorOptions } from 'electron';
/**
 * Applies modifications to the default application menu.
 */
export declare function setupApplicationMenu(url: string): void;
/**
 * Builds a "Connect to WSL" submenu of installed distros.
 */
export declare function wslConnectMenuTemplate(): Promise<MenuItemConstructorOptions | null>;
/** "Reopen Locally" item leaving WSL mode, or null when already local. */
export declare function wslReopenLocallyTemplate(): MenuItemConstructorOptions | null;
/** Relaunches the app connected to `distro` ('' = local mode). */
export declare function relaunchWithWslDistro(distro: string): void;
//# sourceMappingURL=menu.d.ts.map