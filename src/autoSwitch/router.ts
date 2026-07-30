import {
  AutoSwitchMode,
  AutoSwitchPolicy,
  AutoSwitchRoute,
  ModelTier,
  RequestFeatures,
  RouteDecision,
  RouteHealthMap,
  TaskClass,
} from './types';
import { compareByPriority } from './tiering';
import { validateAutoSwitchPolicy } from './validator';

/**
 * Tier preference per mode and task class.
 *
 * Every mode — including `max-performance` — spends the cheapest tier on
 * trivial steps, because the whole point of Auto Switch is to lower API cost
 * without hurting the result the user asked for.
 */
const MODE_CHAINS: Record<Exclude<AutoSwitchMode, 'off'>, Record<TaskClass, ModelTier[]>> = {
  budget: {
    trivial: ['cheap'],
    simple: ['cheap', 'mid'],
    normal: ['cheap', 'mid', 'strong'],
    complex: ['mid', 'strong'],
    protected: ['strong', 'mid'],
  },
  balanced: {
    trivial: ['cheap'],
    simple: ['cheap', 'mid'],
    normal: ['mid', 'cheap', 'strong'],
    complex: ['strong', 'mid'],
    protected: ['strong', 'mid'],
  },
  'max-performance': {
    trivial: ['cheap', 'mid'],
    simple: ['mid', 'strong'],
    normal: ['strong', 'mid'],
    complex: ['strong', 'mid'],
    protected: ['strong', 'mid'],
  },
};

const PROTECTED_PATTERN = /\b(api[ _-]?key|password|secret|credential|authentication|authorization|oauth|deploy(?:ment)?|production|drop\s+(?:table|database)|truncate|delete\s+from|migration)\b/i;

const DAY_MS = 86_400_000;

export function classifyRequest(features: RequestFeatures): TaskClass {
  if (
    features.hasTools ||
    features.hasImagesOrAttachments ||
    features.hasFunctionResponses ||
    features.hasProtectedIndicators
  ) {
    return 'protected';
  }
  if (features.estimatedTokens > 8_000 || features.turns > 12) return 'complex';
  if (features.estimatedTokens > 1_500 || features.turns > 3) return 'normal';
  // A one-shot, very short prompt is not worth paying a premium model for.
  if (features.estimatedTokens <= 300 && features.turns <= 1 && !features.ambiguous) return 'trivial';
  return 'simple';
}

export function hasProtectedText(text: string): boolean {
  return PROTECTED_PATTERN.test(text);
}

/** True when the model's proof of capability is older than the policy allows. */
export function isVerificationStale(route: AutoSwitchRoute, reverifyDays: number, now: number): boolean {
  if (reverifyDays <= 0) return false;
  if (!route.verified.verifiedAt) return true;
  return now - route.verified.verifiedAt > reverifyDays * DAY_MS;
}

/**
 * Collects the routes that could serve this request, cheapest first within each
 * tier. Routes are rejected — never silently downgraded — when the request needs
 * a capability the probe did not prove.
 */
function eligibleRoutes(
  routes: readonly AutoSwitchRoute[],
  tier: ModelTier,
  features: RequestFeatures,
  taskClass: TaskClass,
  health: RouteHealthMap,
  reverifyDays: number,
  now: number,
  reasons: RouteDecision['reasonCodes'],
): AutoSwitchRoute[] {
  const matches: AutoSwitchRoute[] = [];

  for (const route of routes) {
    if (route.tier !== tier) continue;

    if (!route.enabled) {
      reasons.push('route-disabled');
      continue;
    }
    if (!route.verified.reachable) {
      reasons.push('route-unreachable');
      continue;
    }
    if (isVerificationStale(route, reverifyDays, now)) {
      reasons.push('verification-stale');
      continue;
    }
    if (health[route.id] && !health[route.id]!.healthy) {
      reasons.push('route-unhealthy');
      continue;
    }
    // Protected work carries credentials or destructive intent, so it never
    // goes to a local or budget model regardless of the selected mode.
    if (taskClass === 'protected' && (route.isLocal || route.tier === 'cheap')) continue;
    if (features.hasTools && !route.verified.tools) {
      reasons.push('tools-unverified');
      continue;
    }
    if (features.hasFunctionResponses && !route.verified.toolResults) {
      reasons.push('tools-unverified');
      continue;
    }
    if (features.hasImagesOrAttachments && !route.verified.images) {
      reasons.push('images-unverified');
      continue;
    }
    if (route.verified.contextLimit && features.estimatedTokens > route.verified.contextLimit) {
      reasons.push('context-limit');
      continue;
    }

    matches.push(route);
  }

  return matches.sort(compareByPriority);
}

export function resolveRoute(
  enabled: boolean,
  policyInput: unknown,
  features: RequestFeatures,
  health: RouteHealthMap = {},
  now: number = Date.now(),
): RouteDecision {
  const taskClass = classifyRequest(features);
  if (!enabled) return { action: 'bypass', taskClass, chain: [], reasonCodes: ['auto-disabled'] };

  const validation = validateAutoSwitchPolicy(policyInput);
  const policy: AutoSwitchPolicy = validation.policy;
  if (!validation.valid || policy.mode === 'off') {
    return { action: 'bypass', taskClass, chain: [], reasonCodes: ['invalid-policy'] };
  }

  const chain = MODE_CHAINS[policy.mode][taskClass];
  const reasons: RouteDecision['reasonCodes'] = [taskClass === 'protected' ? 'protected-request' : 'mode-chain'];

  // A healthy local model costs nothing, so it is tried ahead of the paid
  // chain whenever the user opted in and the work is not protected.
  if (policy.preferLocal && taskClass !== 'protected') {
    const localRoutes = eligibleRoutes(
      policy.routes.filter((route) => route.isLocal),
      'cheap',
      features,
      taskClass,
      health,
      policy.reverifyDays,
      now,
      reasons,
    );
    if (localRoutes.length > 0) {
      return {
        action: 'route',
        taskClass,
        target: localRoutes[0],
        tier: 'cheap',
        chain,
        reasonCodes: [...reasons, 'local-preferred'],
      };
    }
  }

  for (const tier of chain) {
    const matches = eligibleRoutes(policy.routes, tier, features, taskClass, health, policy.reverifyDays, now, reasons);
    if (matches.length === 0) continue;
    return {
      action: 'route',
      taskClass,
      target: matches[0],
      tier,
      chain,
      reasonCodes: tier === 'cheap' && taskClass !== 'protected' ? [...reasons, 'cost-optimized'] : reasons,
    };
  }

  // Nothing verified can serve this request, so the user's own model selection
  // is left completely untouched.
  return { action: 'bypass', taskClass, chain, reasonCodes: [...reasons, 'no-eligible-route'] };
}

/**
 * Ordered list of alternates for the runtime safety net, used when the chosen
 * model fails before producing its first token.
 */
export function resolveFallbackRoutes(
  policyInput: unknown,
  features: RequestFeatures,
  excludeIds: ReadonlySet<string>,
  health: RouteHealthMap = {},
  now: number = Date.now(),
): AutoSwitchRoute[] {
  const validation = validateAutoSwitchPolicy(policyInput);
  const policy = validation.policy;
  if (!validation.valid || policy.mode === 'off') return [];

  const taskClass = classifyRequest(features);
  const reasons: RouteDecision['reasonCodes'] = [];
  const ordered: AutoSwitchRoute[] = [];

  for (const tier of MODE_CHAINS[policy.mode][taskClass]) {
    for (const route of eligibleRoutes(
      policy.routes,
      tier,
      features,
      taskClass,
      health,
      policy.reverifyDays,
      now,
      reasons,
    )) {
      if (!excludeIds.has(route.id)) ordered.push(route);
    }
  }

  return ordered.slice(0, Math.max(policy.maxFallbacks, 0));
}
