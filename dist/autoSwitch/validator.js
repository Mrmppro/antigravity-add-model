"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAutoSwitchPolicy = validateAutoSwitchPolicy;
const types_1 = require("./types");
const MODES = ['off', 'budget', 'balanced', 'max-performance'];
const TIERS = ['cheap', 'mid', 'strong'];
function isLegacyPolicy(value) {
    return value.version === 1 || value.preset !== undefined || value.bindings !== undefined;
}
/**
 * Converts a v1 policy into the v2 shape.
 *
 * Google bindings are dropped because Auto Switch no longer rewrites Google
 * requests, and every surviving custom model starts unverified with the mode
 * turned off. That guarantees an upgraded install never routes to something we
 * have not probed, and the migrated file still passes validation so it remains
 * savable.
 */
function migrateLegacyPolicy(input) {
    const policy = (0, types_1.createDefaultAutoSwitchPolicy)();
    const seen = new Set();
    for (const [role, target] of Object.entries(input.bindings || {})) {
        if (!target || target.kind !== 'custom' || !target.id || !target.displayName)
            continue;
        if (seen.has(target.id))
            continue;
        seen.add(target.id);
        policy.routes.push({
            id: target.id,
            displayName: target.displayName,
            tier: role === 'advanced' ? 'strong' : role === 'economy' || role === 'local' ? 'cheap' : 'mid',
            priority: policy.routes.filter((route) => route.tier === (role === 'advanced' ? 'strong' : role === 'economy' || role === 'local' ? 'cheap' : 'mid')).length + 1,
            isLocal: role === 'local',
            enabled: false,
            verified: (0, types_1.createUnverifiedCapabilities)(),
        });
    }
    return policy;
}
function sanitizeVerified(value) {
    const fallback = (0, types_1.createUnverifiedCapabilities)();
    if (!value || typeof value !== 'object')
        return fallback;
    const input = value;
    const contextLimit = Number.isFinite(input.contextLimit) && input.contextLimit > 0 ? Math.floor(input.contextLimit) : undefined;
    return {
        reachable: input.reachable === true,
        tools: input.tools === true,
        toolResults: input.toolResults === true,
        images: input.images === true,
        contextLimit,
        verifiedAt: Number.isFinite(input.verifiedAt) && input.verifiedAt > 0 ? Math.floor(input.verifiedAt) : 0,
        lastError: typeof input.lastError === 'string' && input.lastError ? input.lastError.slice(0, 300) : undefined,
    };
}
function validateAutoSwitchPolicy(value) {
    const fallback = (0, types_1.createDefaultAutoSwitchPolicy)();
    if (!value || typeof value !== 'object') {
        return { valid: false, errors: ['Policy must be an object.'], policy: fallback };
    }
    const raw = value;
    if (isLegacyPolicy(raw)) {
        // A migrated policy is valid by construction: routing stays off until the
        // user verifies at least one model.
        return { valid: true, errors: [], policy: migrateLegacyPolicy(raw) };
    }
    const input = raw;
    const errors = [];
    const mode = MODES.includes(input.mode) ? input.mode : 'off';
    if (input.mode !== undefined && mode !== input.mode)
        errors.push('Unknown routing mode.');
    const requestedChatMode = input.chatMode;
    const chatMode = requestedChatMode === 'auto' ? 'auto' : 'manual';
    if (requestedChatMode !== undefined && requestedChatMode !== 'manual' && requestedChatMode !== 'auto') {
        errors.push('Unknown chat mode.');
    }
    const routes = [];
    const seen = new Set();
    const usedPriorities = {
        cheap: new Set(),
        mid: new Set(),
        strong: new Set(),
    };
    if (Array.isArray(input.routes)) {
        for (const candidate of input.routes) {
            if (!candidate || typeof candidate !== 'object') {
                errors.push('Each Auto Switch model must be an object.');
                continue;
            }
            const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
            const displayName = typeof candidate.displayName === 'string' ? candidate.displayName.trim() : '';
            if (!id || !displayName) {
                errors.push('Each Auto Switch model needs an id and a display name.');
                continue;
            }
            // Google models are never Auto Switch targets, so their native request is
            // always forwarded untouched.
            if (id.startsWith('MODEL_GOOGLE_') || /^models\/gemini/i.test(id)) {
                errors.push(`Google models cannot be Auto Switch targets (${displayName}).`);
                continue;
            }
            if (seen.has(id))
                continue;
            seen.add(id);
            const verified = sanitizeVerified(candidate.verified);
            const enabled = candidate.enabled === true;
            if (enabled && !verified.reachable) {
                errors.push(`${displayName} must be verified before Auto Switch can use it.`);
                continue;
            }
            const tier = TIERS.includes(candidate.tier) ? candidate.tier : 'mid';
            const requestedPriority = candidate.priority;
            const priorityIsValid = Number.isInteger(requestedPriority) && requestedPriority >= 1 && requestedPriority <= 999;
            let priority = priorityIsValid ? requestedPriority : 1;
            // v2 policies have no priority. Duplicate/missing priorities are normalized
            // rather than rejected, so upgrading never disables an otherwise healthy route.
            while (usedPriorities[tier].has(priority))
                priority += 1;
            usedPriorities[tier].add(priority);
            routes.push({
                id,
                displayName,
                tier,
                priority,
                isLocal: candidate.isLocal === true,
                costHint: Number.isFinite(candidate.costHint) && candidate.costHint >= 0 ? candidate.costHint : undefined,
                enabled,
                verified,
            });
        }
    }
    const maxFallbacks = Number.isInteger(input.maxFallbacks) && input.maxFallbacks >= 0 && input.maxFallbacks <= 2
        ? input.maxFallbacks
        : fallback.maxFallbacks;
    if (input.maxFallbacks !== undefined && maxFallbacks !== input.maxFallbacks) {
        errors.push('Fallback limit must be between 0 and 2.');
    }
    const reverifyDays = Number.isInteger(input.reverifyDays) && input.reverifyDays >= 0 && input.reverifyDays <= 365
        ? input.reverifyDays
        : fallback.reverifyDays;
    if (input.reverifyDays !== undefined && reverifyDays !== input.reverifyDays) {
        errors.push('Re-verification interval must be between 0 and 365 days.');
    }
    const classifierInput = input.classifier || fallback.classifier;
    const classifier = {
        enabled: classifierInput.enabled === true,
        consented: classifierInput.consented === true,
        modelId: typeof classifierInput.modelId === 'string' ? classifierInput.modelId : undefined,
        maxCharacters: Number.isInteger(classifierInput.maxCharacters) &&
            classifierInput.maxCharacters >= 256 &&
            classifierInput.maxCharacters <= 16000
            ? classifierInput.maxCharacters
            : fallback.classifier.maxCharacters,
        timeoutMs: Number.isInteger(classifierInput.timeoutMs) && classifierInput.timeoutMs >= 500 && classifierInput.timeoutMs <= 10000
            ? classifierInput.timeoutMs
            : fallback.classifier.timeoutMs,
    };
    if (classifier.enabled && (!classifier.consented || !classifier.modelId)) {
        errors.push('The optional classifier requires consent and a selected model.');
        classifier.enabled = false;
    }
    const usableRoutes = routes.filter((route) => route.enabled && route.verified.reachable);
    if (mode !== 'off' && usableRoutes.length === 0) {
        errors.push('Verify at least one model before turning Auto Switch on.');
    }
    const policy = {
        version: types_1.AUTO_SWITCH_CONFIG_VERSION,
        enabled: input.enabled === true,
        chatMode,
        mode,
        preferLocal: input.preferLocal === true,
        reverifyDays,
        routes,
        maxFallbacks,
        classifier,
    };
    return { valid: errors.length === 0, errors, policy };
}
//# sourceMappingURL=validator.js.map