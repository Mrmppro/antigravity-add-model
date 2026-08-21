import { BrowserWindow } from 'electron';
interface KeybindingActions {
    createNewWindow(): void;
    onQuitRequested(): void;
}
export declare function registerKeybindings(win: BrowserWindow, actions: KeybindingActions): void;
export {};
//# sourceMappingURL=keybindings.d.ts.map