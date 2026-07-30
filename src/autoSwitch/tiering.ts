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

const LOCAL_PROVIDERS = new Set(['ollama', 'lmstudio', 'llamacpp', 'localai']);

/** Families that consistently sit at the top of their vendor's line-up. */
const STRONG_PATTERN = /\b(opus|gpt-?5(?:\.\d+)?|o[13](?:-pro)?|ultra|max|405b|deepseek-r|grok-\d+(?!.*mini))\b/i;
/** Families explicitly marketed as small, fast, or cheap. */
const CHEAP_PATTERN = /\b(mini|nano|lite|flash(?:-lite)?|haiku|small|tiny|8b|7b|3b|1b|turbo-instruct|embed)\b/i;

/** Detects an on-device provider, which is always the cheapest option. */
export function isLocalProvider(provider?: string): boolean {
  return LOCAL_PROVIDERS.has((provider || '').toLowerCase());
}

/**
 * Extracts a USD-per-million-token hint from free text. Accepts a single number
 * or a range, and returns the lower bound so cheaper models sort first.
 */
export function parseCostHint(text?: string): number | undefined {
  if (!text) return undefined;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)|(?:\$|\b)(\d+\.\d+)\b/i);
  if (!match) return undefined;
  const value = match[1] !== undefined ? Number(match[1]) : Number(match[3]);
  if (!Number.isFinite(value) || value < 0 || value > 10_000) return undefined;
  return value;
}

/**
 * Infers a tier for a user-added model. Local models are always `cheap`
 * because they carry no API cost.
 */
export function inferModelTier(input: TieringInput): ModelTier {
  if (isLocalProvider(input.provider)) return 'cheap';

  const haystack = [input.externalModelName, input.name, input.displayName].filter(Boolean).join(' ');
  const costHint = parseCostHint(input.displayName) ?? parseCostHint(input.name);

  // An explicit price hint is the most reliable signal the user can give us.
  if (costHint !== undefined) {
    if (costHint < 1) return 'cheap';
    if (costHint < 5) return 'mid';
    return 'strong';
  }

  if (CHEAP_PATTERN.test(haystack)) return 'cheap';
  if (STRONG_PATTERN.test(haystack)) return 'strong';
  return 'mid';
}

/**
 * Orders a tier by the user's explicit primary/fallback preference. Cost and
 * name are deterministic tie-breakers only; they never override a preference.
 */
export function compareByPriority(a: Pick<AutoSwitchRoute, 'priority' | 'costHint' | 'displayName'>, b: Pick<AutoSwitchRoute, 'priority' | 'costHint' | 'displayName'>): number {
  if (a.priority !== b.priority) return a.priority - b.priority;
  const costOrder = (a.costHint ?? Number.MAX_SAFE_INTEGER) - (b.costHint ?? Number.MAX_SAFE_INTEGER);
  if (costOrder !== 0) return costOrder;
  return a.displayName.localeCompare(b.displayName);
}
