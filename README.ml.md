<div align="center">

# 🌌 Google Antigravity കസ്റ്റം മോഡൽ പാച്ച് (v2.31.0)

### ഏത് ബാഹ്യ AI മോഡലും Google Antigravity & Antigravity IDE-ലേക്ക് എളുപ്പത്തിൽ ബന്ധിപ്പിക്കുക

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
  <b>മലയാളം</b> ·
  <a href="README.roman-urdu.md">Roman Urdu</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.bg.md">Български</a>
</p>

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Antigravity മോഡൽ തിരഞ്ഞെടുക്കൽ മെനു" width="80%">
</p>

</div>

> [!NOTE]
> **നിരാകരണം (അനൗദ്യോഗിക പാച്ച്):** ഇതൊരു സ്വതന്ത്ര ഓപ്പൺ സോഴ്സ് പ്രോജക്റ്റാണ്. Google-മായി യാതൊരു തരത്തിലുള്ള ഔദ്യോഗിക ബന്ധവുമില്ല. "Google", "Antigravity" വ്യാപാരമുദ്രകൾ ഉൽപ്പന്ന അനുയോജ്യത വ്യക്തമാക്കാൻ മാത്രമാണ് ഉപയോഗിക്കുന്നത്.

ഈ റിപ്പോസിറ്ററി **Google Antigravity (v2.31.0)**, **Antigravity IDE (v1.107.0)** എന്നിവയിലേക്ക് ബാഹ്യ AI മോഡലുകളെ (OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio എന്നിവയും OpenAI നിലവാരമുള്ള ഏത് API-കളും) ബന്ധിപ്പിക്കാൻ സഹായിക്കുന്ന സമ്പൂർണ്ണ പാച്ചാണ്.

ഇലക്ട്രോൺ ആപ്പിൽ സുരക്ഷിതമായ ഒരു ലോക്കൽ HTTP പ്രോക്സി ഉൾപ്പെടുത്തിയിരിക്കുന്നു. ഇത് ക്ലൗഡ് കോഡ് ആന്തരിക API (`v1internal`) വഴി ടൂൾ കോളിംഗും (Tool Calling) ഡാറ്റയും തത്സമയം വിവർത്തനം ചെയ്യുന്നു. വിൻഡോസ് WSL 2 പിന്തുണയും **`Ctrl+Alt+M`** വഴി തുറക്കാവുന്ന കസ്റ്റം മോഡലും നൽകുന്നു (**Zero DOM Pollution**).

---

## ⚡ പ്രധാന സവിശേഷതകൾ

| സവിശേഷത | വിവരണം |
|---|---|
| 🪟 **Antigravity 2.31.0 പൂർണ്ണ അനുയോജ്യത** | `BaseWindow` + `WebContentsView` ആർക്കിടെക്ചർ, മൾട്ടി-മോണിറ്റർ വിൻഡോ സേവിംഗ് (`windowState.ts`), ഫാവിക്കോൺ പ്രോട്ടോക്കോൾ പൂർണ്ണ പിന്തുണ. |
| 🛡️ **Zero DOM Pollution** | ആപ്പിന്റെ പ്രധാന ഇന്റർഫേസിൽ യാതൊരു മാറ്റവും വരുത്തുന്നില്ല. ആവശ്യപ്പെടുമ്പോൾ മാത്രം മോഡൽ മാനേജ്‌മെന്റ് പാനൽ തുറക്കുന്നു. |
| 🔒 **AES-256-GCM എൻക്രിപ്ഷൻ** | എല്ലാ API കീകളും Electron `safeStorage` വഴി ഹാർഡ്‌വെയർ തലത്തിൽ സുരക്ഷിതമായി എൻക്രിപ്റ്റ് ചെയ്യുന്നു. |
| 🤖 **പൂർണ്ണ ടൂൾ കോളിംഗ് പിന്തുണ** | ടെർമിനൽ കമാൻഡുകളും ഫയൽ മാറ്റങ്ങളും നടപ്പിലാക്കാൻ സഹായിക്കുന്ന തത്സമയ ടൂൾ ട്രാൻസ്ലേഷൻ. |
| 🐧 **Windows WSL 2 ഇന്റഗ്രേഷൻ** | ലിനക്സ് സെർവർ യാന്ത്രികമായി ഡൗൺലോഡ് ചെയ്ത് SHA-256 പരിശോധിച്ച് WSL 2-ലേക്ക് നേരിട്ട് ബന്ധിപ്പിക്കുന്നു. |
| 📦 **15+ പ്രൊവൈഡർ പ്രീസെറ്റുകൾ** | OpenAI, Claude, OpenRouter, DeepSeek, Ollama എന്നിവയ്ക്കായുള്ള റെഡിമെയ്ഡ് ടെംപ്ലേറ്റുകൾ. |

---

## ദ്രുത തുടക്കം (Quick Start — v2.31.0)

### 1. പാച്ച് ഇൻസ്റ്റാൾ ചെയ്യൽ

**Windows**-ൽ നിങ്ങളുടെ പ്രോഗ്രാമിന് അനുയോജ്യമായ ബാച്ച് ഫയൽ റൺ ചെയ്യുക:

- **Standalone & IDE രണ്ടിനും**: `repatch-all.bat` റൺ ചെയ്യുക (അല്ലെങ്കിൽ `.\deploy.ps1`)
- **Antigravity Standalone-ന് മാത്രം**: `repatch-antigravity.bat` റൺ ചെയ്യുക (അല്ലെങ്കിൽ `.\deploy-antigravity.ps1`)
- **Antigravity IDE-ക്ക് മാത്രം**: `repatch-ide.bat` റൺ ചെയ്യുക (അല്ലെങ്കിൽ `.\deploy-ide.ps1`)

**macOS** അല്ലെങ്കിൽ **Linux**-ൽ:
```bash
npm run build
bash deploy.sh          # macOS
# അല്ലെങ്കിൽ
bash deploy_linux.sh    # Linux
```

---

### 2. മോഡലുകൾ ചേർക്കലും നിയന്ത്രിക്കലും

ഏത് സമയത്തും മോഡൽ പാനൽ തുറക്കാൻ:
- **കീബോർഡ് ഷോർട്ട്കട്ട്**: **`Ctrl+Alt+M`** (Windows/Linux) അല്ലെങ്കിൽ **`Cmd+Option+M`** (macOS)
- **സിസ്റ്റം ട്രേ**: ടാസ്ക്ബാർ ഐക്കണിൽ റൈറ്റ് ക്ലിക്ക് ചെയ്യുക → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **പ്രോഗ്രാം മെനു**: **File → Manage Custom Models...**
