<div align="center">

# 🌌 Google Antigravity Patch für Eigene KI-Modelle (v2.31.0)

### Beliebige Externe KI-Modelle in Google Antigravity & Antigravity IDE Nutzen

[![Google Antigravity](https://img.shields.io/badge/Google_Antigravity-v2.31.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Antigravity IDE](https://img.shields.io/badge/Antigravity_IDE-v1.107.0-34A853?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Tests Passing](https://img.shields.io/badge/Tests-189_Passed-2ea44f?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![WSL 2](https://img.shields.io/badge/WSL_2-Supported-blueviolet?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Security Vault](https://img.shields.io/badge/Security-AES--256--GCM-critical?style=for-the-badge&logo=security&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![UI Clean](https://img.shields.io/badge/UI-Zero_DOM_Pollution-blue?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)

---

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.tr.md">Türkçe</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.th.md">ไทย</a> ·
  <b>Deutsch</b> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.uk.md">Українська</a> ·
  <a href="README.pl.md">Polski</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.ar.md">العربية</a> ·
  <a href="README.fa.md">فارسی</a> ·
  <a href="README.id.md">Bahasa Indonesia</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.el.md">Ελληνικά</a> ·
  <a href="README.ml.md">മലയാളം</a> ·
  <a href="README.roman-urdu.md">Roman Urdu</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.bg.md">Български</a>
</p>

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Antigravity Modellauswahl" width="80%">
</p>

</div>

> [!NOTE]
> **Haftungsausschluss (Inoffizieller Kompatibilitäts-Patch):** Dies ist ein unabhängiges Open-Source-Projekt, das in keiner Verbindung zu Google steht und nicht von Google unterstützt wird. Die Marken „Google“ und „Antigravity“ werden ausschließlich zur Beschreibung kompatibler Produkte verwendet.

Dieses Repository enthält einen vollständigen Kompatibilitäts-Patch für **Google Antigravity (v2.31.0)** und **Antigravity IDE (v1.107.0)**. Er ermöglicht es, externe KI-Modelle (wie OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio sowie jeden OpenAI-kompatiblen Endpunkt) parallel zu den integrierten Gemini-Modellen zu nutzen.

Ein sicherer lokaler HTTP-Proxy wird in die Electron-App eingebettet, die interne Cloud-Code-API (`v1internal`) per Reverse Engineering angebunden, Modellformate und Tool-Aufrufe (Tool Calling / Function Calling) in Echtzeit übersetzt, WSL 2 unter Windows nativ unterstützt und ein modales Fenster per **`Ctrl+Alt+M`** bereitgestellt – **völlig ohne Manipulation des nativen Interfaces (Zero DOM Pollution)**.

---

## ⚡ Wichtigste Vorteile

| Vorteil | Beschreibung |
|---|---|
| 🪟 **Antigravity 2.31.0 Bereit** | Kompatibel mit der `BaseWindow` + `WebContentsView` Architektur, Multi-Monitor-Speicherung (`windowState.ts`) und Favicon-Protokoll. |
| 🛡️ **Zero DOM Pollution** | Die native UI bleibt 100% sauber; keine instabilen DOM-Injektionen in die Einstellungen. Das Verwaltungsfenster öffnet nur auf Abruf. |
| 🔒 **Sicherer Schlüssel-Tresor** | API-Schlüssel werden über Electron `safeStorage` mit **AES-256-GCM** hardwarenah verschlüsselt. |
| 🤖 **Nahtloses Tool Calling** | Vollständige Übersetzung von Agent-Tools (Befehlsausführung und Dateizugriffe) für Claude, OpenAI und DeepSeek. |
| 🐧 **Native WSL 2 Unterstützung** | Direkte Verbindung mit Windows WSL 2 Linux-Distributionen inklusive automatischer SHA-256 Server-Verifikation. |
| 📦 **Über 15 Provider-Vorlagen** | Sofortige Voreinstellungen für OpenAI, Anthropic, OpenRouter, DeepSeek, Ollama, Groq und mehr. |

---

## Schnellstart (Quick Start — v2.31.0)

### 1. Patch anwenden

Unter **Windows** doppelklicken Sie einfach auf die entsprechende Batch-Datei (oder führen Sie das PowerShell-Skript aus):

- **Sowohl Antigravity Standalone als auch IDE**: `repatch-all.bat` (oder `.\deploy.ps1`)
- **Nur Antigravity Standalone**: `repatch-antigravity.bat` (oder `.\deploy-antigravity.ps1`)
- **Nur Antigravity IDE**: `repatch-ide.bat` (oder `.\deploy-ide.ps1`)

Unter **macOS** oder **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# oder
bash deploy_linux.sh    # Linux
```

---

### 2. Eigene Modelle hinzufügen und verwalten

In Version 2.31.0 bleibt die Antigravity-Benutzeroberfläche vollständig unberührt. Öffnen Sie das **Modell-Verwaltungs-Modal** jederzeit:

- **Tastenkombination**: **`Ctrl+Alt+M`** (Windows/Linux) oder **`Cmd+Option+M`** (macOS)
- **Infobereich (System Tray)**: Rechtsklick auf das Tray-Icon → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Anwendungsmenü**: **File → Manage Custom Models...**

#### Hauptfunktionen des Modals:
1. **Modell hinzufügen (Add Model)**: Auswahl aus **15 Provider-Vorlagen** (die API-URL wird automatisch ausgefüllt).
2. **Konfiguration**: Modell-ID (z. B. `gpt-4o`, `claude-3-7-sonnet`, `deepseek-chat`), Anzeigename und API-Schlüssel (verschlüsselt mit **AES-256-GCM** via Electron `safeStorage`).
3. **Verbindung testen (Test Connection)**: Sofortige Erreichbarkeits- und Authentifizierungsprüfung vor dem Speichern.
4. **Direktes Bearbeiten & Umbenennen**: Konfiguration anpassen, ohne den verschlüsselten API-Schlüssel erneut eingeben zu müssen.
5. **Echtzeit-Suche**: Schnelles Filtern nach Namen, Modell-ID oder Provider bei mehr als 3 Modellen.
6. **Sicheres Löschen**: Integrierte Bestätigung ohne störende Browser-Popups.
7. **Schlüssel-Wiederherstellung (Batch Fix OpenRouter)**: Nach Neuinstallationen können ungültig gewordene Schlüssel im Stapel re-verschlüsselt werden.
8. **Sofortige Chat-Verfügbarkeit**: Gespeicherte Modelle erscheinen sofort im Modellauswahl-Dropdown des Antigravity-Chats.

---

### 3. Verbindung mit WSL 2 (Windows)

Antigravity v2.31.0 unterstützt WSL 2 nahtlos:
- Wählen Sie **File → Connect to WSL** oder Rechtsklick im Tray → **Connect to WSL** und wählen Sie Ihre Linux-Distribution.
- Der Linux `language_server` wird automatisch geladen, per SHA-256 verifiziert und in `~/.antigravity-server/bin/` installiert.
- Mit **Reopen Locally** kehren Sie jederzeit zur lokalen Windows-Umgebung zurück.

---

## Status der Auto-Switch-Funktion (v2.31.0)

> [!NOTE]
> Um maximale Stabilität und volle manuelle Kontrolle zu gewährleisten, **ist das automatische Chat-Routing (Auto Switch) in v2.31.0 standardmäßig deaktiviert**. Das im Dropdown manuell gewählte Modell wird immer direkt verwendet. Die Routing-Logik und Tests bleiben in `src/autoSwitch/` und `docs/gravity-auto-switch.md` erhalten.

---

## Architektur & Technische Details

```
Antigravity Desktop / IDE
  └── Language Server (Go-Binärdatei)
        └── --api_server_url → http://127.0.0.1:50999 (Lokaler Reverse-Proxy)
                                  ├── Google-Modelle → Google Cloud Code Server
                                  └── Eigene Modelle → Externe APIs (OpenAI, Claude, etc.)
```

### Kompatibilitäts-Updates in v2.31.0
1. **Composite-Window-Architektur (`BaseWindow` + `WebContentsView`)**: Vollständige Unterstützung für 2.31.0 Layer-Rendering (`curtainView` und `hubWcv`).
2. **Multi-Monitor-Fensterstatus (`windowState.ts`)**: Automatische Sicherung von Größe, Position und Zoom-Stufen über mehrere Bildschirme hinweg.
3. **In-App-Browser & Sandbox (`scriptJail` & `webviewBrowser`)**: Reibungsloses Zusammenspiel mit dem integrierten Webview-Browser, Mikrofonberechtigungen (`desktopMic`) und WebAuthn.
4. **Sicheres Favicon-Protokoll (`antigravity-favicon://`)**: Lokales, isoliertes Favicon-Caching.

---

## Unterstützte Provider (Presets)

Sie können **mehrere Modelle verschiedener Anbieter gleichzeitig** registrieren:

| Provider | Format | API-Schlüssel / Variable | Standard-URL |
|---|---|---|---|
| **OpenAI** | `openai` | API-Key (`OPENAI_API_KEY`) | `https://api.openai.com/v1/chat/completions` |
| **Anthropic** | `anthropic` | API-Key (`ANTHROPIC_API_KEY`) | `https://api.anthropic.com/v1/messages` |
| **OpenRouter** | `openrouter` | API-Key | `https://openrouter.ai/api/v1/chat/completions` |
| **Ollama** (Lokal) | `ollama` | *(Nicht erforderlich)* | `http://localhost:11434/v1/chat/completions` |
| **LM Studio** (Lokal) | `lmstudio` | *(Nicht erforderlich)* | `http://localhost:1234/v1/chat/completions` |
| **llama.cpp** (Lokal) | `llamacpp` | *(Optional)* | `http://localhost:8080/v1/chat/completions` |
| **Google AI Studio** | `google` | Gemini API-Key | `https://generativelanguage.googleapis.com/v1beta/models/...` |
| **DeepSeek** | `deepseek` | API-Key | `https://api.deepseek.com/anthropic` |
| **Groq** | `groq` | API-Key | `https://api.groq.com/openai/v1` |
| **Mistral** | `mistral` | API-Key | `https://api.mistral.ai/v1` |
| **Cerebras** | `cerebras` | API-Key | `https://api.cerebras.ai/v1` |
| **Kimi (Moonshot)** | `kimi` | API-Key | `https://api.moonshot.ai/anthropic/v1` |
| **Fireworks AI** | `fireworks` | API-Key | `https://api.fireworks.ai/inference/v1` |
| **NVIDIA NIM** | `nim` | API-Key | `https://integrate.api.nvidia.com/v1` |
| **Custom / Other** | `custom` | Eigener Key | Beliebiger OpenAI- oder Anthropic-Endpunkt |

---

## Häufig gestellte Fragen (FAQ)

### Bleiben meine Modelle nach einem Update erhalten?
**Ja.** Alle Konfigurationen und verschlüsselten Schlüssel werden im Benutzerdatenverzeichnis (`userData`) in `custom_models.json` gespeichert und bleiben bei Updates oder Skript-Ausführungen vollständig erhalten.

### Was passiert bei einem offiziellen Google Antigravity Update?
Führen Sie einfach erneut `repatch-all.bat` aus. In wenigen Sekunden ist die neue Version gepatcht und alle Ihre Modelle stehen wieder zur Verfügung.

### Funktionieren Agent-Tools (Tool Calling / Befehlsausführung)?
**Ja.** Der integrierte Proxy übersetzt Tool-Aufrufe und Terminal-Befehle verlustfrei in beide Richtungen.
