<div align="center">

# 🌌 Патч для подключения сторонних моделей ИИ в Google Antigravity (v2.31.0)

### Подключайте любые внешние модели ИИ к Google Antigravity и Antigravity IDE

[![Google Antigravity](https://img.shields.io/badge/Google_Antigravity-v2.31.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Antigravity IDE](https://img.shields.io/badge/Antigravity_IDE-v1.107.0-34A853?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Tests Passing](https://img.shields.io/badge/Tests-189_Passed-2ea44f?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![WSL 2](https://img.shields.io/badge/WSL_2-Supported-blueviolet?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Security Vault](https://img.shields.io/badge/Security-AES--256--GCM-critical?style=for-the-badge&logo=security&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![UI Clean](https://img.shields.io/badge/UI-Zero_DOM_Pollution-blue?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)

---

#### 🌐 Выберите язык / Choose Your Language / انتخاب زبان / 选择语言 / 言語を選択 / Seleccionar idioma / Choisir la langue

| [🇺🇸 English](README.md) | [🇮🇷 فارسی](README.fa.md) | [🇨🇳 简体中文](README.zh-CN.md) | [🇯🇵 日本語](README.ja.md) |
| :---: | :---: | :---: | :---: |
| [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇷🇺 Русский](README.ru.md) |

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Выбор модели в чате Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Отказ от ответственности (Неофициальный патч):** Это независимый проект с открытым исходным кодом. Он не связан с компанией Google, не поддерживается и не одобрен ею. Товарные знаки «Google» и «Antigravity» используются исключительно для описания совместимости.

Данный репозиторий содержит полный патч совместимости для **Google Antigravity (v2.31.0)** и **Antigravity IDE (v1.107.0)**, позволяющий подключать внешние языковые модели (OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio и любые совместимые с OpenAI API сервисы) наряду со встроенными моделями Gemini.

В приложение Electron встроен локальный защищенный HTTP-прокси, выполнен реверс-инжиниринг внутреннего API Cloud Code (`v1internal`), обеспечена потоковая трансляция запросов, ответов и вызова инструментов (Tool Calling / Function Calling), добавлена поддержка среды WSL 2 в Windows и модальное окно по нажатию **`Ctrl+Alt+M`** без какого-либо вмешательства в интерфейс приложения (**Zero DOM Pollution**).

---

## ⚡ Ключевые преимущества

| Преимущество | Описание |
|---|---|
| 🪟 **Полная поддержка Antigravity 2.31.0** | Совместимость с архитектурой `BaseWindow` + `WebContentsView`, сохранение геометрии окон (`windowState.ts`) и протокол фавиконок. |
| 🛡️ **Zero DOM Pollution** | Нативный интерфейс остается на 100% чистым. Окно настроек не загромождается; модальное окно открывается строго по требованию. |
| 🔒 **Аппаратное шифрование ключей** | API-ключи шифруются по стандарту **AES-256-GCM** через Electron `safeStorage`. |
| 🤖 **Трансляция инструментов (Tool Calling)** | Двусторонняя потоковая передача вызова функций и команд терминала для автономных агентов. |
| 🐧 **Нативная поддержка WSL 2** | Прямое подключение к дистрибутивам Linux WSL 2 в Windows с автоматической верификацией SHA-256. |
| 📦 **15+ Готовых пресетов** | Быстрое добавление OpenAI, Claude, OpenRouter, DeepSeek, Ollama, Groq и других провайдеров. |

---

## Быстрый старт (Quick Start — v2.31.0)

### 1. Установка патча

В **Windows** запустите соответствующий пакетный файл (`.bat`) или выполните скрипт PowerShell:

- **Для автономной версии и IDE**: `repatch-all.bat` (или `.\deploy.ps1`)
- **Только для Antigravity Standalone**: `repatch-antigravity.bat` (или `.\deploy-antigravity.ps1`)
- **Только для Antigravity IDE**: `repatch-ide.bat` (или `.\deploy-ide.ps1`)

В **macOS** или **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# или
bash deploy_linux.sh    # Linux
```

---

### 2. Добавление и управление моделями ИИ

В версии 2.31.0 интерфейс Antigravity остается абсолютно чистым. Окно управления моделями можно открыть в любой момент:

- **Горячие клавиши**: Нажмите **`Ctrl+Alt+M`** (Windows/Linux) или **`Cmd+Option+M`** (macOS)
- **Системный трей**: Правый клик по иконке в трее → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Главное меню**: **File → Manage Custom Models...**

#### Возможности модального окна:
1. **Добавление модели (Add Model)**: **15 готовых пресетов провайдеров** (URL эндпоинта подставляется автоматически).
2. **Параметры**: Укажите идентификатор модели (например, `gpt-4o`, `claude-3-7-sonnet`, `deepseek-chat`), отображаемое имя и API-ключ (шифруется алгоритмом **AES-256-GCM** через Electron `safeStorage`).
3. **Проверка связи (Test Connection)**: Проверка доступности сервера и валидности ключа до сохранения.
4. **Быстрое редактирование**: Изменение настроек без повторного ввода зашифрованного ключа.
5. **Мгновенный поиск**: При наличии более 3 моделей активируется строка фильтрации по имени, ID или провайдеру.
6. **Безопасное удаление**: Подтверждение в один клик без системных диалоговых окон.
7. **Восстановление ключей (Batch Fix OpenRouter)**: Пакетное обновление ключей, если после переустановки программы они перестали расшифровываться.
8. **Готовность к работе в чате**: Добавленные модели сразу появляются в выпадающем списке выбора моделей в чате.

---

### 3. Подключение к WSL 2 (Windows)

Antigravity v2.31.0 содержит встроенную поддержку WSL 2:
- Выберите **File → Connect to WSL** или кликните правой кнопкой мыши по иконке в трее → **Connect to WSL** и укажите дистрибутив Linux.
- Сервер Linux `language_server` будет загружен автоматически, проверен по контрольной сумме SHA-256 и установлен в `~/.antigravity-server/bin/`.
- Вернуться в локальную среду Windows можно в любой момент с помощью **Reopen Locally**.

---

## Статус функции Auto Switch (v2.31.0)

> [!NOTE]
> Для обеспечения максимальной стабильности в Antigravity v2.31.0 **автоматическая маршрутизация моделей (Auto Switch) по умолчанию отключена**. Запросы отправляются напрямую в ту модель, которую вы вручную выбрали в выпадающем списке чата. Код маршрутизатора и тесты сохранены в `src/autoSwitch/` и `docs/gravity-auto-switch.md`.

---

## Архитектура и принцип работы

```
Antigravity Desktop / IDE
  └── Language Server (Скомпилированный бинарный файл Go)
        └── --api_server_url → http://127.0.0.1:50999 (Локальный прокси)
                                  ├── Модели Google → Google Cloud Code
                                  └── Сторонние модели → Внешние API (OpenAI, Claude и др.)
```

### Обновления совместимости v2.31.0
1. **Композитные окна (`BaseWindow` + `WebContentsView`)**: Полная поддержка многослойной архитектуры (`curtainView` и `hubWcv`).
2. **Память состояния для нескольких мониторов (`windowState.ts`)**: Сохранение геометрии окон при закрытии программы и предотвращение выхода за границы экранов.
3. **Встроенный браузер и песочница (`scriptJail` и `webviewBrowser`)**: Совместная работа с браузером webview, разрешениями на микрофон (`desktopMic`) и аутентификацией WebAuthn.
4. **Безопасный протокол фавиконок (`antigravity-favicon://`)**: Изолированное кэширование иконки сайтов.

---

## Поддерживаемые провайдеры (Presets)

Вы можете одновременно настроить **множество моделей от разных провайдеров**:

| Провайдер | Формат | API-ключ / Переменная | URL по умолчанию |
|---|---|---|---|
| **OpenAI** | `openai` | API-ключ (`OPENAI_API_KEY`) | `https://api.openai.com/v1/chat/completions` |
| **Anthropic** | `anthropic` | API-ключ (`ANTHROPIC_API_KEY`) | `https://api.anthropic.com/v1/messages` |
| **OpenRouter** | `openrouter` | API-ключ | `https://openrouter.ai/api/v1/chat/completions` |
| **Ollama** (Локально) | `ollama` | *(Не требуется)* | `http://localhost:11434/v1/chat/completions` |
| **LM Studio** (Локально) | `lmstudio` | *(Не требуется)* | `http://localhost:1234/v1/chat/completions` |
| **llama.cpp** (Локально) | `llamacpp` | *(Опционально)* | `http://localhost:8080/v1/chat/completions` |
| **Google AI Studio** | `google` | Gemini API Key | `https://generativelanguage.googleapis.com/v1beta/models/...` |
| **DeepSeek** | `deepseek` | API-ключ | `https://api.deepseek.com/anthropic` |
| **Groq** | `groq` | API-ключ | `https://api.groq.com/openai/v1` |
| **Mistral** | `mistral` | API-ключ | `https://api.mistral.ai/v1` |
| **Cerebras** | `cerebras` | API-ключ | `https://api.cerebras.ai/v1` |
| **Kimi (Moonshot)** | `kimi` | API-ключ | `https://api.moonshot.ai/anthropic/v1` |
| **Fireworks AI** | `fireworks` | API-ключ | `https://api.fireworks.ai/inference/v1` |
| **NVIDIA NIM** | `nim` | API-ключ | `https://integrate.api.nvidia.com/v1` |
| **Custom / Other** | `custom` | Собственный ключ | Любой эндпоинт, совместимый с OpenAI или Anthropic |

---

## Часто задаваемые вопросы (FAQ)

### Сохранятся ли мои модели при обновлении приложения?
**Да.** Все настройки и зашифрованные ключи хранятся в каталоге пользовательских данных (`userData`) в файле `custom_models.json` и не затрагиваются при повторном наложении патча.

### Что делать при выходе официального обновления Antigravity?
Просто запустите файл `repatch-all.bat` еще раз. Процесс займет несколько секунд, и все ваши модели снова будут готовы к работе.

### Работают ли вызовы инструментов (Tool Calling) и терминал?
**Да.** Прокси транслирует вызовы функций и команд в обе стороны без потерь, обеспечивая полноценную работу агента.
