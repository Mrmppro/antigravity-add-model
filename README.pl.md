<div align="center">

# 🌌 Łatka Kompatybilności Własnych Modeli dla Google Antigravity (v2.31.0)

### Podłącz Dowolny Zewnętrzny Model AI do Google Antigravity i Antigravity IDE

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
  <b>Polski</b> ·
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
  <img src="assets/chat_model_dropdown.png" alt="Wybór modelu w Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Zastrzeżenie (Nieoficjalna łatka kompatybilności):** Jest to niezależny projekt open-source, niepowiązany z firmą Google ani przez nią nieautoryzowany. Znaki towarowe „Google” i „Antigravity” zostały użyte wyłącznie w celach informacyjnych.

To repozytorium zawiera zaawansowaną łatkę dla **Google Antigravity (v2.31.0)** oraz **Antigravity IDE (v1.107.0)**, która umożliwia podłączenie zewnętrznych modeli sztucznej inteligencji (OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio i dowolnych endpointów zgodnych z OpenAI) obok natywnych modeli Gemini.

Aplikacja zyskuje bezpieczny lokalny serwer proxy w Electronie, który tłumaczy zapytania, odpowiedzi oraz wywołania narzędzi (Tool Calling) w czasie rzeczywistym, oferuje integrację z WSL 2 pod Windowsem i udostępnia dedykowany panel pod skrótem **`Ctrl+Alt+M`** przy zachowaniu **Zero DOM Pollution** (brak modyfikacji natywnego UI).

---

## ⚡ Główne Cechy

| Cecha | Opis |
|---|---|
| 🪟 **Zgodność z Antigravity 2.31.0** | Obsługa kompozytowej architektury `BaseWindow` + `WebContentsView`, zapamiętywanie geometrii okien (`windowState.ts`) i protokół favicon. |
| 🛡️ **Zero DOM Pollution** | Oryginalny interfejs pozostaje w 100% nienaruszony. Okno zarządzania otwiera się wyłącznie na żądanie. |
| 🔒 **Szyfrowany Magazyn Kluczy** | Klucze API są chronione szyfrowaniem sprzętowym **AES-256-GCM** za pomocą Electron `safeStorage`. |
| 🤖 **Pełne Wsparcie Tool Calling** | Płynne tłumaczenie wywołań funkcji i poleceń terminala dla agentów AI. |
| 🐧 **Natywna Integracja z WSL 2** | Automatyczne pobieranie i weryfikacja sumą kontrolną SHA-256 serwera linuksowego dla dystrybucji WSL 2. |
| 📦 **Ponad 15 Szablonów Dostawców** | Wbudowane konfiguracje dla OpenAI, Claude, OpenRouter, DeepSeek, Ollama i innych. |

---

## Szybki Start (Quick Start — v2.31.0)

### 1. Zastosowanie Łatki

W systemie **Windows** uruchom odpowiedni plik wsadowy (`.bat`):

- **Wersja Standalone oraz IDE**: Uruchom `repatch-all.bat` (lub `.\deploy.ps1`)
- **Tylko Antigravity Standalone**: Uruchom `repatch-antigravity.bat` (lub `.\deploy-antigravity.ps1`)
- **Tylko Antigravity IDE**: Uruchom `repatch-ide.bat` (lub `.\deploy-ide.ps1`)

W systemie **macOS** lub **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# lub
bash deploy_linux.sh    # Linux
```

---

### 2. Zarządzanie Modelami

Otwórz modal w dowolnym momencie za pomocą:
- **Skrót klawiszowy**: **`Ctrl+Alt+M`** (Windows/Linux) lub **`Cmd+Option+M`** (macOS)
- **Zasobnik systemowy**: Kliknij prawym przyciskiem myszy ikonę w trayu → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Menu programu**: **File → Manage Custom Models...**
