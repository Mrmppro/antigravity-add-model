<div align="center">

# 🌌 Parche de Modelos Personalizados para Google Antigravity (v2.31.0)

### Conecte Cualquier Modelo Externo de IA a Google Antigravity y Antigravity IDE

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
  <b>Español</b> ·
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
  <img src="assets/chat_model_dropdown.png" alt="Selector de modelos de Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Descargo de responsabilidad (Parche no oficial):** Este es un proyecto independiente y de código abierto sin afiliación, patrocinio ni respaldo por parte de Google. Las marcas "Google" y "Antigravity" se utilizan únicamente con fines descriptivos de compatibilidad; todos los derechos pertenecen a sus respectivos propietarios.

Este repositorio contiene un parche de compatibilidad total para **Google Antigravity (v2.31.0)** y **Antigravity IDE (v1.107.0)** que permite integrar modelos externos de IA (como OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio y cualquier endpoint compatible con la API de OpenAI) junto a los modelos Gemini nativos.

El parche integra un proxy HTTP local seguro en Electron, realiza ingeniería inversa de la API interna de Cloud Code (`v1internal`), traduce en tiempo real las peticiones, respuestas y llamadas a herramientas (Tool Calling / Function Calling), soporta sesiones remotas con WSL 2 en Windows, y añade un modal desacoplado accesible con **`Ctrl+Alt+M`** sin alterar la interfaz original (**Zero DOM Pollution**).

---

## ⚡ Características Principales

| Característica | Descripción |
|---|---|
| 🪟 **Listo para Antigravity 2.31.0** | Compatible con la arquitectura `BaseWindow` + `WebContentsView`, memoria multipantalla (`windowState.ts`) y esquema de favicons. |
| 🛡️ **Zero DOM Pollution** | La interfaz nativa se conserva 100% limpia sin modificar el DOM de Ajustes. El modal de gestión se abre bajo demanda. |
| 🔒 **Cifrado Seguro de Claves** | Almacenamiento seguro de credenciales con **AES-256-GCM** mediante Electron `safeStorage`. |
| 🤖 **Soporte Completo de Herramientas** | Traducción bidireccional de llamadas a funciones y comandos de terminal para flujos de trabajo de agentes. |
| 🐧 **Integración Nativa con WSL 2** | Conexión fluida con distribuciones Linux de WSL 2 en Windows con aprovisionamiento verificado por SHA-256. |
| 📦 **Más de 15 Preajustes** | OpenAI, Claude, OpenRouter, DeepSeek, Ollama, Groq, Mistral y más preconfigurados. |

---

## Inicio Rápido (Quick Start — v2.31.0)

### 1. Aplicar el parche

En **Windows**, ejecute el script por lotes (`.bat`) según su instalación (o use los scripts de PowerShell):

- **Tanto Antigravity Standalone como IDE**: Ejecute `repatch-all.bat` (o `.\deploy.ps1`)
- **Solo Antigravity Standalone**: Ejecute `repatch-antigravity.bat` (o `.\deploy-antigravity.ps1`)
- **Solo Antigravity IDE**: Ejecute `repatch-ide.bat` (o `.\deploy-ide.ps1`)

En **macOS** o **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# o
bash deploy_linux.sh    # Linux
```

---

### 2. Añadir y Gestionar Modelos de IA

En la versión 2.31.0, la interfaz nativa permanece 100% limpia. Puede abrir el panel de **Modelos Personalizados** en cualquier momento:

- **Atajo de teclado**: Presione **`Ctrl+Alt+M`** (Windows/Linux) o **`Cmd+Option+M`** (macOS)
- **Bandeja del sistema (Tray)**: Clic derecho en el icono de la barra de tareas → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Menú de la aplicación**: **File → Manage Custom Models...**

#### Funcionalidades del modal:
1. **Añadir Modelo (Add Model)**: Elija entre **15 preajustes de proveedores** (la URL de la API se autocompleta).
2. **Configuración de credenciales**: Indique el ID del modelo (ej. `gpt-4o`, `claude-3-7-sonnet`, `deepseek-chat`), nombre para mostrar y clave API (cifrada con **AES-256-GCM** mediante Electron `safeStorage`).
3. **Probar Conexión (Test Connection)**: Verifique la conectividad y validez de la clave en tiempo real antes de guardar.
4. **Edición y cambio de nombre in-situ**: Modifique configuraciones sin necesidad de reescribir su clave cifrada.
5. **Búsqueda dinámica**: Al tener más de 3 modelos, se activa un buscador para filtrar por nombre o proveedor.
6. **Eliminación segura**: Confirmación integrada sin cuadros de diálogo intrusivos del navegador.
7. **Recuperación de claves (Batch Fix OpenRouter)**: Si reinstaló la aplicación y las claves no pueden descifrarse, un banner permite reencriptarlas en un solo paso.
8. **Disponibilidad inmediata en el chat**: Los modelos guardados aparecen al instante en el desplegable de selección de modelos.

---

### 3. Conexión con WSL 2 (Windows)

Antigravity v2.31.0 incluye integración nativa con WSL 2 en Windows:
- Seleccione **File → Connect to WSL** o clic derecho en el icono del Tray → **Connect to WSL** y elija su distribución de Linux.
- El sistema descargará y verificará con SHA-256 el binario `language_server` de Linux en `~/.antigravity-server/bin/`.
- Regrese al entorno local de Windows en cualquier momento haciendo clic en **Reopen Locally**.

---

## Estado de la Función Auto Switch (v2.31.0)

> [!NOTE]
> Para garantizar la máxima estabilidad y control en Antigravity v2.31.0, **el enrutamiento automático de modelos (Auto Switch) está deshabilitado por defecto**. El modelo seleccionado manualmente en el menú desplegable del chat siempre responderá directamente. El enrutador y sus pruebas unitarias se mantienen en `src/autoSwitch/` y `docs/gravity-auto-switch.md`.

---

## Arquitectura Técnica

```
Antigravity Desktop / IDE
  └── Language Server (Binario compilado en Go)
        └── --api_server_url → http://127.0.0.1:50999 (Proxy local seguro)
                                  ├── Modelos de Google → Google Cloud Code
                                  └── Modelos externos → Proveedores externos (OpenAI, Claude, etc.)
```

### Novedades de compatibilidad v2.31.0
1. **Arquitectura de ventanas compuestas (`BaseWindow` + `WebContentsView`)**: Compatible con el nuevo renderizado en capas (`curtainView` y `hubWcv`).
2. **Persistencia multipantalla (`windowState.ts`)**: Guarda la posición, resolución y escala entre monitores para evitar ventanas fuera de rango.
3. **Navegador interno y sandbox (`scriptJail` y `webviewBrowser`)**: Convivencia transparente con el navegador interno, permisos de micrófono de escritorio (`desktopMic`) y autenticación WebAuthn.
4. **Protocolo seguro de favicons (`antigravity-favicon://`)**: Implementación del esquema de almacenamiento en caché de iconos.

---

## Proveedores Soportados (Presets)

Puede configurar **múltiples modelos de diferentes proveedores de forma simultánea**:

| Proveedor | Formato | Clave de autenticación / Variable | URL de API por defecto |
|---|---|---|---|
| **OpenAI** | `openai` | API Key (`OPENAI_API_KEY`) | `https://api.openai.com/v1/chat/completions` |
| **Anthropic** | `anthropic` | API Key (`ANTHROPIC_API_KEY`) | `https://api.anthropic.com/v1/messages` |
| **OpenRouter** | `openrouter` | API Key | `https://openrouter.ai/api/v1/chat/completions` |
| **Ollama** (Local) | `ollama` | *(No requerida)* | `http://localhost:11434/v1/chat/completions` |
| **LM Studio** (Local) | `lmstudio` | *(No requerida)* | `http://localhost:1234/v1/chat/completions` |
| **llama.cpp** (Local) | `llamacpp` | *(Opcional)* | `http://localhost:8080/v1/chat/completions` |
| **Google AI Studio** | `google` | Clave API de Gemini | `https://generativelanguage.googleapis.com/v1beta/models/...` |
| **DeepSeek** | `deepseek` | API Key | `https://api.deepseek.com/anthropic` |
| **Groq** | `groq` | API Key | `https://api.groq.com/openai/v1` |
| **Mistral** | `mistral` | API Key | `https://api.mistral.ai/v1` |
| **Cerebras** | `cerebras` | API Key | `https://api.cerebras.ai/v1` |
| **Kimi (Moonshot)** | `kimi` | API Key | `https://api.moonshot.ai/anthropic/v1` |
| **Fireworks AI** | `fireworks` | API Key | `https://api.fireworks.ai/inference/v1` |
| **NVIDIA NIM** | `nim` | API Key | `https://integrate.api.nvidia.com/v1` |
| **Custom / Other** | `custom` | Clave propia | Endpoint compatible con OpenAI o Anthropic |

---

## Preguntas Frecuentes (FAQ)

### ¿Se conservan mis modelos al actualizar la aplicación?
**Sí.** Las configuraciones y claves cifradas se guardan en el directorio de datos de usuario de Electron (`userData`) en `custom_models.json`, por lo que no se borran al reaplicar parches o reinstalar.

### ¿Qué hacer cuando Google lance una nueva actualización oficial?
Simplemente vuelva a ejecutar `repatch-all.bat` (o el script correspondiente). El proceso tomará solo unos segundos y sus modelos seguirán funcionando de inmediato.

### ¿Se admiten llamadas a herramientas (Tool Calling) y comandos de terminal?
**Sí.** El proxy traduce las definiciones y ejecuciones de herramientas (ej. ejecutar comandos de consola, leer y modificar archivos) al formato esperado por el modelo destino de manera bidireccional.
