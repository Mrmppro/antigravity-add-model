import { AutoSwitchPolicy } from './types';
export interface AutoSwitchValidationResult {
    valid: boolean;
    errors: string[];
    policy: AutoSwitchPolicy;
}
export declare function validateAutoSwitchPolicy(value: unknown): AutoSwitchValidationResult;
//# sourceMappingURL=validator.d.ts.map