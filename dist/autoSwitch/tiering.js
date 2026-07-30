"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLocalProvider = isLocalProvider;
exports.parseCostHint = parseCostHint;
exports.inferModelTier = inferModelTier;
exports.compareByPriority = compareByPriority;
const LOCAL_PROVIDERS = new Set(['ollama', 'lmstudio', 'llamacpp', 'localai']);
/** Families that consistently sit at the top of their vendor's line-up. */
const STRONG_PATTERN = /\b(opus|gpt-?5(?:\.\d+)?|o[13](?:-pro)?|ultra|max|405b|deepseek-r|grok-\d+(?!.*mini))\b/i;
/** Families explicitly marketed as small, fast, or cheap. */
const CHEAP_PATTERN = /\b(mini|nano|lite|flash(?:-lite)?|haiku|small|tiny|8b|7b|3b|1b|turbo-instruct|embed)\b/i;
/** Detects an on-device provider, which is always the cheapest option. */
function isLocalProvider(provider) {
    return LOCAL_PROVIDERS.has((provider || '').toLowerCase());
}
/**
 * Extracts a USD-per-million-token hint from free text. Accepts a single number
 * or a range, and returns the lower bound so cheaper models sort first.
 */
function parseCostHint(text) {
    if (!text)
        return undefined;
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)|(?:\$|\b)(\d+\.\d+)\b/i);
    if (!match)
        return undefined;
    const value = match[1] !== undefined ? Number(match[1]) : Number(match[3]);
    if (!Number.isFinite(value) || value < 0 || value > 10000)
        return undefined;
    return value;
}
/**
 * Infers a tier for a user-added model. Local models are always `cheap`
 * because they carry no API cost.
 */
function inferModelTier(input) {
    if (isLocalProvider(input.provider))
        return 'cheap';
    const haystack = [input.externalModelName, input.name, input.displayName].filter(Boolean).join(' ');
    const costHint = parseCostHint(input.displayName) ?? parseCostHint(input.name);
    // An explicit price hint is the most reliable signal the user can give us.
    if (costHint !== undefined) {
        if (costHint < 1)
            return 'cheap';
        if (costHint < 5)
            return 'mid';
        return 'strong';
    }
    if (CHEAP_PATTERN.test(haystack))
        return 'cheap';
    if (STRONG_PATTERN.test(haystack))
        return 'strong';
    return 'mid';
}
/**
 * Orders a tier by the user's explicit primary/fallback preference. Cost and
 * name are deterministic tie-breakers only; they never override a preference.
 */
function compareByPriority(a, b) {
    if (a.priority !== b.priority)
        return a.priority - b.priority;
    const costOrder = (a.costHint ?? Number.MAX_SAFE_INTEGER) - (b.costHint ?? Number.MAX_SAFE_INTEGER);
    if (costOrder !== 0)
        return costOrder;
    return a.displayName.localeCompare(b.displayName);
}
//# sourceMappingURL=tiering.js.map