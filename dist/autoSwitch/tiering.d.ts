import { AutoSwitchRoute, ModelTier } from './types';
/**
 * Automatic cost/strength tiering.
 *
 * Users should never have to assign roles by hand, so a tier is inferred from
 * three signals that already exist in the app: the provider, the model family,
 * and an optional price hint the user typed into the display name (for example
 * "DEEPSEEK V4 Flash 0.09-0.17"). The price hint is only ever a hint; a missing
 * hint never blocks routing.
 */
export interface TieringInput {
    name?: string;
    displayName?: string;
    externalModelName?: string;
    provider?: string;
}
/** Detects an on-device provider, which is always the cheapest option. */
export declare function isLocalProvider(provider?: string): boolean;
/**
 * Extracts a USD-per-million-token hint from free text. Accepts a single number
 * or a range, and returns the lower bound so cheaper models sort first.
 */
export declare function parseCostHint(text?: string): number | undefined;
/**
 * Infers a tier for a user-added model. Local models are always `cheap`
 * because they carry no API cost.
 */
export declare function inferModelTier(input: TieringInput): ModelTier;
/**
 * Orders a tier by the user's explicit primary/fallback preference. Cost and
 * name are deterministic tie-breakers only; they never override a preference.
 */
export declare function compareByPriority(a: Pick<AutoSwitchRoute, 'priority' | 'costHint' | 'displayName'>, b: Pick<AutoSwitchRoute, 'priority' | 'costHint' | 'displayName'>): number;
//# sourceMappingURL=tiering.d.ts.map