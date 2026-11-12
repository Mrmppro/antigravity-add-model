import { Menu } from 'electron';
/**
 * Returns whether Chromium DevTools should be enabled for BrowserWindows.
 * Defaults to unpackaged local development builds only.
 */
export declare function isDebugConsoleEnabled(): boolean;
/**
 * Hides the built-in Toggle Developer Tools menu item across all submenus
 * when the debug console is disabled.
 */
export declare function configureDebugConsoleMenu(menuInstance: Menu): void;
//# sourceMappingURL=debugConsole.d.ts.map