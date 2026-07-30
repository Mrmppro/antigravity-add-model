export const AUTO_SWITCH_CONFIG_VERSION = 3 as const;

/**
 * Plain-language routing modes. Every mode exists to reduce API cost while
 * still finishing the work the user asked for, so even `max-performance`
 * downgrades trivial steps to the cheapest verified model.
 */
export type AutoSwitchMode = 'off' | 'budget' | 'balanced' | 'max-performance';

/** Automatically inferred cost/strength band. Never a Google model. */
export type ModelTier = 'cheap' | 'mid' | 'strong';

export type TaskClass = 'trivial' | 'simple' | 'normal' | 'complex' | 'protected';
export type AutoSwitchChatMode = 'manual' | 'auto';

/**
 * Capabilities proven by a real probe against the model's own endpoint.
 * Nothing here is ever guessed from a model name or provider.
 */
export interface VerifiedCapabilities {
  reachable: boolean;
  tools: boolean;
  toolResults: boolean;
  images: boolean;
  contextLimit?: number;
  /** Epoch milliseconds of the last successful verification attempt. */
  verifiedAt: number;
  /** Redacted, user-readable reason for the most recent failure. */
  lastError?: string;
}

export function createUnverifiedCapabilities(): VerifiedCapabilities {
  return { reachable: false, tools: false, toolResults: false, images: false, verifiedAt: 0 };
}

/**
 * A model the user has explicitly allowed Auto Switch to use. Only custom
 * models the user added themselves are eligible; Google models are always
 * left untouched so their native request is never rewritten.
 */
export interface AutoSwitchRoute {
  /** Matches the `name` of the user's custom model entry. */
  id: string;
  displayName: string;
  /** User-selected work band. Inference supplies only the initial suggestion. */
  tier: ModelTier;
  /** User-selected order inside the tier; 1 is the primary, later values are fallbacks. */
  priority: number;
  /** True for on-device providers such as Ollama or LM Studio. */
  isLocal: boolean;
  /** Optional cost hint in USD per million tokens, parsed from the model name. */
  costHint?: number;
  /** Set to true only after a successful verification run. */
  enabled: boolean;
  verified: VerifiedCapabilities;
}

export interface ClassifierSettings {
  enabled: boolean;
  consented: boolean;
  modelId?: string;
  maxCharacters: number;
  timeoutMs: number;
}

export interface AutoSwitchPolicy {
  version: typeof AUTO_SWITCH_CONFIG_VERSION;
  enabled: boolean;
  /** Set only by the chat control. Manual is always a transparent pass-through. */
  chatMode: AutoSwitchChatMode;
  mode: AutoSwitchMode;
  /** Try a healthy local model first, because it costs nothing. */
  preferLocal: boolean;
  /** Re-check verified capabilities after this many days. 0 disables re-checking. */
  reverifyDays: number;
  routes: AutoSwitchRoute[];
  maxFallbacks: number;
  classifier: ClassifierSettings;
}

export interface RequestFeatures {
  estimatedTokens: number;
  hasTools: boolean;
  hasImagesOrAttachments: boolean;
  hasFunctionResponses: boolean;
  hasProtectedIndicators: boolean;
  turns: number;
  ambiguous?: boolean;
}

export type DecisionReason =
  | 'auto-disabled'
  | 'invalid-policy'
  | 'no-eligible-route'
  | 'protected-request'
  | 'mode-chain'
  | 'cost-optimized'
  | 'local-preferred'
  | 'route-disabled'
  | 'route-unhealthy'
  | 'route-unreachable'
  | 'tools-unverified'
  | 'images-unverified'
  | 'verification-stale'
  | 'context-limit'
  | 'classifier-result';

export interface RouteDecision {
  action: 'bypass' | 'route';
  taskClass: TaskClass;
  target?: AutoSwitchRoute;
  tier?: ModelTier;
  chain: ModelTier[];
  reasonCodes: DecisionReason[];
}

export interface RouteHealth {
  healthy: boolean;
  checkedAt: number;
}

export type RouteHealthMap = Partial<Record<string, RouteHealth>>;

export const DEFAULT_CLASSIFIER_SETTINGS: ClassifierSettings = {
  enabled: false,
  consented: false,
  maxCharacters: 4_000,
  timeoutMs: 3_000,
};

export const DEFAULT_REVERIFY_DAYS = 30;

export function createDefaultAutoSwitchPolicy(): AutoSwitchPolicy {
  return {
    version: AUTO_SWITCH_CONFIG_VERSION,
    enabled: false,
    chatMode: 'manual',
    mode: 'off',
    preferLocal: false,
    reverifyDays: DEFAULT_REVERIFY_DAYS,
    routes: [],
    maxFallbacks: 2,
    classifier: { ...DEFAULT_CLASSIFIER_SETTINGS },
  };
}
