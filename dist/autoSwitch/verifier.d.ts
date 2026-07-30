/**
 * Auto Switch capability verifier.
 *
 * Runs real probes against a user-added model so Auto Switch never has to guess
 * what a model supports. This is the reason the manual "supports tools"
 * checkbox could be removed: capability is proven, not declared.
 *
 * Runs in the MAIN process only, because only main can decrypt API keys.
 */
import { AutoSwitchRoute } from './types';
export interface VerifiableModel {
    name: string;
    displayName?: string;
    provider: string;
    apiKey: string;
    apiUrl: string;
    externalModelName: string;
    allowUnauthorized?: boolean;
}
export interface VerificationResult {
    ok: boolean;
    /** Route entry ready to be stored, present whether or not the probe passed. */
    route: AutoSwitchRoute;
    /** Redacted, user-readable messages describing what failed. */
    messages: string[];
}
/**
 * Strips anything that could carry a secret out of an error string. Probe
 * failures are shown directly in the UI, so they must never leak a key.
 */
export declare function redactProbeError(raw: string): string;
/**
 * Reads a context window from the error body when the provider reports one.
 * Many providers include the true limit in their 400 response, which is more
 * trustworthy than any static table we could ship.
 */
export declare function parseContextLimit(body: string): number | undefined;
/**
 * Probes a model and returns a route entry.
 *
 * `ok` is true only when the model answered a real request. A model that
 * answers but cannot use tools is still `ok` — it is simply recorded as
 * tool-incapable, and the router will keep tool work away from it.
 */
export declare function verifyModel(model: VerifiableModel, apiKey: string): Promise<VerificationResult>;
//# sourceMappingURL=verifier.d.ts.map