<div align="center">

# 🌌 Antigravity Custom Model Enabler (v2.31.0)

### Run Any External AI Model in Google Antigravity & Antigravity IDE

[![Google Antigravity](https://img.shields.io/badge/Google_Antigravity-v2.31.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Antigravity IDE](https://img.shields.io/badge/Antigravity_IDE-v1.107.0-34A853?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Tests Passing](https://img.shields.io/badge/Tests-189_Passed-2ea44f?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![WSL 2](https://img.shields.io/badge/WSL_2-Supported-blueviolet?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Security Vault](https://img.shields.io/badge/Security-AES--256--GCM-critical?style=for-the-badge&logo=security&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![UI Clean](https://img.shields.io/badge/UI-Zero_DOM_Pollution-blue?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)

---

#### 🌐 Choose Your Language / انتخاب زبان / 选择语言 / 言語を選択 / Seleccionar idioma / Choisir la langue

| [🇺🇸 English](README.md) | [🇮🇷 فارسی](README.fa.md) | [🇨🇳 简体中文](README.zh-CN.md) | [🇯🇵 日本語](README.ja.md) |
| :---: | :---: | :---: | :---: |
| [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇷🇺 Русский](README.ru.md) |

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Antigravity Custom Model Dropdown" width="80%">
</p>

</div>

> [!NOTE]
> **Unofficial compatibility patch.** This independent open-source project is not affiliated with, endorsed by, or supported by Google. “Google” and “Antigravity” are used only to describe compatible products; their respective trademark owners retain all rights.

This repository contains an advanced compatibility patch for **Google Antigravity (v2.31.0)** and **Antigravity IDE (v1.107.0)** that enables external AI models (OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio, and any OpenAI-compatible provider) alongside the built-in Gemini models.

It embeds a local HTTP proxy into the Electron app, reverse-engineers the Cloud Code internal API (`v1internal`), translates request/response formats and tool calls between providers, supports WSL 2 remote sessions on Windows, and provides an on-demand **Custom AI Models** modal (<kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>M</kbd> / <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>M</kbd>) with **zero DOM pollution**.

---

## ⚡ Key Highlights

| Feature | Description |
|---|---|
| 🪟 **Antigravity v2.31.0 Ready** | Fully compatible with 2.31.0's composite `BaseWindow` + `WebContentsView` architecture, `windowState.ts` multi-monitor tracking, and `antigravity-favicon://`. |
| 🛡️ **Zero DOM Pollution** | No fragile DOM modifications or Settings mutations. The native UI stays 100% pristine; management modal opens strictly on demand. |
| 🔒 **Encrypted Key Vault** | All API credentials are encrypted with hardware-backed **AES-256-GCM** via Electron `safeStorage`. |
| 🤖 **Agentic Tool Calling** | Full bidirectional tool calling (Function Calling & CLI command translation) for Claude, OpenAI, and DeepSeek. |
| 🐧 **Native WSL 2 Support** | Seamless Windows WSL 2 Linux distribution connection with auto-provisioned and SHA-256 verified `language_server`. |
| 📦 **15+ Provider Presets** | Instant presets for OpenAI, Anthropic, OpenRouter, DeepSeek, Groq, Mistral, Ollama, LM Studio, and more. |

---

## How to Use (Quick Start — v2.31.0)

### 1. Deploy the Patch

On **Windows**, double-click the batch script matching your target (or run the corresponding PowerShell script):

- **Both Antigravity Standalone & Antigravity IDE**: `repatch-all.bat` (or `repatch.bat` / `.\deploy.ps1`)
- **Antigravity Standalone only**: `repatch-antigravity.bat` (or `.\deploy-antigravity.ps1`)
- **Antigravity IDE only**: `repatch-ide.bat` (or `.\deploy-ide.ps1`)

On **macOS** or **Linux**, run `npm run build` followed by `bash deploy.sh` (macOS) or `bash deploy_linux.sh` (Linux).

### 2. Add & Manage Custom Models

In v2.31.0, the Antigravity UI stays 100% unmodified with **no injected Settings DOM sections**. Instead, open the **Custom AI Models** modal on demand from anywhere:

- **Keyboard Shortcut**: Press **`Ctrl+Alt+M`** (Windows/Linux) or **`Cmd+Option+M`** (macOS)
- **System Tray Menu**: Right-click the Antigravity tray icon → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Application Menu**: **File → Manage Custom Models...**

Inside the modal you can:
1. Click **Add Model** and pick one of the **15 provider presets** (API URL is auto-filled).
2. Enter the provider's **Model Name / ID** (e.g. `gpt-4o`, `claude-sonnet-4-5`, `deepseek-chat`), optional **Display Name**, and **API Key** (encrypted via Electron `safeStorage`).
3. Click **Test Connection** to verify reachability/auth, then **Save Model**.
4. **Edit** existing models (leave the API Key blank to keep your existing encrypted key), **Search** when you have more than 3 models, or **Delete** inline without blocking dialogs.
5. **Key Recovery**: If Antigravity was reinstalled and encrypted keys can no longer be decrypted, a warning banner offers **Batch Fix OpenRouter** to re-encrypt keys in one step.
6. Select your custom model directly from the Antigravity chat model dropdown.

### 3. Connect to WSL 2 (Windows)

Antigravity v2.31.0 includes built-in WSL 2 support on Windows:
- Open **File → Connect to WSL** or right-click the **System Tray icon → Connect to WSL** and choose a WSL 2 distro (automatically downloads and SHA-256 verifies the Linux `language_server` into `~/.antigravity-server/bin/<version>/`).
- Switch back at any time via **Reopen Locally**, or launch directly with `--wsl-distro=<DistroName>` / `ANTIGRAVITY_WSL_DISTRO=<DistroName>`.

## Gravity Auto Switch — Routing Status in v2.31.0

> [!NOTE]
> **Status in v2.31.0**: To keep the Antigravity UI completely clean and leave full manual control over model selection, **automatic chat rerouting (`resolveAutoSwitchModel`) and injected Auto Switch UI cards are disabled in v2.31.0**. Your manually selected model in the chat dropdown is always used directly. The Auto Switch router, verifier, and unit tests remain in [src/autoSwitch/](src/autoSwitch) and [docs/gravity-auto-switch.md](docs/gravity-auto-switch.md) for reference.

## How It Works

### Architecture

```
Antigravity IDE
  └── Language Server (Go binary)
        └── --api_server_url → http://127.0.0.1:50999 (local proxy)
                                  ├── Google models → daily-cloudcode-pa.googleapis.com
                                  └── Custom models → external API (Together, OpenAI, etc.)
```

### Key Components

#### Proxy Core
| File | Role |
|---|---|
| [proxy.ts](src/proxy.ts) | Local HTTP proxy: intercepts Cloud Code API, merges custom models, translates provider formats, wraps responses |
| [registry.ts](src/proxy/registry.ts) | Auto-discovery translator registry that dynamically loads `openai`, `anthropic`, `google`, and `ollama` translators |
| [shared.ts](src/proxy/shared.ts) | Cross-turn state management with automatic TTL cleanup |
| [modelUtils.ts](src/proxy/modelUtils.ts) | Centralized model capability detection (thinking, DeepSeek, Claude) |

#### Format Translators
| File | Role |
|---|---|
| [openai.ts](src/proxy/translators/openai.ts) | OpenAI ↔ Gemini format translation (request, response, streaming chunks, tool calls) |
| [anthropic.ts](src/proxy/translators/anthropic.ts) | Anthropic ↔ Gemini format translation (Claude tool_use, SSE streaming, thinking support) |
| [google.ts](src/proxy/translators/google.ts) | Google AI Studio passthrough with streaming endpoint routing |
| [ollama.ts](src/proxy/translators/ollama.ts) | Ollama ↔ Gemini format translation (OpenAI-compatible local LLMs) |
| [utils.ts](src/proxy/translators/utils.ts) | Shared translator utilities (tool call mapping, DSML parsing, parameter type fixing) |

#### Security & Data
| File | Role |
|---|---|
| [cryptoStore.ts](src/cryptoStore.ts) | AES-256-GCM API key encryption via Electron `safeStorage` |
| [schemaValidator.ts](src/schemaValidator.ts) | Runtime schema validation for API responses, custom models, and streaming chunks |

#### UI & App Integration
| File | Role |
|---|---|
| [preload.ts](src/preload.ts) | Exposes `contextBridge` APIs (`nativeStorage`, `wsl`, `electronNative`, etc.) and renders the on-demand Custom AI Models modal (`Ctrl+Alt+M` / `Cmd+Option+M`) with zero DOM pollution |
| [main.ts](src/main.ts) | App lifecycle: WSL provisioning splash, `HostBridgeServer`, `SetCloudCodeURL` request blocking, tray & menu setup |
| [ipcHandlers.ts](src/ipcHandlers.ts) | Backend IPC: custom model CRUD (`storage:get-custom-models`, `storage:save-custom-model`, `storage:delete-custom-model`, `storage:test-model-connection`, `storage:update-provider-keys`), WSL, zoom, and native context menus |
| [wsl.ts](src/wsl.ts) | WSL 2 distro discovery, Linux `language_server` provisioning with SHA-256 verification, and Windows/POSIX path translation |
| [provisionSplash.ts](src/provisionSplash.ts) | Frameless progress window shown during first-run WSL server download/install |
| [hostBridgeServer.ts](src/hostBridgeServer.ts) | ConnectRPC `HostBridgeServer` for language server host update queries |
| [autoSwitch/](src/autoSwitch) | Gravity Auto policy validation, verifier, and router modules (automatic chat rerouting is currently disabled in [proxy.ts](src/proxy.ts); see [Gravity Auto Switch](docs/gravity-auto-switch.md)) |
| [languageServer.ts](src/languageServer.ts) | Modified language server manager (local & WSL spawn, `ANTIGRAVITY_OPEN_URL` handling, starts proxy on launch) |

#### Deployment Scripts
| File | Platform / Target |
|---|---|
| [repatch-all.bat](repatch-all.bat) / [repatch.bat](repatch.bat) | Windows — builds TypeScript and runs `deploy.ps1` (Standalone + IDE) |
| [repatch-antigravity.bat](repatch-antigravity.bat) | Windows — builds TypeScript and runs `deploy-antigravity.ps1` (Standalone only) |
| [repatch-ide.bat](repatch-ide.bat) | Windows — builds TypeScript and runs `deploy-ide.ps1` (Antigravity IDE only) |
| [deploy.ps1](deploy.ps1) | Windows — all-in-one deploy for Antigravity Standalone (`app.asar`) and Antigravity IDE |
| [deploy-antigravity.ps1](deploy-antigravity.ps1) | Windows — deploys `dist/` into Antigravity Standalone `app.asar` and patches `language_server.exe` |
| [deploy-ide.ps1](deploy-ide.ps1) | Windows — deploys standalone CommonJS proxy (`out/mrmppro-proxy/`) and patches Antigravity IDE |
| [deploy.sh](deploy.sh) | macOS — extracts `app.asar` from `/Applications/`, replaces `dist/`, repacks and relaunches |
| [deploy_linux.sh](deploy_linux.sh) | Linux — auto-detects installation path across standard Electron app directories |
| [repack.ps1](repack.ps1) | Repacks existing `app.asar` with updated `dist/` files |

> [!NOTE]
> The codebase was migrated from JavaScript (`dist/`) to **TypeScript** (`src/`) in v2.0.3. All source code lives under `src/` and compiles to `dist/` via `npx tsc`. The compiled `dist/` files are what get packed into `app.asar`.

### Cloud Code API Reverse Engineering

Antigravity uses Google's **Cloud Code internal API** (`v1internal:*` endpoints) instead of the public Gemini API. The proxy handles these differences:

1. **fetchAvailableModels**: Intercepts and injects custom model definitions. Custom model slugs are added to `agentModelSorts` so they appear in the chat model dropdown. Quota info is omitted for custom models since they use the user's own API key.

2. **streamGenerateContent/generateContent**: Cloud Code wraps the Gemini request inside a `request` field:
   ```json
   {
     "project": "...",
     "requestId": "...",
     "request": { "contents": [...], "systemInstruction": {...}, "generationConfig": {...} },
     "model": "custom-deepseek-ai-deepseek-v4-pro"
   }
   ```
   The proxy extracts `request` before format translation.

3. **systemInstruction**: Cloud Code sends model identity/tool definitions in a separate `systemInstruction` field (not inside `contents`). The proxy maps this to OpenAI's `role: "system"` or Anthropic's `system` parameter.

4. **Response envelope**: Cloud Code wraps responses in `{"response": {...}, "traceId": "...", "metadata": {}}`. The proxy mirrors this format so the IDE accepts the response.

### Request/Response Flow

```
1. User selects custom model and sends message
2. IDE → POST /v1internal:streamGenerateContent?alt=sse → local proxy
3. Proxy detects custom model match (by slug or hash-based MODEL_PLACEHOLDER_* ID)
4. Extracts reqJson.request → maps systemInstruction + contents to provider format
5. POST to external API (e.g. https://api.together.xyz/v1/chat/completions)
6. Maps external response back to Gemini format
7. Wraps in Cloud Code envelope {"response": {...}, "traceId": "", "metadata": {}}
8. Returns SSE: data: {envelope}\n\n → IDE displays response
```

### Streaming Fix (Critical)

The proxy differentiates between **metadata requests** (which need buffering for URL rewriting) and **generation requests** (which must be streamed directly). If the proxy buffers `streamGenerateContent` or `generateContent` responses, the Go language server times out waiting for the stream to end, causing the app to crash with "terminated due to error."

- **Metadata requests** (`v1internal:*` excluding generation): Buffered, decompressed, URL-rewritten to point back to local proxy
- **Generation requests** (`streamGenerateContent`, `generateContent`): Piped directly without buffering, preserving real-time streaming

### SetCloudCodeURL Blocking

The Antigravity frontend periodically attempts to call `SetCloudCodeURL` which would override the local proxy endpoint with the default Google API URL. The `main.ts` process intercepts and **cancels** these requests via `webRequest.onBeforeRequest`, ensuring the language server always routes through the local proxy.

### DSML Tool Call Parser

DeepSeek models (and some other providers) return tool calls in a custom **DSML** (DeepSeek Markup Language) format embedded in text content:

```xml
<DSML|invoke name="search_web">
  <DSML|parameter name="query" string="true">latest news</DSML|parameter>
</DSML|invoke>
```

The proxy automatically detects DSML blocks, parses them into Gemini-format `functionCall` objects, and strips the XML from the displayed text. Native OpenAI `tool_calls` and Anthropic `tool_use` blocks are also supported.

### Anthropic Tool Calling

Claude models (`anthropic` provider and Anthropic-compatible endpoints such as `deepseek`, `kimi`, `fireworks`, `lmstudio`, `llamacpp`, `wafer`, `zai`) return tool calls as `tool_use` content blocks. The proxy maps these to Gemini-format `functionCall` parts, sets `finishReason: "TOOL_CALL"`, and stores tool call IDs for later matching with `functionResponse` objects in subsequent turns. Both streaming (SSE `content_block_start`/`content_block_delta`) and non-streaming responses are fully handled.

In v2.23.0+ (and v2.31.0), `normalizeSchemaForAnthropic()` converts Gemini tool parameter schemas (uppercase types, `nullable`, `propertyOrdering`, missing property types, and invalid `required` entries) into valid JSON Schema Draft 2020-12. Requests use `anthropic-version: 2023-06-01` and optionally include `anthropic-workspace-id` when `workspaceId`, `anthropicWorkspaceId`, or `ANTHROPIC_WORKSPACE_ID` is configured.

### Security: API Key Encryption

All API keys are encrypted at rest using **AES-256-GCM** via Electron's `safeStorage`. The `cryptoStore.ts` module provides:

- **Transparent encryption/decryption**: Keys are encrypted before writing to disk, decrypted on-the-fly when loaded into memory.
- **Auto-migration**: On first run after the encryption update, any legacy plaintext `custom_models.json` config is automatically detected, encrypted, and rewritten.
- **Masked display**: API keys in the UI are shown as `sk-...XXXX` (last 4 chars only) to prevent shoulder-surfing.
- **OS-level key storage**: On macOS, `safeStorage` uses the Keychain; on Windows, it uses DPAPI.

### Dynamic Port Management

The local proxy uses **dynamic port allocation** with automatic fallback:

```typescript
// proxy.ts → startProxy()
server.listen(50999, ...);  // Try default port
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    server.listen(0, ...);  // Fallback: let OS pick a free port
  }
});
```

If the default port `50999` is already in use (e.g., by another instance or stale process), the proxy automatically falls back to a random available port (`port: 0`). The `languageServer.ts` module reads the dynamically assigned port and injects it into the Go language server's `--api_server_url` argument at startup, ensuring the chain always stays connected.

### Parallel Request Isolation

Multiple models can now make simultaneous requests without cross-contamination. Previously, global variables like `lastToolCallIds` and `lastReasoningContent` could be overwritten by concurrent requests from different models. These have been migrated to **per-model `Map` structures**:

- `modelToolCallIds` (`Map<modelName, { fnName: toolCallId }>`) keeps tool call ID tracking scoped per model
- `modelReasoningContent` (`Map<modelName, string>`) keeps DeepSeek reasoning state scoped per model
- `activeStreamContexts` (`Map<streamId, context>`) keeps streaming accumulator scoped per stream

### Automatic State Cleanup

Proxy state is automatically cleaned up via a managed garbage collection interval:
- **Stream contexts**: TTL 10 minutes
- **Tool call IDs & reasoning**: TTL 30 minutes
- Interval starts with `startProxy()` and stops with `stopProxy()`, preventing orphaned timers

### Schema Validation

The `schemaValidator.ts` module provides runtime validation to catch malformed API responses before they reach the IDE frontend, preventing cryptic errors. Exported validators include:

| Function | Validates |
|---|---|
| `validateCandidate` | Individual Gemini candidate structure |
| `validateGenerateContentResponse` | Full Gemini response payload |
| `validateCloudCodeEnvelope` | Cloud Code `{ response, traceId, metadata }` wrapper |
| `validateCustomModel` | Single custom model config (provider enum, URL format) |
| `validateCustomModels` | Array of custom model configs |
| `validateGenerateContentRequest` | Request body structure |
| `validateOpenAiChunk` | OpenAI streaming chunk |
| `validateAnthropicEvent` | Anthropic SSE event type |

### Model Connectivity Test

Each custom model row and the Add/Edit form inside the Custom AI Models modal (`Ctrl+Alt+M` / `Cmd+Option+M`) have a **"Test Connection"** button that sends a lightweight request to the model's API endpoint:

- Quick connectivity check (10-second timeout)
- Green ✅ or red ❌ status indicator (and row status dot update)
- Helpful error messages for common issues (auth, timeout, SSL)
- Implemented via IPC: `storage:test-model-connection`

### Request Retry & Rate Limiting

The proxy automatically retries failed requests with exponential backoff:

- **Triggers**: 429 (Rate Limit), 502, 503, 504 (Server Errors)
- **Backoff**: 1s → 2s → 4s → 8s (max 3 retries)
- **Retry-After**: Respects server-sent `Retry-After` header
- **Configurable**: `maxRetries` field in model config (default: 3)

## Repository Structure

```
antigravity-add-model/
├── src/
│   ├── proxy.ts                   # HTTP proxy + Cloud Code interceptor + format translation
│   ├── proxy/
│   │   ├── registry.ts            # Auto-discovery translator registry
│   │   ├── shared.ts              # Cross-turn state management + TTL cleanup
│   │   ├── modelUtils.ts          # Centralized model capability detection
│   │   └── translators/
│   │       ├── openai.ts          # OpenAI ↔ Gemini translator
│   │       ├── anthropic.ts       # Anthropic ↔ Gemini translator + schema normalization
│   │       ├── google.ts          # Google AI Studio passthrough + stream routing
│   │       ├── ollama.ts          # Ollama endpoint & OpenAI-compat helpers
│   │       └── utils.ts           # Shared translator utilities (DSML, tool calls)
│   ├── autoSwitch/                # Policy validation, verifier, and router modules
│   ├── hostBridgeServer.ts        # ConnectRPC HostBridgeServer for LS update queries
│   ├── proto/
│   │   └── host_bridge_pb.ts      # HostBridge protobuf schema
│   ├── wsl.ts                     # WSL 2 discovery, server provisioning, and path translation
│   ├── provisionSplash.ts         # Frameless WSL server download/install splash screen
│   ├── languageServer.ts          # Modified language server manager (local & WSL)
│   ├── ipcHandlers.ts             # Custom model CRUD, WSL, zoom, context menu, and test IPC
│   ├── cryptoStore.ts             # AES-256-GCM API key encryption/decryption
│   ├── schemaValidator.ts         # Runtime schema validation for responses & models
│   ├── preload.ts                 # ContextBridge APIs + on-demand Custom AI Models modal
│   ├── main.ts                    # App lifecycle + WSL setup + SetCloudCodeURL blocking
│   ├── constants.ts               # Port & cert constants
│   ├── paths.ts                   # Path utilities & user state path resolvers
│   ├── storage.ts                 # StorageManager class
│   ├── windowState.ts             # Multi-window monitor tracking & cascading persistence
│   ├── faviconStore.ts            # Favicon storage & antigravity-favicon:// scheme
│   ├── debugConsole.ts            # Debug console tracking
│   ├── externalUrl.ts             # Safe external URL routing
│   ├── hubZoom.ts                 # Window zoom management & storage
│   ├── menu.ts                    # Application menu + Manage Custom Models + WSL Connect
│   ├── tray.ts                    # System tray + dynamic menu item insertion
│   ├── updater.ts                 # Auto-updater
│   ├── customScheme.ts            # Plugin & favicon custom scheme handlers
│   ├── keybindings.ts             # Keyboard shortcuts
│   ├── loadingOverlay.ts          # Loading screen overlay
│   ├── types.ts / types.d.ts      # Type definitions
│   ├── utils.ts                   # Composite window (curtain+hub), zoom & utilities
│   ├── services/
│   │   └── settingsService.ts
│   ├── ideInstall/                # IDE installation wizard
│   ├── __tests__/                 # Unit tests (vitest, 189 tests across 9 files)
│   │   ├── anthropic.test.ts
│   │   ├── autoSwitch.proxy.test.ts
│   │   ├── autoSwitch.router.test.ts
│   │   ├── modelUtils.test.ts
│   │   ├── openai.test.ts
│   │   ├── proxy.test.ts
│   │   ├── registry.test.ts
│   │   ├── utils.test.ts
│   │   └── wsl.test.ts
│   └── __mocks__/                 # Test mocks
├── dist/                          # Compiled JavaScript output
├── docs/
│   └── gravity-auto-switch.md     # Gravity Auto Switch architecture guide
├── tsconfig.json                  # TypeScript configuration
├── deploy.ps1                     # Windows all-in-one deploy (Standalone + IDE)
├── deploy-antigravity.ps1         # Windows Standalone-only deploy
├── deploy-ide.ps1                 # Windows Antigravity IDE-only deploy
├── deploy.sh                      # macOS deploy script
├── deploy_linux.sh                # Linux deploy script
├── repatch-all.bat                # One-click build & deploy (Standalone + IDE)
├── repatch-antigravity.bat        # One-click build & deploy (Standalone only)
├── repatch-ide.bat                # One-click build & deploy (IDE only)
├── repatch.bat                    # One-click build & deploy (alias for deploy.ps1)
├── repack.ps1                     # ASAR repack script
├── package.json                   # Electron app manifest (v2.31.0)
├── README.md                      # English documentation
├── README.fa.md                   # Persian documentation (راهنمای فارسی)
├── README.zh-CN.md                # Simplified Chinese documentation (简体中文)
├── README.ja.md                   # Japanese documentation (日本語)
├── README.es.md                   # Spanish documentation (Español)
├── README.fr.md                   # French documentation (Français)
├── README.de.md                   # German documentation (Deutsch)
└── README.ru.md                   # Russian documentation (Русский)
```

## Supported Providers

You can configure **multiple models from different providers simultaneously**. All of them will appear together in the model selection dropdown in the Antigravity chat interface, and you can switch between them in real-time.

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Model Selection Dropdown" width="600">
</p>

| Provider | Format | Environment Variable / Key | Default API URL |
|---|---|---|---|
| **OpenAI** | `openai` | `apiKey` (or `OPENAI_API_KEY`) | `https://api.openai.com/v1/chat/completions` |
| **Anthropic** | `anthropic` | `apiKey` (or `ANTHROPIC_API_KEY`) | `https://api.anthropic.com/v1/messages` |
| **OpenRouter** | `openrouter` | `apiKey` (OpenRouter API Key) | `https://openrouter.ai/api/v1/chat/completions` |
| **Ollama** (Local) | `ollama` | *(None required)* | `http://localhost:11434/v1/chat/completions` |
| **Google AI Studio** | `google` | `apiKey` *(Gemini API Key)* | `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` |
| **DeepSeek** | `deepseek` | `apiKey` | `https://api.deepseek.com/anthropic` |
| **Groq** | `groq` | `apiKey` | `https://api.groq.com/openai/v1` |
| **Mistral** | `mistral` | `apiKey` | `https://api.mistral.ai/v1` |
| **Cerebras** | `cerebras` | `apiKey` | `https://api.cerebras.ai/v1` |
| **Kimi (Moonshot)** | `kimi` | `apiKey` | `https://api.moonshot.ai/anthropic/v1` |
| **Fireworks AI** | `fireworks` | `apiKey` | `https://api.fireworks.ai/inference/v1` |
| **LM Studio** (Local) | `lmstudio` | *(None required)* | `http://localhost:1234/v1` |
| **llama.cpp** (Local) | `llamacpp` | *(None required)* | `http://localhost:8080/v1` |
| **NVIDIA NIM** | `nvidia` | `apiKey` | `https://integrate.api.nvidia.com/v1` |
| **Custom** (OpenAI-compatible) | `custom` | `apiKey` *(Provider API Key)* | Any OpenAI-compatible endpoint |

> [!NOTE]
> For the **Custom** provider, URLs ending in `/v1` automatically get `/chat/completions` appended. It is fully compatible with Together AI, OpenRouter, Groq, Mistral, and any other OpenAI-compliant endpoint.

> [!NOTE]
> **OpenRouter** provides unified access to 300+ models (OpenAI, Anthropic, Google, Meta, DeepSeek, etc.) through a single API. It uses the OpenAI-compatible format with Bearer token auth and optional `HTTP-Referer` / `X-Title` headers for ranking.

> [!NOTE]
> For **Google AI Studio**, provide the full endpoint URL or just the base `https://generativelanguage.googleapis.com/v1beta/models/`. The proxy auto-detects `streamGenerateContent` vs `generateContent` based on whether the request is streaming.

---

## Installation

### One-Click Re-Deploy (Windows — Recommended)

When Google releases a new Antigravity update, it replaces the Language Server binary and `app.asar`, so custom models stop working until re-patched. On **Windows**, run the batch script matching your installation:

| Script | Target | What it runs |
|---|---|---|
| `repatch-all.bat` *(or `repatch.bat`)* | **Antigravity Standalone + Antigravity IDE** | `npm run build` + `deploy.ps1` |
| `repatch-antigravity.bat` | **Antigravity Standalone only** | `npm run build` + `deploy-antigravity.ps1` |
| `repatch-ide.bat` | **Antigravity IDE only** | `npm run build` + `deploy-ide.ps1` |

Double-click the `.bat` file (or run it from a terminal) to compile TypeScript, redeploy the patch, and relaunch the app(s).

> [!IMPORTANT]
> Run the appropriate `repatch-*.bat` script after **every** Antigravity auto-update to restore custom model support.

### Automatic (Windows PowerShell)

```powershell
# All-in-One (Standalone + IDE)
.\deploy.ps1

# Or target individually:
.\deploy-antigravity.ps1   # Antigravity Standalone only
.\deploy-ide.ps1           # Antigravity IDE only
```

- `deploy.ps1` / `deploy-antigravity.ps1` stop running processes, preserve any existing clean `app.asar.backup`, merge `dist/` into `app.asar` without deleting official files, retry if files are briefly locked, apply the Language Server binary patch, and restart the app.
- `deploy-ide.ps1` copies proxy modules to `out\mrmppro-proxy\` (with `{"type": "commonjs"}` for IDE ESM compatibility), patches `out\main.js` and `extension.js`, binary-patches `language_server_windows_x64.exe`, and relaunches Antigravity IDE.

> [!TIP]
> The deploy scripts use `$PSScriptRoot` (their own directory), so you can run them from anywhere.

### Automatic (macOS)

```bash
bash deploy.sh
```

This kills any running Antigravity process, extracts the current `app.asar` from `/Applications/Antigravity.app/Contents/Resources/`, replaces its `dist/` with the latest build, re-packages, and relaunches the app.

> [!TIP]
> Make the script executable first: `chmod +x deploy.sh`. Like the Windows version, it auto-detects the project directory via `$SCRIPT_DIR`.

### Automatic (Linux)

```bash
bash deploy_linux.sh
```

Stops any running Antigravity process, auto-detects the `app.asar` location (common search paths: `~/.local/share/Programs/`, `/opt/`, `/usr/lib/`), replaces its `dist/` with the latest build, re-packages, and relaunches the app.

> [!TIP]
> Make the script executable first: `chmod +x deploy_linux.sh`. It automatically searches for the Antigravity installation across multiple standard Linux Electron app paths.

### Build & Test from Source (TypeScript)

```bash
npm install
npm run build   # runs npx tsc → dist/
npm test        # runs vitest (189 tests across 9 files)
```

### Manual (All Platforms)

```bash
npx -y @electron/asar pack . "<antigravity_resources_dir>/app.asar"
```

- **Windows**: `C:\Users\<User>\AppData\Local\Programs\antigravity\resources\` (or `...\Programs\Antigravity\resources\`)
- **macOS**: `/Applications/Antigravity.app/Contents/Resources/`

---

## Antigravity Update Recovery

### The Problem

Starting with **Antigravity v2.0.6**, Google hardcoded the `fetchAvailableModels` API URL to `https://daily-cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels` inside the Language Server binary. This call **bypasses the local proxy entirely**, meaning:

- Custom models remain in `custom_models.json` and appear in the **Custom AI Models** modal (`Ctrl+Alt+M`)
- But they **do NOT appear** in the chat model dropdown
- The chat dropdown only shows Google's built-in Gemini models

### The Fix: Binary Patch

The `deploy.ps1` / `deploy-antigravity.ps1` / `deploy-ide.ps1` / `deploy.sh` / `deploy_linux.sh` scripts **automatically apply a binary patch** to the Language Server executable. The hardcoded URL:

```
https://daily-cloudcode-pa.googleapis.com
```

is replaced with:

```
http://localhost:50999/v1internal/xxxxxxx
```

This forces the Language Server to route **all** `fetchAvailableModels` calls through the local proxy, where custom models are injected before the response reaches the Antigravity frontend.

### After EVERY Antigravity Update

When Google releases a new Antigravity version (e.g., v2.0.7, v2.1.0):

1. **Antigravity auto-updates** → The Language Server binary is replaced with an unpatched version
2. **Custom models disappear** from the chat dropdown again
3. **Re-run the deploy script** to re-apply the binary patch:

```powershell
# Windows (PowerShell)
npm run build
powershell -ExecutionPolicy Bypass -File ".\deploy.ps1"
```

```bash
# macOS / Linux
npm run build
bash deploy.sh        # macOS
bash deploy_linux.sh  # Linux
```

> [!IMPORTANT]
> **You must redeploy after every Antigravity update.** The update replaces `language_server.exe` with a clean version, removing the binary patch. Running `deploy.ps1` re-applies the patch automatically.

### How to Check if the Patch is Active

Check the Language Server log after startup:

```
# Windows
%APPDATA%\Antigravity\logs\language_server.log
```

If the patch is active, you'll see:
```
URL: http://localhost:50999/v1internal/xxxxxxx/v1internal:fetchAvailableModels
```

If the patch is NOT active (after an update), you'll see:
```
URL: https://daily-cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels
```

### Technical Details

The binary patch works by:

1. **Finding** the string `https://daily-cloudcode-pa.googleapis.com` (41 bytes) in the LS binary
2. **Replacing** it with `http://localhost:50999/v1internal/xxxxxxx` (exactly 41 bytes)
3. **URL cleanup**: The proxy strips the `/v1internal/xxxxxxx` padding from incoming requests before forwarding to Google

The patch also affects other hardcoded Cloud Code calls (`listExperiments`, `streamGenerateContent`, `loadCodeAssist`), routing them all through the proxy for consistent behavior.

### Manual Binary Patch (if deploy script fails)

```powershell
# Find the offset of the hardcoded URL
$offset = (Select-String -Path "language_server.exe" -Pattern "daily-cloudcode-pa.googleapis.com" -Encoding byte).Matches[0].Index - 8

# Apply the patch
$newUrl = [System.Text.Encoding]::ASCII.GetBytes("http://localhost:50999/v1internal/xxxxxxx")
$fs = [System.IO.File]::OpenWrite("language_server.exe")
$fs.Seek($offset, [System.IO.SeekOrigin]::Begin)
$fs.Write($newUrl, 0, $newUrl.Length)
$fs.Close()
```

> [!NOTE]
> The script above finds the `https://` prefix (8 bytes before the hostname) and replaces the full 41-byte URL. The `xxxxxxx` padding ensures the replacement stays exactly the same length as the original string.
>
> A backup of the original binary is automatically created at `language_server.exe.bak` before patching.

---

## Configuration

Models are stored in your home directory at `~/.gemini/antigravity/custom_models.json`. You can easily add them via the **"Add Model"** modal in Settings, or edit the JSON file directly.

Here is an example of a **fully loaded** `custom_models.json` file configuring **multiple models across all providers at the same time**:

```json
{
  "models": [
    {
      "name": "models/gpt-4o",
      "displayName": "GPT-4o (OpenAI)",
      "description": "OpenAI GPT-4o model via official API",
      "provider": "openai",
      "apiKey": "sk-proj-...",
      "apiUrl": "https://api.openai.com/v1/chat/completions",
      "externalModelName": "gpt-4o"
    },
    {
      "name": "models/claude-3-5-sonnet",
      "displayName": "Claude 3.5 Sonnet",
      "description": "Anthropic Claude 3.5 Sonnet via official API",
      "provider": "anthropic",
      "apiKey": "sk-ant-...",
      "apiUrl": "https://api.anthropic.com/v1/messages",
      "externalModelName": "claude-3-5-sonnet-latest"
    },
    {
      "name": "models/gemini-1.5-pro",
      "displayName": "Gemini 1.5 Pro (AI Studio)",
      "description": "Gemini 1.5 Pro via Google AI Studio Key",
      "provider": "google",
      "apiKey": "AIzaSy...",
      "apiUrl": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
      "externalModelName": "gemini-1.5-pro"
    },
    {
      "name": "models/llama3",
      "displayName": "Llama 3 (Local Ollama)",
      "description": "Local Llama 3 model run on Ollama port 11434",
      "provider": "ollama",
      "apiKey": "",
      "apiUrl": "http://localhost:11434/v1/chat/completions",
      "externalModelName": "llama3"
    },
    {
      "name": "models/deepseek-ai/deepseek-v4-pro",
      "displayName": "DeepSeek V4 Pro (Together)",
      "description": "DeepSeek V4 Pro via Together API",
      "provider": "custom",
      "apiKey": "YOUR_TOGETHER_API_KEY",
      "apiUrl": "https://api.together.xyz/v1",
      "externalModelName": "deepseek-ai/DeepSeek-V4-Pro",
      "maxRetries": 3
    }
  ]
}
```

### Fields Explanation

| Field | Description |
|---|---|
| `name` | Internal model identifier (e.g. `models/gpt-4o`). Must start with `models/` prefix. |
| `displayName` | The friendly name that will appear in the Antigravity chat model dropdown. |
| `description` | Subtitle/description stored with the model entry. |
| `provider` | Provider key determining translation & auth: `openai`, `anthropic`, `openrouter`, `ollama`, `google`, `deepseek`, `groq`, `mistral`, `cerebras`, `kimi`, `fireworks`, `lmstudio`, `llamacpp`, `nvidia`, `custom` (also supports `opencode`, `codestral`, `wafer`, `zai` in `registry.ts`). |
| `apiKey` | The API credential for the provider. Leave empty `""` or omit for local providers like Ollama. |
| `apiUrl` | The target endpoint. Automatically pre-filled by the UI provider selector. |
| `externalModelName` | The exact model ID expected by the target provider (e.g., `gpt-4o`, `claude-sonnet-4-5`, `llama3`). |
| `workspaceId` / `anthropicWorkspaceId` | (Optional, Anthropic) Sends `anthropic-workspace-id` header (can also be set via `ANTHROPIC_WORKSPACE_ID`). |
| `allowUnauthorized` | (Optional) Set to `true` to bypass SSL certificate validation. Useful for internal/self-signed endpoints. Default: `false`. |
| `timeout` | (Optional) Request timeout in milliseconds. Default: `120000` (2 minutes). |
| `maxRetries` | (Optional) Maximum retry attempts for rate-limited/failed requests. Default: `3`. |

## UI Features (v2.31.0 On-Demand Modal)

### Opening the Custom AI Models Modal

To keep Antigravity's native interface completely unmodified (**Zero DOM Pollution**), v2.31.0 does not inject elements into Settings. Open the modal on demand via:

- **Shortcut**: `Ctrl+Alt+M` (Windows/Linux) or `Cmd+Option+M` (macOS)
- **System Tray**: Right-click tray icon → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **App Menu**: **File → Manage Custom Models...**

### Modal Capabilities

- **Unified List & Add/Edit Card**: Smooth transitions between model list and add/edit form; close anytime with `Esc` or clicking outside.
- **15 Provider Presets**: OpenAI, Anthropic, Google AI Studio, OpenRouter, DeepSeek, Groq, Mistral, Cerebras, Kimi (Moonshot), Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, and Custom / Other.
- **Auto-Filled Endpoints**: Selecting a provider pre-fills `apiUrl`, and typing a Google AI Studio model ID dynamically builds the `:generateContent` URL.
- **Edit & Rename Models**: Click the edit (pencil) icon on any model to modify its URL, display name, or model ID; leave the API key blank to preserve the existing encrypted key.
- **Live Search**: Automatically appears when more than 3 models are configured to filter by display name, model ID, or provider.
- **Inline Delete Confirmation**: Click delete for an inline `Delete? [Yes] [No]` confirmation with instant optimistic removal (no blocking browser `confirm()` dialog).
- **Test Connection**: Per-row check button (updates status dot green/red) and in-form **Test Connection** button.
- **Key Recovery Banner ("Batch Fix OpenRouter")**: Automatically detects undecryptable keys (`keyValid === false`, e.g., after an Antigravity reinstallation) and offers one-click batch re-encryption for OpenRouter models.

<p align="center">
  <img src="assets/add_custom_model_modal.png" alt="Add Custom AI Model Modal" width="45%">
  <img src="assets/add_custom_model_provider_dropdown.png" alt="API Provider Selection" width="45%">
</p>

<p align="center">
  <img src="assets/custom_models_dashboard.png" alt="Custom Models Dashboard" width="800">
</p>

### SSL Bypass (Self-Signed / Internal CAs)

For enterprise environments using self-signed certificates or internal Certificate Authorities (e.g., corporate proxy servers, private API endpoints), add `"allowUnauthorized": true` to your model config:

```json
{
  "name": "models/internal-model",
  "displayName": "Internal LLM (Corporate)",
  "description": "Company-hosted model behind self-signed cert",
  "provider": "custom",
  "apiKey": "...",
  "apiUrl": "https://llm.internal.company.com/v1",
  "externalModelName": "llama3",
  "allowUnauthorized": true
}
```

> [!WARNING]
> When `allowUnauthorized` is enabled, a warning is logged to the console. SSL bypass is **only** applied to the specific model, never globally.

---

## Security Considerations

> [!WARNING]
> **API Key Security**: All API keys are encrypted at rest using AES-256-GCM via Electron's `safeStorage` (macOS Keychain / Windows DPAPI). Never share your `custom_models.json` file or expose API keys in logs.

> [!CAUTION]
> **SSL Verification**: The `allowUnauthorized: true` option disables TLS certificate validation. Only use this for trusted internal/self-signed endpoints. Enabling it for public API connections exposes you to man-in-the-middle attacks.

### Safe Defaults

- **Timeout**: Custom model API requests have a 120-second default timeout (configurable via `timeout` field). Google proxy requests have 30-60 second timeouts.
- **Body Size Limit**: Request bodies are capped at 10MB to prevent memory exhaustion. Exceeding returns `413 Payload Too Large`.
- **No Diagnostic Leaks**: Raw API responses are never written to disk. CSRF tokens are masked in console output.
- **Masked Keys**: API keys in the UI are displayed as `sk-...XXXX` (last 4 characters only).
- **Managed State**: Proxy cleanup interval is properly stopped on shutdown, preventing orphaned timers.

---

## Troubleshooting

### Port Conflict
If port `50999` is in use, the proxy auto-falls back to a random port. Check `~/.gemini/antigravity/active_port`.

### Language Server Crashes
Auto-restarts up to 3 times in 60 seconds. Check logs at:
- **Windows**: `%LOCALAPPDATA%\antigravity\logs\`
- **macOS**: `~/Library/Logs/antigravity/`

### SSL/TLS Errors
1. Ensure the provider's certificate is valid
2. As last resort, add `"allowUnauthorized": true` to model config
3. For internal CAs, install the CA certificate in your system trust store

### Model Not Appearing
1. Verify model name starts with `models/`
2. Check `apiUrl` is correct
3. Restart Antigravity after adding models
4. Use the **Test Connection** button to verify endpoint accessibility

### Connection Timeouts
1. Check if the provider's API is reachable (`curl -I <apiUrl>`)
2. Increase `timeout` field in model config (e.g., `"timeout": 180000` for 3 minutes)
3. Verify network/proxy/VPN settings

### Google Cloud Data Cloud Telemetry Hook Error (`MODULE_NOT_FOUND`)
If agent actions or tool calls are blocked with:
```
Error: Cannot find module '...\googlecloudtools.datacloud_telemetry\"...\telemetry_hook_bundle.js"'
```
**Cause:** The Data Cloud IDE extension automatically registers a pre-tool execution hook plugin with a nested quotes path bug on Windows.
**Fix:**
1. Run `repatch-all.bat` / `deploy.ps1` (step `[6e]` automatically replaces the hook with a safe no-op stub if the directory exists), **or** delete `C:\Users\<User>\.gemini\config\plugins\googlecloudtools.datacloud_telemetry`.
2. In Antigravity IDE / VS Code, open Extensions (`Ctrl+Shift+X`) and disable **Google Cloud Data Cloud** if telemetry is not required.

### Encrypted API Key Needs Re-Encryption (`DECRYPTION_FAILED` / `Key Expired`)
If Antigravity was reinstalled or Electron's `safeStorage` key changed, existing encrypted keys in `custom_models.json` may fail decryption:
- Open the Custom AI Models modal (`Ctrl+Alt+M`) and use **Edit** on the affected model, or use the **Batch Fix OpenRouter** banner at the top of the modal.
- Runtime requests to models with undecryptable keys fail cleanly with HTTP `400` and a clear prompt to update the key.

---

## Developer Guide

### Project Setup

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript → dist/
npm test             # Run unit tests (vitest)
npm run lint         # Run ESLint across src/**/*.ts
```

### Adding a New Provider

1. Create `src/proxy/translators/<provider>.ts` with these exports:
   - `mapGeminiTo<Provider>(geminiBody, modelName)` → provider-format request
   - `map<Provider>ToGemini(providerRes, modelName)` → Gemini-format response
   - `map<Provider>ChunkToGemini(chunk, modelName)` → streaming chunk handler
2. The registry auto-discovers new translator modules, so no config changes are needed
3. Add provider to `getProviderHeaders()` in `registry.ts` if authentication differs
4. Add provider option to UI dropdown in `src/preload.ts`
5. Update `supportsStreaming()` in `registry.ts` if applicable

### TypeScript Architecture

- **Strict mode**: `strict: true` in `tsconfig.json` (target: ES2020, module: CommonJS)
- **Centralized types**: Model capabilities in `modelUtils.ts`, shared state in `shared.ts`
- **No `eval()`**: JSON repair uses `repairPartialJson()` instead of dangerous `eval()` calls
- **No `any` in critical paths**: Request/response mapping uses explicit interfaces

### Debug Mode
```powershell
$env:HEADLESS="1"; .\Antigravity.exe
```

Set `DEBUG=antigravity:*` for verbose logging (debug level captures stream parse fallbacks and wire-level details).

---

## Changelog

### v2.31.0 — Antigravity v2.31.0 Architecture & Subsystem Compatibility
- **Official v2.31.0 Compatibility**: Updated codebase and build configuration to fully match official Google Antigravity **v2.31.0** (and IDE **v1.107.0**).
- **Composite Window Architecture**: Adapted window management to support Antigravity 2.31.0's `BaseWindow` + `WebContentsView` architecture (`curtainView` and `hubWcv`), multi-window tracking, and monitor-aware window positioning with cascade logic (`src/windowState.ts`).
- **In-App Browser & Script Jail Sandbox**: Integrated and proxied Antigravity 2.31.0's in-app webview subsystems (`wcvBrowserRegistry`, `webviewBrowser`, `scriptJail`, `deviceChooser`, `beyondcorpPac`, and WebAuthn platform authenticator) without breaking custom model injection.
- **Favicon & Custom Schemes**: Added `faviconStore` (`src/faviconStore.ts`) and registered `FAVICON_SCHEME` (`antigravity-favicon://`) with security checks and host validation.
- **Desktop Mic & Webview Preload APIs**: Updated `preload.ts` to expose `desktopMicAPI` on `contextBridge.exposeInMainWorld('desktopMic', ...)` and full webview controls on `electronNativeAPI`, matching 2.31.0 renderer expectations.
- **Environment & Process Management**: Implemented `prefetchShellEnv()` and `takeShellEnv()` to preserve login shell environments on non-Windows platforms while maintaining local proxy port injection (`http://localhost:50999/v1internal`).
- **Dependencies & Build Stability**: Bumped `package.json` to 2.31.0, upgraded `@connectrpc/connect-node` to `^2.2.0`, `electron-updater` to `^6.8.9`, `shell-env` to `^4.0.3`, resolved all TypeScript compilation errors, and verified 189/189 tests pass.

### v2.23.0 — Antigravity v2.23.0 & IDE v1.107.0 Compatibility, WSL 2 Support & On-Demand UI
- **Compatibility**: Updated `package.json`, `languageServer.ts`, `preload.ts`, `ipcHandlers.ts`, `utils.ts`, and deploy scripts for **Antigravity v2.23.0** and **Antigravity IDE v1.107.0**.
- **New (On-Demand Modal — Zero DOM Pollution)**: Replaced Settings DOM injection (`MutationObserver`) with a unified on-demand **Custom AI Models** modal opened via **`Ctrl+Alt+M`** (`Cmd+Option+M`), **File → Manage Custom Models...**, or **Tray → ⚙ Manage Custom Models**. Includes search, inline edit/rename with encrypted key preservation, inline delete confirmation, 15 provider presets, and **Batch Fix OpenRouter** key recovery.
- **New (WSL 2 Integration)**: Added `src/wsl.ts` and `src/provisionSplash.ts` for Windows WSL 2 distro discovery, automatic Linux `language_server` provisioning with SHA-256 verification and splash progress UI, **Connect to WSL** / **Reopen Locally** menu & tray entries, Windows UNC/POSIX path translation, and `--wsl-distro` / `ANTIGRAVITY_WSL_DISTRO` / `ANTIGRAVITY_WSL_LS_PATH` support.
- **Improved (Anthropic & Proxy)**: Added `normalizeSchemaForAnthropic()` for JSON Schema Draft 2020-12 tool parameter normalization, updated `anthropic-version` to `2023-06-01`, added `workspaceId` / `anthropicWorkspaceId` (`anthropic-workspace-id` header) support, expanded Claude 4.x/5.x capability detection, and added explicit HTTP 400 validation for undecryptable API keys.
- **Improved (Desktop & Window UX)**: Added persistent window zoom (`zoomLevel`), native context menu IPC (`window:show-context-menu`), multi-folder workspace picker, `webUtils.getPathForFile`, clickable tray icon on Windows/Linux, and `antigravity-ide://` external scheme support.
- **Improved (Auto Switch)**: Disabled automatic chat rerouting (`resolveAutoSwitchModel`) and injected Auto Switch DOM elements so manual model selection in the chat dropdown is always respected cleanly.
- **Improved (Deploy Scripts)**: `deploy.ps1`, `deploy-antigravity.ps1`, and `deploy-ide.ps1` now preserve clean `app.asar.backup` files, merge `dist/` without wiping official files, retry locked file operations, write `{"type": "commonjs"}` in `out/mrmppro-proxy/package.json` for IDE ESM compatibility, and remove external hardcoded sync script paths.
- **Verification**: Validated with `npm run build` and `npm test` (**189 tests passed across 9 test files**).

### v2.9.1 — HostBridgeServer, Streaming Keepalive & Separate Repatch Scripts
- **Compatibility (v2.9.1)**: Added ConnectRPC `HostBridgeServer` (`src/hostBridgeServer.ts`, `src/proto/host_bridge_pb.ts`) and `updater:get-state` handler to prevent language server crashes and unwanted window reloads.
- **Proxy Stability**: Extended streaming request timeout to 15 minutes with data keepalive, reused active proxy instances, and avoided destructive window force-reloads on server restarts.
- **Deploy Scripts**: Split Windows one-click scripts into `repatch-all.bat`, `repatch-antigravity.bat`, and `repatch-ide.bat` (backed by `deploy.ps1`, `deploy-antigravity.ps1`, and `deploy-ide.ps1`), plus automatic telemetry hook neutralization.

### v2.8.1 — Antigravity v2.8.1 Compatibility & IDE Model Injection Fix
- **Fixed (Antigravity IDE)**: Resolved custom models not appearing in the Antigravity IDE chat dropdown. Directly injects computed model slugs and placeholder IDs into `agentModelSorts.groups[].modelIds` across all proxy response paths (main, timeout, parse fallback, network error).
- **Fixed (Duplicates)**: Eliminated 4x duplicate model entries in the standalone Antigravity model list by registering only the primary canonical slug key in `models` dictionary.
- **Fixed (Deploy & Sync)**: Updated `deploy.ps1` to terminate process trees using `taskkill /T`, patch IDE `extension.js`, and launch both standalone Antigravity and Antigravity IDE seamlessly.
- **Maintained**: Full backwards-compatibility for `electronUpdater.getState()` to avoid renderer startup crashes.

### Gravity Auto Switch v3 — configurable cost-aware routing

- **New**: Optional **Auto** chat mode routes only your verified custom API models
  through user-assigned **Cheap**, **Mid-priced**, and **Strong** tiers.
- **Control**: You set each tier's **Primary** model and ordered fallbacks; the
  selected order is respected rather than replaced by automatic price guesses.
- **Savings modes**: **Budget friendly**, **Balanced**, and **Max performance**
  choose from your configured tiers according to the complexity of the request.
- **Safety**: Google-managed models are never rerouted. Tool use, attachments,
  protected work, and unverified capabilities follow conservative eligibility
  rules; manual selection is retained if no safe route is available.
- **Reliability**: A route that fails before returning a response can fall back
  to the next eligible model in the configured order. Re-verifying a model
  refreshes its proof without overwriting its tier, priority, or enabled state.
- **Verification**: The release was validated with `npm run build` and
  `npx vitest run` (**159 tests passed**).

See [Gravity Auto Switch](docs/gravity-auto-switch.md) for configuration,
routing behavior, logging, and limitations.

### v2.4.2 — Antigravity v2.4.2 Compatibility & MCP Subsystem Support
- **Compatibility**: Full support for **Antigravity v2.4.2** MCP (Model Context Protocol) subsystem.
- **Fixed**: Solid/blank screen after patching on v2.4.2 — bridged `mcpAPI` methods (`runMcpServer`, `stopMcpServer`, `stopAllMcpServers`, `sendMcpMessage`, and event listeners) via `contextBridge` in `src/preload.ts`.
- **Fixed**: Registered backend IPC handlers for `mcp:*` commands in `src/ipcHandlers.ts` and process shutdown hooks in `src/main.ts`.
- **Fixed**: Corrected batch script execution in `repatch.bat` using `call` to ensure automatic patch compilation and deployment.

### v2.2.0 — Antigravity v2.3.1 Compatibility
- **Compatibility**: Updated to work with **Antigravity v2.3.1** (previously only supported up to v2.0.x)
- **Fixed**: Solid/blank screen after patching — restored 3 missing contextBridge APIs that v2.3.1 frontend requires (`ide.isInstalled`, `electronUpdater.getState`, `electronNative.revealInFilePicker`)
- **Fixed**: Auto-updater now properly accepts `settingsService` parameter matching v2.3.1 signature (`initAutoUpdater(isHeadless, settingsService)`)
- **Fixed**: Restored `setAutoUpdateChecking`, `getLastState`, and settings-driven periodic update scheduling that v2.3.1 depends on
- **Fixed**: Restored `AUTO_CHECK_FOR_UPDATES` setting key and `onSettingChanged` listener in SettingsService
- **Fixed**: Deploy scripts no longer use `--unpack-dir "node_modules"` which was stripping node_modules from `app.asar` (879 KB instead of ~2 MB), causing broken installations
- **Improved**: Deploy scripts now detect Antigravity version updates via file timestamp/size comparison and automatically refresh the backup
- **Improved**: Self-healing logic added — if `app.asar` size drops below 80% of backup, it auto-restores before patching

### v2.1.0
- **TypeScript**: Full migration — all 23 source files converted from JavaScript to TypeScript (`dist/*.js` → `src/*.ts`)
- **New Provider**: OpenRouter support (300+ models via unified API, OpenAI-compatible format)
- **OpenRouter UI**: Provider dropdown, auto-filled URL, connection test, icon & color in Settings modal
- **Dev Experience**: ESLint + Prettier configured with automated `lint`, `format`, `lint:fix` scripts
- **Test Coverage**: Expanded to 137 tests across 6 test files (registry, proxy, modelUtils, translators)
- **Cleanup**: Removed 25+ scratch development artifacts, added `.prettierignore`
- **Architecture**: `ideInstall/` wizard extracted to dedicated TypeScript module

### v2.0.3
- **Architecture**: Extracted Google AI Studio translator to dedicated module
- **Architecture**: Managed proxy state cleanup with proper interval lifecycle
- **New**: Model connectivity test in Settings (green/red status indicator)
- **New**: Automatic request retry with exponential backoff (429/5xx)
- **New**: Configurable `maxRetries` per model
- **Security**: Removed automatic SSL bypass for custom providers
- **Security**: Added 10MB request body size limit (413 on overflow)
- **Security**: Masked CSRF token in console output
- **Security**: Added timeouts to all Google proxy requests (30-60s)
- **Error handling**: Added debug logging to 6 previously-silent catch blocks
- **Error handling**: Proper error propagation in streaming response handlers
- **Fixed**: `deploy.ps1` now uses `$PSScriptRoot` (portable, no hardcoded paths)
- **Documentation**: Updated README with TypeScript architecture, security defaults, troubleshooting
- **Package**: Added `Apache-2.0` license field to `package.json`

### v2.0.2
- **Security**: Replaced `eval()` with safe `repairPartialJson()` (code injection fix)
- **Security**: SSL bypass now only when `allowUnauthorized: true` (not all custom providers)
- **Security**: Removed diagnostic `api_response_raw.json` disk writes
- **Security**: Added 10MB request body size limit
- **Security**: Added 120s configurable API request timeout
- **Error handling**: Added error handlers for streaming and non-streaming API responses
- **Fixed**: `deploy.ps1` hardcoded path to now uses `$PSScriptRoot`
- **Documentation**: Added Security Considerations, Troubleshooting, and Developer Guide

### v2.0.2 (2026-05-24)
- **Critical fix**: Antigravity v2.0.6 update hardcoded `fetchAvailableModels` URL to `daily-cloudcode-pa.googleapis.com`, bypassing the local proxy. Custom models disappeared from the chat dropdown.
- **Binary patch**: The Language Server binary is now automatically patched at build time to replace the hardcoded Google URL with the local proxy URL.
- **URL padding handler**: Added regex-based URL cleanup in the proxy to strip binary patch padding.
- **Model API fallbacks**: Added `GetAvailableModels` redirect, preload network interceptors, and forced page reload for robust model loading across Antigravity versions.

### v2.0.0
- Initial release: multi-provider proxy, API key encryption, streaming, tool calls, custom UI

---

## Contributing

Pull requests welcome. Please ensure:
1. Code follows existing style (JSDoc comments, consistent error handling)
2. New provider translators include both request and response mapping
3. Security-sensitive code avoids `eval`, plaintext key logging, and improper SSL handling
4. TypeScript compiles cleanly: `npx tsc --noEmit`

---

## License and attribution

This is a modified derivative of the **Antigravity Custom Model Enabler** project
created by Vahap Ogut (see this repository’s Git history). Gravity Auto Switch
and its documentation are additional modifications by the maintainers of this
repository.

This repository is distributed under the Apache License 2.0. See
[LICENSE](LICENSE) and [NOTICE](NOTICE). Retain applicable copyright,
attribution, and license notices when redistributing modified versions.

---

## Developer

**Abdulvahap OGUT** — Original project creator
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/abdulvahap-ogut-343992398/)

**Mohsen and contributors** — Gravity Auto Switch and fork maintenance
Website: [mrmp.pro](https://mrmp.pro/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mohsen-mahmodpour/)
