<div align="center">

# 🌌 Patch per Modelli Personalizzati per Google Antigravity (v2.31.0)

### Connetti Qualsiasi Modello AI Esterno a Google Antigravity & Antigravity IDE

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
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.uk.md">Українська</a> ·
  <a href="README.pl.md">Polski</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.ar.md">العربية</a> ·
  <a href="README.fa.md">فارسی</a> ·
  <a href="README.id.md">Bahasa Indonesia</a> ·
  <b>Italiano</b> ·
  <a href="README.el.md">Ελληνικά</a> ·
  <a href="README.ml.md">മലയാളം</a> ·
  <a href="README.roman-urdu.md">Roman Urdu</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.bg.md">Български</a>
</p>

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Menu di selezione dei modelli in Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Dichiarazione di non responsabilità (Patch non ufficiale):** Questo è un progetto open source indipendente senza alcuna affiliazione o approvazione ufficiale da parte di Google. I marchi "Google" e "Antigravity" sono utilizzati esclusivamente a scopo descrittivo.

Questo repository fornisce una patch di compatibilità completa per **Google Antigravity (v2.31.0)** e **Antigravity IDE (v1.107.0)** che permette di utilizzare modelli di intelligenza artificiale esterni (come OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio e qualsiasi endpoint compatibile OpenAI) affiancati ai modelli Gemini nativi.

Integra un proxy HTTP locale sicuro in Electron, esegue il reverse engineering dell'API interna di Cloud Code (`v1internal`), converte le chiamate degli strumenti (Tool Calling / Function Calling) in tempo reale, supporta sessioni remote WSL 2 su Windows e offre un pannello modale richiamabile con **`Ctrl+Alt+M`** senza alterare l'interfaccia originale (**Zero DOM Pollution**).

---

## ⚡ Caratteristiche Principali

| Funzionalità | Descrizione |
|---|---|
| 🪟 **Pronto per Antigravity 2.31.0** | Supporta la nuova architettura `BaseWindow` + `WebContentsView`, la persistenza multimonitor (`windowState.ts`) e il protocollo favicon. |
| 🛡️ **Zero DOM Pollution** | L'interfaccia utente nativa rimane pura al 100%. Il pannello modale viene visualizzato solo su richiesta. |
| 🔒 **Cassaforte Chiavi con AES-256-GCM** | Tutte le chiavi API sono crittografate a livello hardware tramite Electron `safeStorage`. |
| 🤖 **Supporto Completo Tool Calling** | Traduzione bidirezionale fluida di chiamate di funzione ed esecuzione di comandi terminale per agenti AI. |
| 🐧 **Integrazione Nativa con WSL 2** | Connessione immediata alle distribuzioni Linux WSL 2 su Windows con verifica SHA-256 del server. |
| 📦 **Oltre 15 Preset Disponibili** | Preset pronti per OpenAI, Claude, OpenRouter, DeepSeek, Ollama, Groq e altri. |

---

## Guida Rapida (Quick Start — v2.31.0)

### 1. Applicazione della Patch

Su **Windows**, esegui il file batch (`.bat`) corrispondente:

- **Sia Standalone che IDE**: Esegui `repatch-all.bat` (oppure `.\deploy.ps1`)
- **Solo Antigravity Standalone**: Esegui `repatch-antigravity.bat` (oppure `.\deploy-antigravity.ps1`)
- **Solo Antigravity IDE**: Esegui `repatch-ide.bat` (oppure `.\deploy-ide.ps1`)

Su **macOS** o **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# o
bash deploy_linux.sh    # Linux
```

---

### 2. Gestione dei Modelli

Apri il pannello modale in qualsiasi momento:
- **Scorciatoia da tastiera**: **`Ctrl+Alt+M`** (Windows/Linux) o **`Cmd+Option+M`** (macOS)
- **Barra delle applicazioni (Tray)**: Clic destro sull'icona nella barra di sistema → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Menu dell'applicazione**: **File → Manage Custom Models...**
