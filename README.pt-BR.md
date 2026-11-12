<div align="center">

# 🌌 Patch de Modelos Personalizados para o Google Antigravity (v2.31.0)

### Integre Qualquer Modelo de IA Externo no Google Antigravity & Antigravity IDE

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
  <b>Português (Brasil)</b> ·
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
  <img src="assets/chat_model_dropdown.png" alt="Menu de seleção de modelo no Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Aviso Legal (Patch de compatibilidade não oficial):** Este é um projeto de código aberto independente, sem qualquer afiliação, endosso ou vínculo com o Google. As marcas "Google" e "Antigravity" são utilizadas apenas para indicar compatibilidade.

Este repositório fornece um patch completo para o **Google Antigravity (v2.31.0)** e o **Antigravity IDE (v1.107.0)**, permitindo utilizar modelos de IA externos (como OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio e qualquer endpoint compatível com OpenAI) lado a lado com os modelos Gemini nativos.

Com um proxy HTTP local seguro integrado ao Electron, engenharia reversa da API interna do Cloud Code (`v1internal`), tradução em tempo real de chamadas de ferramentas (Tool Calling / Function Calling), suporte a sessões remotas via WSL 2 no Windows e um modal dedicado acionado por **`Ctrl+Alt+M`**, a interface original permanece 100% preservada (**Zero DOM Pollution**).

---

## ⚡ Destaques

| Recurso | Descrição |
|---|---|
| 🪟 **Pronto para Antigravity 2.31.0** | Compatível com a arquitetura `BaseWindow` + `WebContentsView`, persistência multimonitor (`windowState.ts`) e protocolo seguro de favicons. |
| 🛡️ **Zero DOM Pollution** | A interface nativa não é alterada. O painel de modelos só é renderizado quando chamado sob demanda. |
| 🔒 **Cofre Seguro com AES-256-GCM** | As chaves de API são armazenadas com criptografia de nível de hardware pelo Electron `safeStorage`. |
| 🤖 **Suporte a Chamadas de Ferramentas** | Tradução bidirecional fluida para comandos de terminal e edição de arquivos por agentes de IA. |
| 🐧 **Integração com WSL 2 no Windows** | Conexão fácil com distribuições Linux do WSL 2 com verificação SHA-256 do servidor. |
| 📦 **Mais de 15 Modelos Pré-configurados** | Presets prontos para OpenAI, Claude, OpenRouter, DeepSeek, Ollama, Groq e outros. |

---

## Início Rápido (Quick Start — v2.31.0)

### 1. Aplicando o Patch

No **Windows**, execute o script em lote (`.bat`) correspondente:

- **Tanto Antigravity Standalone quanto IDE**: Execute `repatch-all.bat` (ou `.\deploy.ps1`)
- **Apenas Antigravity Standalone**: Execute `repatch-antigravity.bat` (ou `.\deploy-antigravity.ps1`)
- **Apenas Antigravity IDE**: Execute `repatch-ide.bat` (ou `.\deploy-ide.ps1`)

No **macOS** ou **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# ou
bash deploy_linux.sh    # Linux
```

---

### 2. Adicionando e Gerenciando Modelos

Abra o modal de gerenciamento a qualquer momento:
- **Atalho de teclado**: **`Ctrl+Alt+M`** (Windows/Linux) ou **`Cmd+Option+M`** (macOS)
- **Bandeja do sistema**: Clique com o botão direito no ícone da bandeja → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Menu da aplicação**: **File → Manage Custom Models...**
