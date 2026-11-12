<div align="center">

# 🌌 Патч сумісності користувацьких моделей для Google Antigravity (v2.31.0)

### Підключайте будь-які зовнішні моделі ШІ до Google Antigravity та Antigravity IDE

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
  <b>Українська</b> ·
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
  <img src="assets/chat_model_dropdown.png" alt="Меню вибору моделі в Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Відмова від відповідальності (Неофіційний патч):** Цей проект є незалежною розробкою з відкритим вихідним кодом і не пов'язаний з компанією Google. Торговельні марки «Google» та «Antigravity» використовуються виключно для позначення сумісності.

Цей репозиторій містить патч повної сумісності для **Google Antigravity (v2.31.0)** та **Antigravity IDE (v1.107.0)**, який дозволяє підключати сторонні моделі ШІ (OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio та будь-які OpenAI-сумісні API) поряд із вбудованими моделями Gemini.

У додаток Electron вбудовано захищений локальний HTTP-проксі, здійснено реверс-інжиніринг внутрішнього API Cloud Code (`v1internal`), забезпечено трансляцію виклику інструментів (Tool Calling / Function Calling) у реальному часі, додано підтримку WSL 2 у Windows та виклик вікна керування комбінацією **`Ctrl+Alt+M`** без втручання в нативний інтерфейс (**Zero DOM Pollution**).

---

## ⚡ Ключові переваги

| Перевага | Опис |
|---|---|
| 🪟 **Повна готовність до Antigravity 2.31.0** | Підтримка композитної архітектури `BaseWindow` + `WebContentsView`, збереження положення вікон для багатьох моніторів (`windowState.ts`) та фавіконів. |
| 🛡️ **Zero DOM Pollution** | Нативний інтерфейс залишається на 100% чистим. Модальне вікно відкривається виключно на вимогу. |
| 🔒 **Апаратне шифрування ключів** | Ключі API шифруються за стандартом **AES-256-GCM** через Electron `safeStorage`. |
| 🤖 **Повноцінний Tool Calling** | Двостороння безшовна трансляція викликів функцій і команд терміналу для автономних агентів. |
| 🐧 **Нативна підтримка WSL 2** | Зручне підключення до дистрибутивів Linux WSL 2 у Windows з автоматичною перевіркою SHA-256. |
| 📦 **Понад 15 готових пресетів** | Швидке додавання OpenAI, Claude, OpenRouter, DeepSeek, Ollama тощо. |

---

## Швидкий старт (Quick Start — v2.31.0)

### 1. Застосування патча

У **Windows** запустіть відповідний командний файл (`.bat`):

- **Для автономної версії та IDE**: Запустіть `repatch-all.bat` (або `.\deploy.ps1`)
- **Лише для Antigravity Standalone**: Запустіть `repatch-antigravity.bat` (або `.\deploy-antigravity.ps1`)
- **Лише для Antigravity IDE**: Запустіть `repatch-ide.bat` (або `.\deploy-ide.ps1`)

У **macOS** або **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# або
bash deploy_linux.sh    # Linux
```

---

### 2. Керування моделями

Відкрийте вікно додавання та налаштування моделей:
- **Гарячі клавіші**: **`Ctrl+Alt+M`** (Windows/Linux) або **`Cmd+Option+M`** (macOS)
- **Системний трей**: Правий клік по іконці в треї → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Головне меню**: **File → Manage Custom Models...**
