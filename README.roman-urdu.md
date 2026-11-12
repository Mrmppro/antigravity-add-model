<div align="center">

# 🌌 Google Antigravity Custom Model Compatibility Patch (v2.31.0)

### Google Antigravity aur Antigravity IDE mein Koi Bhi External AI Model Chalayein

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
  <b>Roman Urdu</b> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.bg.md">Български</a>
</p>

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Antigravity Chat Model Dropdown" width="80%">
</p>

</div>

> [!NOTE]
> **Wazahat (Ghair-Sarkari Patch):** Yeh ek azaad open-source project hai aur iska Google se koi rasmi taaluq ya sponsorship nahi hai. "Google" aur "Antigravity" ke naam sirf compatibility batane ke liye istemaal kiye gaye hain.

Yeh repository **Google Antigravity (v2.31.0)** aur **Antigravity IDE (v1.107.0)** ke liye ek mukammal patch faraham karti hai jis ke zariye aap built-in Gemini models ke sath sath koi bhi external AI model (jaise OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio aur tamam OpenAI-compatible APIs) asaani se chala sakte hain.

Is mein Electron ke andar ek mehfooz local HTTP proxy lagaya gaya hai jo Cloud Code internal API (`v1internal`) ko handle karta hai, Tool Calling aur requests ko real-time translate karta hai, Windows WSL 2 ko support karta hai aur **`Ctrl+Alt+M`** shortcut se ek clean modal kholta hai baghair kisi UI kharabi ke (**Zero DOM Pollution**).

---

## ⚡ Khaas Khusosiyat

| Feature | Tafseel |
|---|---|
| 🪟 **Antigravity 2.31.0 Ready** | 2.31.0 ke composite `BaseWindow` + `WebContentsView` architecture, multi-monitor window memory (`windowState.ts`) aur favicon protocol se mukammal hum-aahang. |
| 🛡️ **Zero DOM Pollution** | Asli UI 100% clean rehti hai, Settings mein koi fazool code inject nahi hota. Modal sirf zaroorat par khulta hai. |
| 🔒 **AES-256-GCM Key Vault** | Tamam API keys Electron `safeStorage` ke zariye hardware-level par mehfooz tareeqe se encrypt hoti hain. |
| 🤖 **Behtareen Tool Calling** | Claude, OpenAI aur DeepSeek ke terminal commands aur file editing tools ka be-daagh do-tarfa translation. |
| 🐧 **Windows WSL 2 Support** | Windows par WSL 2 Linux distributions se foran rabta aur SHA-256 verified Linux server download. |
| 📦 **15+ Provider Presets** | OpenAI, Claude, OpenRouter, DeepSeek, Ollama waghaira ke ready-made templates. |

---

## Jaldi Shuru Karein (Quick Start — v2.31.0)

### 1. Patch Lagayein

**Windows** par mutaliqa batch file (`.bat`) par double click karein:

- **Standalone aur IDE Dono ke Liye**: `repatch-all.bat` chalayein (ya `.\deploy.ps1`)
- **Sirf Antigravity Standalone**: `repatch-antigravity.bat` chalayein (ya `.\deploy-antigravity.ps1`)
- **Sirf Antigravity IDE**: `repatch-ide.bat` chalayein (ya `.\deploy-ide.ps1`)

**macOS** ya **Linux** par:
```bash
npm run build
bash deploy.sh          # macOS
# ya
bash deploy_linux.sh    # Linux
```

---

### 2. Custom Models Add aur Manage Karein

Kisi bhi waqt management panel kholein:
- **Keyboard Shortcut**: **`Ctrl+Alt+M`** (Windows/Linux) ya **`Cmd+Option+M`** (macOS)
- **System Tray**: Taskbar icon par right click karein → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **App Menu**: **File → Manage Custom Models...**
