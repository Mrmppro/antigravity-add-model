/**
 * Auto Switch capability verifier.
 *
 * Runs real probes against a user-added model so Auto Switch never has to guess
 * what a model supports. This is the reason the manual "supports tools"
 * checkbox could be removed: capability is proven, not declared.
 *
 * Runs in the MAIN process only, because only main can decrypt API keys.
 */

import * as http from 'http';
import * as https from 'https';
import log from 'electron-log';
import * as registry from '../proxy/registry';
import { inferModelTier, isLocalProvider, parseCostHint } from './tiering';
import { AutoSwitchRoute, VerifiedCapabilities, createUnverifiedCapabilities } from './types';

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

const PROBE_TIMEOUT_MS = 20_000;

/** Anthropic-family providers speak the Messages API rather than chat completions. */
const ANTHROPIC_STYLE = new Set(['anthropic', 'deepseek', 'kimi', 'fireworks', 'lmstudio', 'llamacpp', 'wafer', 'zai']);

interface ProbeResponse {
  statusCode: number;
  body: string;
}

/**
 * Strips anything that could carry a secret out of an error string. Probe
 * failures are shown directly in the UI, so they must never leak a key.
 */
export function redactProbeError(raw: string): string {
  return raw
    .replace(/(sk|pk|key|token|bearer)[-_a-z0-9]*[\s:=]+[A-Za-z0-9._-]{8,}/gi, '$1 [redacted]')
    .replace(/\b[A-Za-z0-9._-]{32,}\b/g, '[redacted]')
    .slice(0, 300);
}

function postJson(
  urlStr: string,
  headers: Record<string, string>,
  payload: unknown,
  allowUnauthorized: boolean,
): Promise<ProbeResponse> {
  return new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = new URL(urlStr);
    } catch {
      reject(new Error('The API URL is not valid.'));
      return;
    }

    const client = url.protocol === 'https:' ? https : http;
    const body = JSON.stringify(payload);
    const options: https.RequestOptions = {
      method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(body).toString() },
    };
    if (allowUnauthorized) (options as Record<string, unknown>).rejectUnauthorized = false;

    const request = client.request(url, options, (res) => {
      let raw = '';
      res.on('data', (chunk: Buffer) => {
        raw += chunk.toString('utf8');
        // A probe response is tiny; anything larger means we hit the wrong URL.
        if (raw.length > 200_000) request.destroy(new Error('The endpoint returned an unexpectedly large response.'));
      });
      res.on('end', () => resolve({ statusCode: res.statusCode || 0, body: raw }));
      res.on('error', (err) => reject(err));
    });

    request.setTimeout(PROBE_TIMEOUT_MS, () => {
      request.destroy(new Error(`The model did not answer within ${PROBE_TIMEOUT_MS / 1000} seconds.`));
    });
    request.on('error', (err) => reject(err));
    request.write(body);
    request.end();
  });
}

function buildProbeUrl(model: VerifiableModel): string {
  const provider = model.provider.toLowerCase();
  if (provider === 'ollama') {
    const translator = registry.getTranslator('ollama');
    return registry.getProviderUrl(model.apiUrl, model.externalModelName, false, translator);
  }
  if (ANTHROPIC_STYLE.has(provider)) return model.apiUrl;
  return registry.normalizeChatCompletionsUrl(model.apiUrl);
}

/**
 * A single-word answer keeps the probe's token cost negligible. Both the chat
 * completions and Messages APIs accept this same minimal shape.
 */
function buildReachabilityPayload(model: VerifiableModel): unknown {
  return {
    model: model.externalModelName,
    max_tokens: 8,
    messages: [{ role: 'user', content: 'Reply with the single word: ok' }],
  };
}

/**
 * Asks the model to call a trivial function. If it returns a tool call, tool
 * support is proven; if it answers in prose, it is not.
 */
function buildToolPayload(model: VerifiableModel): unknown {
  const provider = model.provider.toLowerCase();
  if (ANTHROPIC_STYLE.has(provider)) {
    return {
      model: model.externalModelName,
      max_tokens: 128,
      tools: [
        {
          name: 'agy_probe',
          description: 'Returns a fixed probe value.',
          input_schema: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] },
        },
      ],
      messages: [{ role: 'user', content: 'Call the agy_probe tool with value "ok". Do not answer in prose.' }],
    };
  }
  return {
    model: model.externalModelName,
    max_tokens: 128,
    tools: [
      {
        type: 'function',
        function: {
          name: 'agy_probe',
          description: 'Returns a fixed probe value.',
          parameters: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] },
        },
      },
    ],
    tool_choice: 'auto',
    messages: [{ role: 'user', content: 'Call the agy_probe tool with value "ok". Do not answer in prose.' }],
  };
}

function detectToolCall(body: string): boolean {
  // Both API families name the field explicitly, so a substring check is enough
  // and avoids depending on a specific provider's response envelope.
  return /"tool_calls"\s*:\s*\[/.test(body) || /"type"\s*:\s*"tool_use"/.test(body) || /"function_call"\s*:/.test(body);
}

/**
 * Reads a context window from the error body when the provider reports one.
 * Many providers include the true limit in their 400 response, which is more
 * trustworthy than any static table we could ship.
 */
export function parseContextLimit(body: string): number | undefined {
  const match = body.match(/(?:maximum context length is|context_length_exceeded[^0-9]{0,40}|max(?:imum)?[_ ]tokens?[^0-9]{0,20})(\d{3,8})/i);
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) && value >= 1_000 ? value : undefined;
}

function describeFailure(statusCode: number, body: string): string {
  if (statusCode === 401 || statusCode === 403) return 'The API key was rejected. Check the key and try again.';
  if (statusCode === 404) return 'The endpoint or model name was not found. Check the API URL and model name.';
  if (statusCode === 429) return 'The provider is rate limiting this key right now. Try again in a moment.';
  if (statusCode >= 500) return `The provider returned a server error (HTTP ${statusCode}).`;
  const snippet = redactProbeError(body).replace(/\s+/g, ' ').trim();
  return `The provider rejected the request (HTTP ${statusCode})${snippet ? `: ${snippet}` : '.'}`;
}

/**
 * Probes a model and returns a route entry.
 *
 * `ok` is true only when the model answered a real request. A model that
 * answers but cannot use tools is still `ok` — it is simply recorded as
 * tool-incapable, and the router will keep tool work away from it.
 */
export async function verifyModel(model: VerifiableModel, apiKey: string): Promise<VerificationResult> {
  const messages: string[] = [];
  const verified: VerifiedCapabilities = createUnverifiedCapabilities();
  const provider = model.provider.toLowerCase();

  const route: AutoSwitchRoute = {
    id: model.name,
    displayName: model.displayName || model.name,
    tier: inferModelTier(model),
    priority: 1,
    isLocal: isLocalProvider(provider),
    costHint: parseCostHint(model.displayName) ?? parseCostHint(model.name),
    enabled: false,
    verified,
  };

  if (provider === 'google') {
    // Google requests are deliberately outside Auto Switch. Leaving them alone
    // is what keeps the native Google model selection working untouched.
    verified.lastError = 'Google models are always used exactly as selected and cannot be Auto Switch targets.';
    return { ok: false, route, messages: [verified.lastError] };
  }

  if (!model.apiUrl || !model.externalModelName) {
    verified.lastError = 'The model is missing an API URL or a provider model name.';
    return { ok: false, route, messages: [verified.lastError] };
  }

  const url = buildProbeUrl(model);
  const headers = registry.getProviderHeaders(provider, apiKey) as Record<string, string>;
  const allowUnauthorized = model.allowUnauthorized === true;

  // ── Probe 1: can this model answer a plain request at all? ──
  try {
    const response = await postJson(url, headers, buildReachabilityPayload(model), allowUnauthorized);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      verified.reachable = true;
      verified.contextLimit = parseContextLimit(response.body);
    } else {
      verified.lastError = describeFailure(response.statusCode, response.body);
      messages.push(verified.lastError);
      const limit = parseContextLimit(response.body);
      if (limit) verified.contextLimit = limit;
    }
  } catch (err) {
    verified.lastError = redactProbeError((err as Error).message);
    messages.push(verified.lastError);
  }

  if (!verified.reachable) {
    log.warn(`[Auto Switch] Verification failed for ${route.displayName}: ${verified.lastError}`);
    return { ok: false, route, messages };
  }

  // ── Probe 2: can it use Antigravity's tools? ──
  try {
    const response = await postJson(url, headers, buildToolPayload(model), allowUnauthorized);
    if (response.statusCode >= 200 && response.statusCode < 300 && detectToolCall(response.body)) {
      verified.tools = true;
      // Returning a well-formed tool call is what the agent loop needs in order
      // to feed a result back, so the two capabilities move together.
      verified.toolResults = true;
    } else {
      messages.push(
        `${route.displayName} answered normal requests but did not return a tool call, so Auto Switch will not send it tool work.`,
      );
    }
  } catch (err) {
    messages.push(
      `Tool support could not be confirmed for ${route.displayName} (${redactProbeError((err as Error).message)}).`,
    );
  }

  verified.verifiedAt = Date.now();
  verified.lastError = undefined;
  log.info(
    `[Auto Switch] Verified ${route.displayName}: tier=${route.tier} tools=${verified.tools} local=${route.isLocal} contextLimit=${verified.contextLimit ?? 'unknown'}`,
  );

  return { ok: true, route, messages };
}
