import { AutoSwitchRoute, RequestFeatures, RouteDecision, RouteHealthMap, TaskClass } from './types';
export declare function classifyRequest(features: RequestFeatures): TaskClass;
export declare function hasProtectedText(text: string): boolean;
/** True when the model's proof of capability is older than the policy allows. */
export declare function isVerificationStale(route: AutoSwitchRoute, reverifyDays: number, now: number): boolean;
export declare function resolveRoute(enabled: boolean, policyInput: unknown, features: RequestFeatures, health?: RouteHealthMap, now?: number): RouteDecision;
/**
 * Ordered list of alternates for the runtime safety net, used when the chosen
 * model fails before producing its first token.
 */
export declare function resolveFallbackRoutes(policyInput: unknown, features: RequestFeatures, excludeIds: ReadonlySet<string>, health?: RouteHealthMap, now?: number): AutoSwitchRoute[];
//# sourceMappingURL=router.d.ts.map