"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTO_SWITCH_CONFIG_FILE = void 0;
exports.getAutoSwitchConfigPath = getAutoSwitchConfigPath;
exports.loadAutoSwitchPolicy = loadAutoSwitchPolicy;
exports.saveAutoSwitchPolicy = saveAutoSwitchPolicy;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("./types");
const validator_1 = require("./validator");
exports.AUTO_SWITCH_CONFIG_FILE = 'gravity_auto_switch.json';
function getAutoSwitchConfigPath(homeDir) {
    return path.join(homeDir, '.gemini', 'antigravity', exports.AUTO_SWITCH_CONFIG_FILE);
}
function loadAutoSwitchPolicy(filePath) {
    if (!fs.existsSync(filePath))
        return (0, types_1.createDefaultAutoSwitchPolicy)();
    let parsed;
    try {
        parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    catch {
        // Only an unreadable file is treated as corrupt. Quarantining it keeps the
        // app usable instead of failing every request that reads the policy.
        try {
            fs.renameSync(filePath, `${filePath}.corrupt-${Date.now()}`);
        }
        catch {
            // Preserve the safe default even when a corrupt file cannot be renamed.
        }
        return (0, types_1.createDefaultAutoSwitchPolicy)();
    }
    const result = (0, validator_1.validateAutoSwitchPolicy)(parsed);
    if (result.valid)
        return result.policy;
    // The file is readable but no longer satisfies the rules — for example a model
    // that lost its verification. The user's route list is kept, and routing is
    // simply turned off so their manual model selection is used as-is.
    return { ...result.policy, enabled: false, chatMode: 'manual', mode: 'off' };
}
function saveAutoSwitchPolicy(filePath, policyInput) {
    const validation = (0, validator_1.validateAutoSwitchPolicy)(policyInput);
    if (!validation.valid)
        throw new Error(validation.errors.join(' '));
    const directory = path.dirname(filePath);
    fs.mkdirSync(directory, { recursive: true });
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(validation.policy, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
    return validation.policy;
}
//# sourceMappingURL=config.js.map