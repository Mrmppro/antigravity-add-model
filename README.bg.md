<div align="center">

# 🌌 Пач за Персонализирани AI Модели в Google Antigravity (v2.31.0)

### Свържете Всеки Външен AI Модел с Google Antigravity и Antigravity IDE

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
  <a href="README.ro.md">Română</a> ·
  <b>Български</b>
</p>

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Меню за избор на модел в Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Отказ от отговорност (Неофициален пач):** Това е независим проект с отворен код и няма официална връзка или одобрение от Google. Търговските марки «Google» и «Antigravity» се използват единствено за описване на съвместимостта.

Това хранилище съдържа пълен пач за съвместимост за **Google Antigravity (v2.31.0)** и **Antigravity IDE (v1.107.0)**, който позволява използването на външни AI модели (като OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio и всякакви OpenAI-съвместими API) наред с вградените модели Gemini.

В Electron приложението е вграден сигурен локален HTTP прокси сървър, извършено е обратно инженерство на вътрешния API на Cloud Code (`v1internal`), осигурено е превеждане в реално време на извикванията на инструменти (Tool Calling / Function Calling), добавена е поддръжка за WSL 2 под Windows и самостоятелен прозорец чрез клавишната комбинация **`Ctrl+Alt+M`** без никаква намеса в оригиналния интерфейс (**Zero DOM Pollution**).

---

## ⚡ Основни Предимства

| Възможност | Описание |
|---|---|
| 🪟 **Пълна съвместимост с 2.31.0** | Поддръжка на композитна архитектура `BaseWindow` + `WebContentsView`, запаметяване на позициите на прозорците (`windowState.ts`) и favicons. |
| 🛡️ **Zero DOM Pollution** | Оригиналният интерфейс остава 100% чист. Модалният прозорец се отваря само при повикване. |
| 🔒 **Хардуерно Шифроване с AES-256-GCM** | Всички API ключове се съхраняват надеждно чрез Electron `safeStorage`. |
| 🤖 **Пълна Поддръжка на Tool Calling** | Безпроблемен двупосочен превод на извикванията на функции и терминални команди. |
| 🐧 **Интеграция с Windows WSL 2** | Връзка с Linux WSL 2 дистрибуции под Windows с автоматична проверка на SHA-256 сумата. |
| 📦 **Над 15 Готови Шаблона** | Предварително конфигурирани шаблони за OpenAI, Claude, OpenRouter, DeepSeek, Ollama и др. |

---

## Бърз Старт (Quick Start — v2.31.0)

### 1. Инсталиране на Пача

Под **Windows** стартирайте съответния команден файл (`.bat`):

- **За двете версии (Standalone и IDE)**: Стартирайте `repatch-all.bat` (или `.\deploy.ps1`)
- **Само за Antigravity Standalone**: Стартирайте `repatch-antigravity.bat` (или `.\deploy-antigravity.ps1`)
- **Само за Antigravity IDE**: Стартирайте `repatch-ide.bat` (или `.\deploy-ide.ps1`)

Под **macOS** или **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# или
bash deploy_linux.sh    # Linux
```

---

### 2. Управление на Моделите

Отворете прозореца за управление по всяко време чрез:
- **Клавишна комбинация**: **`Ctrl+Alt+M`** (Windows/Linux) или **`Cmd+Option+M`** (macOS)
- **Системен трей (Tray)**: Десен бутон върху иконата в системната лента → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Главно меню**: **File → Manage Custom Models...**
