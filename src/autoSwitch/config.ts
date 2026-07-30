import * as fs from 'fs';
import * as path from 'path';
import { AutoSwitchPolicy, createDefaultAutoSwitchPolicy } from './types';
import { validateAutoSwitchPolicy } from './validator';

export const AUTO_SWITCH_CONFIG_FILE = 'gravity_auto_switch.json';

export function getAutoSwitchConfigPath(homeDir: string): string {
  return path.join(homeDir, '.gemini', 'antigravity', AUTO_SWITCH_CONFIG_FILE);
}

export function loadAutoSwitchPolicy(filePath: string): AutoSwitchPolicy {
  if (!fs.existsSync(filePath)) return createDefaultAutoSwitchPolicy();

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    // Only an unreadable file is treated as corrupt. Quarantining it keeps the
    // app usable instead of failing every request that reads the policy.
    try {
      fs.renameSync(filePath, `${filePath}.corrupt-${Date.now()}`);
    } catch {
      // Preserve the safe default even when a corrupt file cannot be renamed.
    }
    return createDefaultAutoSwitchPolicy();
  }

  const result = validateAutoSwitchPolicy(parsed);
  if (result.valid) return result.policy;

  // The file is readable but no longer satisfies the rules — for example a model
  // that lost its verification. The user's route list is kept, and routing is
  // simply turned off so their manual model selection is used as-is.
  return { ...result.policy, enabled: false, chatMode: 'manual', mode: 'off' };
}

export function saveAutoSwitchPolicy(filePath: string, policyInput: unknown): AutoSwitchPolicy {
  const validation = validateAutoSwitchPolicy(policyInput);
  if (!validation.valid) throw new Error(validation.errors.join(' '));
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(validation.policy, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
  return validation.policy;
}
