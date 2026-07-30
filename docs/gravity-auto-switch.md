# Gravity Auto Switch

Gravity Auto Switch is an **opt-in model router** for the verified custom API
models you add to this patch. It helps you use your own API budget deliberately:
routine work can use a lower-cost model, while complex and protected work stays
on the capable routes you choose.

It never changes the Google model you explicitly select. Google models are not
Auto Switch targets.

> [!IMPORTANT]
> Auto Switch does not promise a particular monetary saving. Your results depend
> on the API providers, model pricing, requests, and tier assignments you choose.
> It is always possible to leave Auto off and use Manual mode.

## Set up Auto Switch

1. Open **Settings → Models → Custom Models**.
2. Add models using your own provider accounts, then press **Verify** for every
   model that may participate in Auto Switch.
3. In **Gravity Auto Switch**, enable the models you want to use.
4. Set **Use for** to assign each model to **Cheap**, **Mid-priced**, or
   **Strong**.
5. Use the arrow controls to order models within each tier. **Primary** is tried
   first; later entries are fallbacks.
6. Choose a spending mode and turn Auto Switch on.
7. In the chat control, select **Auto** to route that chat. Choose **Manual** to
   keep the selected model unchanged.

The policy is stored separately from model credentials at:

```text
~/.gemini/antigravity/gravity_auto_switch.json
```

It contains model references and routing settings—not API keys. API keys remain
in the encrypted custom-model store.

## Spending modes

| Mode | Routine work | Complex or protected work |
| --- | --- | --- |
| **Budget friendly** | Prefers Cheap, then Mid-priced | Strong, then Mid-priced |
| **Balanced** | Uses Mid-priced for normal work; Cheap for small work | Strong, then Mid-priced |
| **Max performance** | Allows cheaper routes for trivial work, then favors Mid-priced/Strong | Strong, then Mid-priced |

The order inside a tier is entirely yours. The router respects **priority**
first, using a cost hint only as a deterministic tie-breaker.

## Safety and eligibility

- Routing is off by default and only happens when **Auto** mode is selected.
- Only custom models that you explicitly enable and successfully verify can be
  considered. Google models remain untouched.
- Requests using tools, function results, credentials, deployment/production
  language, destructive-operation language, or images/attachments are classified
  as **protected**. Protected work excludes Cheap and local routes and follows
  the Strong → Mid-priced chain.
- A model must prove a required capability during verification. For example,
  unverified tool support prevents it from handling a tool request.
- Image/attachment routing is deliberately conservative. Until a model proves
  image support, image and attachment requests remain on the manually selected
  model instead of being sent to an unproven Auto route.
- Verification can be rechecked every 30 days (configurable). A stale or failed
  model is skipped rather than silently used.
- When an Auto-selected model fails before producing a response, the configured
  eligible fallbacks are attempted in priority order, up to the policy limit.

## Confirm a decision

The local Antigravity main log records every Auto decision. Look for a line such
as:

```text
[Auto Switch] native=custom-openai-gpt-5-6-terra class=protected action=route \
chain=strong>mid reasons=protected-request tier=strong priority=1 \
target=GPT 5.6 Terra (custom)
```

Here, `tier=strong` and `priority=1` confirm that the Strong-tier Primary was
selected. If no eligible model exists, Auto safely bypasses routing and leaves
the manual selection untouched.

## Current limits

- Image support is not automatically assumed from a model name or provider; it
  requires a successful capability probe.
- Custom-model `countTokens` uses a safe local estimate because providers do
  not share a single token-counting API.
- This is an unofficial compatibility patch; review each provider's own pricing,
  terms, and data-handling policies before using it with sensitive information.
