"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_REVERIFY_DAYS = exports.DEFAULT_CLASSIFIER_SETTINGS = exports.AUTO_SWITCH_CONFIG_VERSION = void 0;
exports.createUnverifiedCapabilities = createUnverifiedCapabilities;
exports.createDefaultAutoSwitchPolicy = createDefaultAutoSwitchPolicy;
exports.AUTO_SWITCH_CONFIG_VERSION = 3;
function createUnverifiedCapabilities() {
    return { reachable: false, tools: false, toolResults: false, images: false, verifiedAt: 0 };
}
exports.DEFAULT_CLASSIFIER_SETTINGS = {
    enabled: false,
    consented: false,
    maxCharacters: 4000,
    timeoutMs: 3000,
};
exports.DEFAULT_REVERIFY_DAYS = 30;
function createDefaultAutoSwitchPolicy() {
    return {
        version: exports.AUTO_SWITCH_CONFIG_VERSION,
        enabled: false,
        chatMode: 'manual',
        mode: 'off',
        preferLocal: false,
        reverifyDays: exports.DEFAULT_REVERIFY_DAYS,
        routes: [],
        maxFallbacks: 2,
        classifier: { ...exports.DEFAULT_CLASSIFIER_SETTINGS },
    };
}
//# sourceMappingURL=types.js.map