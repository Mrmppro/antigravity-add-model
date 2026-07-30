import { AutoSwitchPolicy } from './types';
export declare const AUTO_SWITCH_CONFIG_FILE = "gravity_auto_switch.json";
export declare function getAutoSwitchConfigPath(homeDir: string): string;
export declare function loadAutoSwitchPolicy(filePath: string): AutoSwitchPolicy;
export declare function saveAutoSwitchPolicy(filePath: string, policyInput: unknown): AutoSwitchPolicy;
//# sourceMappingURL=config.d.ts.map