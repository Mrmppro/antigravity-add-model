<div align="center">

# 🌌 Patch pentru Modele Personalizate în Google Antigravity (v2.31.0)

### Conectați Orice Model AI Extern la Google Antigravity & Antigravity IDE

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
  <a href="README.it.md">Italiano</a> ·
  <a href="README.el.md">Ελληνικά</a> ·
  <a href="README.ml.md">മലയാളം</a> ·
  <a href="README.roman-urdu.md">Roman Urdu</a> ·
  <b>Română</b> ·
  <a href="README.bg.md">Български</a>
</p>

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Meniu de selecție a modelelor în Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Declinare a responsabilității (Patch neoficial):** Acesta este un proiect independent open-source, neafiliat și nesusținut oficial de Google. Mărcile «Google» și «Antigravity» sunt utilizate exclusiv pentru a descrie compatibilitatea software-ului.

Acest depozit oferă un patch complet de compatibilitate pentru **Google Antigravity (v2.31.0)** și **Antigravity IDE (v1.107.0)**, permițând utilizarea modelelor AI externe (precum OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio și orice endpoint compatibil OpenAI) în paralel cu modelele implicite Gemini.

Aplicația integrează un proxy HTTP local securizat în Electron, realizează inginerie inversă asupra API-ului intern Cloud Code (`v1internal`), convertește fluxurile de apelare a instrumentelor (Tool Calling / Function Calling) în timp real, oferă suport pentru sesiuni la distanță prin WSL 2 pe Windows și o fereastră modală dedicată deschisă prin **`Ctrl+Alt+M`** fără nicio modificare dăunătoare a interfeței originale (**Zero DOM Pollution**).

---

## ⚡ Caracteristici Principale

| Caracteristică | Descriere |
|---|---|
| 🪟 **Compatibilitate Antigravity 2.31.0** | Suport pentru arhitectura `BaseWindow` + `WebContentsView`, salvarea poziției pe mai multe monitoare (`windowState.ts`) și faviconuri izolate. |
| 🛡️ **Zero DOM Pollution** | Interfața nativă rămâne 100% curată. Fereastra de administrare se deschide strict la cerere. |
| 🔒 **Seif Securizat AES-256-GCM** | Cheile API sunt criptate la nivel hardware prin intermediul Electron `safeStorage`. |
| 🤖 **Suport Complet pentru Tool Calling** | Traducere bidirecțională fără erori pentru execuția comenzilor de terminal și modificarea fișierelor. |
| 🐧 **Integrare Nativă cu WSL 2** | Conectare rapidă la distribuțiile Linux WSL 2 pe Windows cu verificare automată SHA-256 a serverului. |
| 📦 **Peste 15 Preseturi de Furnizori** | Configurații gata de utilizare pentru OpenAI, Claude, OpenRouter, DeepSeek, Ollama etc. |

---

## Pornire Rapidă (Quick Start — v2.31.0)

### 1. Aplicarea Patch-ului

Pe **Windows**, rulați fișierul batch (`.bat`) corespunzător:

- **Atât Standalone cât și IDE**: Rulați `repatch-all.bat` (sau `.\deploy.ps1`)
- **Doar Antigravity Standalone**: Rulați `repatch-antigravity.bat` (sau `.\deploy-antigravity.ps1`)
- **Doar Antigravity IDE**: Rulați `repatch-ide.bat` (sau `.\deploy-ide.ps1`)

Pe **macOS** sau **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# sau
bash deploy_linux.sh    # Linux
```

---

### 2. Adăugarea și Gestionarea Modelelor

Deschideți panoul modal oricând prin:
- **Scurtătură tastatură**: **`Ctrl+Alt+M`** (Windows/Linux) sau **`Cmd+Option+M`** (macOS)
- **Zona de notificare (Tray)**: Clic dreapta pe pictograma din bară → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Meniul aplicației**: **File → Manage Custom Models...**
