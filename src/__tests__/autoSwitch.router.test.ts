import { describe, expect, it } from 'vitest';
import {
  AutoSwitchRoute,
  RequestFeatures,
  createDefaultAutoSwitchPolicy,
  createUnverifiedCapabilities,
} from '../autoSwitch/types';
import { classifyRequest, isVerificationStale, resolveFallbackRoutes, resolveRoute } from '../autoSwitch/router';
import { inferModelTier, parseCostHint } from '../autoSwitch/tiering';

/** Builds a route that has already passed verification, so tests focus on routing. */
function verifiedRoute(overrides: Partial<AutoSwitchRoute> & Pick<AutoSwitchRoute, 'id' | 'tier'>): AutoSwitchRoute {
  return {
    displayName: overrides.id,
    isLocal: false,
    enabled: true,
    priority: 1,
    ...overrides,
    verified: {
      ...createUnverifiedCapabilities(),
      reachable: true,
      tools: true,
      toolResults: true,
      verifiedAt: Date.now(),
      ...overrides.verified,
    },
  };
}

const base: RequestFeatures = {
  estimatedTokens: 2_000,
  hasTools: false,
  hasImagesOrAttachments: false,
  hasFunctionResponses: false,
  hasProtectedIndicators: false,
  turns: 2,
};

function policyWith(routes: AutoSwitchRoute[], overrides: Partial<ReturnType<typeof createDefaultAutoSwitchPolicy>> = {}) {
  return { ...createDefaultAutoSwitchPolicy(), enabled: true, mode: 'balanced' as const, routes, ...overrides };
}

describe('Gravity Auto Switch routing (v2)', () => {
  it('is inert while disabled', () => {
    const policy = policyWith([verifiedRoute({ id: 'mid-model', tier: 'mid' })]);
    expect(resolveRoute(false, policy, base).action).toBe('bypass');
  });

  it('bypasses when the mode is off so the user keeps their own model', () => {
    const policy = policyWith([verifiedRoute({ id: 'mid-model', tier: 'mid' })], { mode: 'off' });
    const decision = resolveRoute(true, policy, base);
    expect(decision.action).toBe('bypass');
    expect(decision.reasonCodes).toContain('invalid-policy');
  });

  it('never routes to an unverified model', () => {
    // The validator refuses the whole policy rather than quietly dropping the
    // model, so an unverified entry can never become a routing target.
    const policy = policyWith([
      verifiedRoute({ id: 'mid-model', tier: 'mid', verified: { ...createUnverifiedCapabilities() } }),
    ]);
    const decision = resolveRoute(true, policy, base);
    expect(decision.action).toBe('bypass');
    expect(decision.reasonCodes).toContain('invalid-policy');
  });

  it('skips a model the user switched off and uses the next verified one', () => {
    const policy = policyWith([
      verifiedRoute({ id: 'mid', tier: 'mid', enabled: false }),
      verifiedRoute({ id: 'strong', tier: 'strong' }),
    ]);
    const decision = resolveRoute(true, policy, base);
    expect(decision.target?.id).toBe('strong');
    expect(decision.reasonCodes).toContain('route-disabled');
  });

  it('uses the user-selected primary even when another model has a lower cost hint', () => {
    const policy = policyWith([
      verifiedRoute({ id: 'chosen-primary', tier: 'cheap', priority: 1, costHint: 0.5 }),
      verifiedRoute({ id: 'cheaper-fallback', tier: 'cheap', priority: 2, costHint: 0.1 }),
      verifiedRoute({ id: 'strong', tier: 'strong', priority: 1, costHint: 15 }),
    ]);
    const decision = resolveRoute(true, policy, { ...base, estimatedTokens: 120, turns: 1 });
    expect(decision.taskClass).toBe('trivial');
    expect(decision.target?.id).toBe('chosen-primary');
    expect(decision.target?.priority).toBe(1);
    expect(decision.reasonCodes).toContain('cost-optimized');
  });

  it('uses the configured fallback order after the primary is unavailable', () => {
    const policy = policyWith([
      verifiedRoute({ id: 'primary', tier: 'strong', priority: 1 }),
      verifiedRoute({ id: 'fallback-one', tier: 'strong', priority: 2 }),
      verifiedRoute({ id: 'fallback-two', tier: 'strong', priority: 3 }),
    ], { maxFallbacks: 2 });
    const fallbacks = resolveFallbackRoutes(policy, { ...base, hasTools: true }, new Set(['primary']));
    expect(fallbacks.map((route) => route.id)).toEqual(['fallback-one', 'fallback-two']);
  });

  it('spends the cheapest verified model on a trivial request', () => {
    const policy = policyWith([
      verifiedRoute({ id: 'cheap-a', tier: 'cheap', priority: 2, costHint: 0.5 }),
      verifiedRoute({ id: 'cheap-b', tier: 'cheap', priority: 1, costHint: 0.1 }),
      verifiedRoute({ id: 'strong', tier: 'strong', costHint: 15 }),
    ]);
    const decision = resolveRoute(true, policy, { ...base, estimatedTokens: 120, turns: 1 });
    expect(decision.taskClass).toBe('trivial');
    expect(decision.target?.id).toBe('cheap-b');
    expect(decision.reasonCodes).toContain('cost-optimized');
  });

  it('still saves money on trivial steps in max performance mode', () => {
    const policy = policyWith(
      [verifiedRoute({ id: 'cheap', tier: 'cheap' }), verifiedRoute({ id: 'strong', tier: 'strong' })],
      { mode: 'max-performance' },
    );
    const trivial = resolveRoute(true, policy, { ...base, estimatedTokens: 120, turns: 1 });
    expect(trivial.target?.id).toBe('cheap');

    const complex = resolveRoute(true, policy, { ...base, estimatedTokens: 20_000 });
    expect(complex.target?.id).toBe('strong');
  });

  it('prefers a healthy local model when the user opted in', () => {
    const policy = policyWith(
      [
        verifiedRoute({ id: 'local', tier: 'cheap', isLocal: true }),
        verifiedRoute({ id: 'cheap-api', tier: 'cheap', costHint: 0.1 }),
      ],
      { preferLocal: true },
    );
    const decision = resolveRoute(true, policy, base);
    expect(decision.target?.id).toBe('local');
    expect(decision.reasonCodes).toContain('local-preferred');
  });

  it('never sends protected work to a local or cheap model', () => {
    const policy = policyWith(
      [
        verifiedRoute({ id: 'local', tier: 'cheap', isLocal: true }),
        verifiedRoute({ id: 'cheap-api', tier: 'cheap' }),
        verifiedRoute({ id: 'strong', tier: 'strong' }),
      ],
      { preferLocal: true },
    );
    const decision = resolveRoute(true, policy, { ...base, hasTools: true });
    expect(decision.taskClass).toBe('protected');
    expect(decision.target?.id).toBe('strong');
  });

  it('rejects a model whose tool support was not proven', () => {
    const policy = policyWith([
      verifiedRoute({ id: 'strong', tier: 'strong', verified: { tools: false, toolResults: false } as never }),
    ]);
    const decision = resolveRoute(true, policy, { ...base, hasTools: true });
    expect(decision.action).toBe('bypass');
    expect(decision.reasonCodes).toContain('tools-unverified');
  });

  it('rejects a model whose proven context limit is too small', () => {
    const policy = policyWith([verifiedRoute({ id: 'mid', tier: 'mid', verified: { contextLimit: 8_000 } as never })]);
    const decision = resolveRoute(true, policy, { ...base, estimatedTokens: 20_000 });
    expect(decision.reasonCodes).toContain('context-limit');
  });

  it('skips an unhealthy route and continues down the chain', () => {
    const policy = policyWith([
      verifiedRoute({ id: 'mid', tier: 'mid' }),
      verifiedRoute({ id: 'strong', tier: 'strong' }),
    ]);
    const decision = resolveRoute(true, policy, base, { mid: { healthy: false, checkedAt: Date.now() } });
    expect(decision.target?.id).toBe('strong');
    expect(decision.reasonCodes).toContain('route-unhealthy');
  });

  it('treats verification older than the policy window as stale', () => {
    const stale = verifiedRoute({ id: 'mid', tier: 'mid' });
    stale.verified.verifiedAt = Date.now() - 31 * 86_400_000;
    expect(isVerificationStale(stale, 30, Date.now())).toBe(true);
    expect(isVerificationStale(stale, 0, Date.now())).toBe(false);

    const decision = resolveRoute(true, policyWith([stale]), base);
    expect(decision.reasonCodes).toContain('verification-stale');
  });

  it('classifies images and credential text as protected', () => {
    expect(classifyRequest({ ...base, hasImagesOrAttachments: true })).toBe('protected');
    expect(classifyRequest({ ...base, hasProtectedIndicators: true })).toBe('protected');
  });

  it('offers fallbacks that exclude the already-chosen model', () => {
    const policy = policyWith(
      [
        verifiedRoute({ id: 'mid', tier: 'mid' }),
        verifiedRoute({ id: 'strong', tier: 'strong' }),
      ],
      { maxFallbacks: 2 },
    );
    const fallbacks = resolveFallbackRoutes(policy, base, new Set(['mid']));
    expect(fallbacks.map((route) => route.id)).toEqual(['strong']);
  });
});

describe('Automatic tiering', () => {
  it('reads a price hint out of a display name', () => {
    expect(parseCostHint('DEEPSEEK V4 Flash 0.09-0.17')).toBeCloseTo(0.09);
    expect(parseCostHint('Claude Opus 5')).toBeUndefined();
  });

  it('treats local providers as the cheapest option', () => {
    expect(inferModelTier({ provider: 'ollama', displayName: 'Qwen 32B' })).toBe('cheap');
  });

  it('infers tiers from well-known model families', () => {
    expect(inferModelTier({ provider: 'anthropic', externalModelName: 'claude-opus-5' })).toBe('strong');
    expect(inferModelTier({ provider: 'anthropic', externalModelName: 'claude-haiku-4' })).toBe('cheap');
    expect(inferModelTier({ provider: 'openai', externalModelName: 'some-unknown-model' })).toBe('mid');
  });
});
