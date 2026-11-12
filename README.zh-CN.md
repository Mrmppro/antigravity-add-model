<div align="center">

# 🌌 Google Antigravity 自定义模型扩展补丁 (v2.31.0)

### 为 Google Antigravity & Antigravity IDE 接入任意外部大语言模型

[![Google Antigravity](https://img.shields.io/badge/Google_Antigravity-v2.31.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Antigravity IDE](https://img.shields.io/badge/Antigravity_IDE-v1.107.0-34A853?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Tests Passing](https://img.shields.io/badge/Tests-189_Passed-2ea44f?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![WSL 2](https://img.shields.io/badge/WSL_2-Supported-blueviolet?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Security Vault](https://img.shields.io/badge/Security-AES--256--GCM-critical?style=for-the-badge&logo=security&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![UI Clean](https://img.shields.io/badge/UI-Zero_DOM_Pollution-blue?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)

---

#### 🌐 选择语言 / Choose Your Language / انتخاب زبان / 言語を選択 / Seleccionar idioma / Choisir la langue

| [🇺🇸 English](README.md) | [🇮🇷 فارسی](README.fa.md) | [🇨🇳 简体中文](README.zh-CN.md) | [🇯🇵 日本語](README.ja.md) |
| :---: | :---: | :---: | :---: |
| [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇷🇺 Русский](README.ru.md) |

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Antigravity 自定义模型选择菜单" width="80%">
</p>

</div>

> [!NOTE]
> **免责声明（非官方兼容性补丁）：** 本项目为独立的开源兼容性工具，与 Google 没有任何隶属、认可或支持关系。“Google”和“Antigravity”商标仅用于指代所兼容的软件产品，所有商标及权利归各自所有者所有。

本项目为 **Google Antigravity (v2.31.0)** 和 **Antigravity IDE (v1.107.0)** 提供了完整的自定义大语言模型扩展补丁。允许您在原生 Gemini 模型之外，无缝接入各类外部 AI 模型（如 OpenAI GPT-4o / o1 / o3、Anthropic Claude 3.5 / 3.7 Sonnet、DeepSeek R1 / V3、OpenRouter、Groq、Mistral、Cerebras、Kimi 月之暗面、Fireworks AI、Ollama、LM Studio、llama.cpp、NVIDIA NIM、Google AI Studio 以及任何兼容 OpenAI 接口规范的服务端点）。

通过在 Electron 应用程序中内置轻量级本地安全 HTTP 代理，逆向 Cloud Code 内部 API（`v1internal`），实现多厂商请求/响应格式与工具调用（Tool Calling / Function Calling）的实时转换，支持 Windows 下的 WSL 2 远程开发环境，并通过 **`Ctrl+Alt+M`** 快捷键唤起独立模态框，实现真正的**零 DOM 污染**（Zero DOM Pollution）。

---

## ⚡ 核心亮点

| 特性 | 说明 |
|---|---|
| 🪟 **完美兼容 Antigravity 2.31.0** | 全面适配 2.31.0 复合 `BaseWindow` + `WebContentsView` 架构、多显示器位置持久化（`windowState.ts`）与 Favicon 协议。 |
| 🛡️ **真正的零 DOM 污染** | 原生界面 100% 纯净，不在 Settings 中注入不稳定 DOM 元素，管理面板按需即调即用。 |
| 🔒 **高安全性硬件加密** | 所有 API 凭据均通过 Electron `safeStorage` 的 **AES-256-GCM** 算法加密保存在本地。 |
| 🤖 **无缝 Agent 工具调用** | 完整支持 DeepSeek、Claude、OpenAI 的 Function Calling 和命令行执行双向实时转换。 |
| 🐧 **原生支持 Windows WSL 2** | 一键连接 WSL 2 并在远端自动化部署 SHA-256 校验的 Linux 服务端。 |
| 📦 **15+ 主流厂商预设** | 涵盖 OpenAI、Anthropic、OpenRouter、DeepSeek、Ollama 等，选择即可自动配置 URL。 |

---

## 快速上手（Quick Start — v2.31.0）

### 1. 部署补丁

在 **Windows** 上，直接双击运行对应的批处理文件（或通过 PowerShell 脚本）：

- **同时支持独立版与 IDE 版**：双击运行 `repatch-all.bat`（或执行 `.\deploy.ps1`）
- **仅独立版 Antigravity**：双击运行 `repatch-antigravity.bat`（或执行 `.\deploy-antigravity.ps1`）
- **仅 Antigravity IDE**：双击运行 `repatch-ide.bat`（或执行 `.\deploy-ide.ps1`）

在 **macOS** 或 **Linux** 系统：
```bash
npm run build
bash deploy.sh          # macOS
# 或
bash deploy_linux.sh    # Linux
```

---

### 2. 添加与管理自定义模型

在 v2.31.0 中，Antigravity 原生界面保持 100% 纯净（无任何 DOM 注入）。您可以随时随地调出**自定义 AI 模型管理面板**：

- **快捷键**：按下 **`Ctrl+Alt+M`**（Windows/Linux）或 **`Cmd+Option+M`**（macOS）
- **系统托盘**：右键点击任务栏右下角托盘图标 → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **应用主菜单**：点击顶部菜单 **File → Manage Custom Models...**

#### 面板主要功能：
1. **添加模型（Add Model）**：内置 **15 种提供商预设**（选择后自动填充 API URL 端点）。
2. **模型参数配置**：填写提供商对应的模型 ID（如 `gpt-4o`、`claude-3-7-sonnet`、`deepseek-chat`）、自定义显示名称，以及 API Key（采用 Electron `safeStorage` 的 **AES-256-GCM** 加密存储）。
3. **连接测试（Test Connection）**：保存前一键探测端点连通性及秘钥有效性。
4. **就地编辑与重命名**：无需重新输入已保存的加密秘钥。
5. **实时搜索**：当配置超过 3 个模型时自动展示搜索框，支持按名称、ID 或提供商快速过滤。
6. **安全就地删除**：内嵌确认按钮，无需阻塞式弹窗。
7. **秘钥一键恢复（Batch Fix OpenRouter）**：当重装系统或软件导致既有加密秘钥失效时，顶部提示横幅支持一键批量重置。
8. **聊天界面即刻调用**：添加成功的模型会立即同步至 Antigravity 聊天框底部的模型切换下拉列表中。

---

### 3. 连接至 WSL 2 环境（Windows）

Antigravity v2.31.0 完美整合了 Windows WSL 2 开发环境：
- 点击 **File → Connect to WSL** 或在系统托盘右键选择 **Connect to WSL** 并挑选 Linux 发行版（如 Ubuntu）。
- 脚本将自动下载对应版本的 Linux `language_server`、执行 SHA-256 完整性校验，并部署至 `~/.antigravity-server/bin/`。
- 可随时通过 **Reopen Locally** 无缝切回 Windows 本地环境。

---

## 关于 Auto Switch 路由功能状态（v2.31.0）

> [!NOTE]
> 为确保 Antigravity v2.31.0 原生界面的绝对稳定与操作透明度，**自动模型路由分流（Auto Switch）在 v2.31.0 中默认处于禁用状态**。聊天界面中始终严格遵从您在下拉菜单中手动选定的模型。相关路由算法、验证器及单元测试仍保留在 `src/autoSwitch/` 目录与 `docs/gravity-auto-switch.md` 中供参考。

---

## 核心架构与工作原理

```
Antigravity Desktop / IDE
  └── Language Server (Go 编译二进制程序)
        └── --api_server_url → http://127.0.0.1:50999 (本地安全反向代理)
                                  ├── Google 官方模型 → 直连 Google Cloud Code
                                  └── 自定义外部模型 → 转发至第三方接口 (OpenAI, Anthropic 等)
```

### v2.31.0 架构特性与兼容性更新
1. **复合视口架构（`BaseWindow` + `WebContentsView`）**：适配了 2.31.0 新增的 `curtainView` 与 `hubWcv` 视口层叠结构，保证窗口管理与 IPC 调度稳定。
2. **多显示器窗口状态记忆（`windowState.ts`）**：自动记录各显示器中的窗口尺寸与位置，防止跨屏崩溃与窗口越界。
3. **内置浏览器与沙箱环境（`scriptJail` & `webviewBrowser`）**：全面兼容 2.31.0 新增的内置浏览器、隔离沙箱、桌面麦克风权限（`desktopMic`）及 WebAuthn / caBLEv2 认证机制。
4. **网站图标安全协议（`antigravity-favicon://`）**：支持 2.31.0 的安全 Favicon 本地缓存与协议加载。

---

## 支持的提供商预设（Providers）

您可以同时配置来自不同服务商的**多个模型**，所有模型均可在聊天界面的模型选择菜单中自由切换：

| 提供商预设 | 协议格式 | 认证秘钥 / 环境变量 | 默认 API 端点 |
|---|---|---|---|
| **OpenAI** | `openai` | API Key (`OPENAI_API_KEY`) | `https://api.openai.com/v1/chat/completions` |
| **Anthropic** | `anthropic` | API Key (`ANTHROPIC_API_KEY`) | `https://api.anthropic.com/v1/messages` |
| **OpenRouter** | `openrouter` | API Key | `https://openrouter.ai/api/v1/chat/completions` |
| **Ollama** (本地) | `ollama` | *(无需填秘钥)* | `http://localhost:11434/v1/chat/completions` |
| **LM Studio** (本地) | `lmstudio` | *(无需填秘钥)* | `http://localhost:1234/v1/chat/completions` |
| **llama.cpp** (本地) | `llamacpp` | *(可选)* | `http://localhost:8080/v1/chat/completions` |
| **Google AI Studio** | `google` | Gemini API Key | `https://generativelanguage.googleapis.com/v1beta/models/...` |
| **DeepSeek** | `deepseek` | API Key | `https://api.deepseek.com/anthropic` |
| **Groq** | `groq` | API Key | `https://api.groq.com/openai/v1` |
| **Mistral** | `mistral` | API Key | `https://api.mistral.ai/v1` |
| **Cerebras** | `cerebras` | API Key | `https://api.cerebras.ai/v1` |
| **Kimi (月之暗面)** | `kimi` | API Key | `https://api.moonshot.ai/anthropic/v1` |
| **Fireworks AI** | `fireworks` | API Key | `https://api.fireworks.ai/inference/v1` |
| **NVIDIA NIM** | `nim` | API Key | `https://integrate.api.nvidia.com/v1` |
| **Custom / Other** | `custom` | 自定义 Key | 任意兼容 OpenAI 或 Anthropic 规范的 URL |

---

## 目录结构

```
antigravity-add-model/
├── src/                           # TypeScript 源码
│   ├── proto/                     # HostBridge Protobuf 协议规范
│   ├── services/                  # 运行时配置与持久化存储服务
│   ├── autoSwitch/                # Auto Switch 路由算法与探针验证
│   ├── wsl.ts                     # WSL 2 远程环境发现与服务管理
│   ├── provisionSplash.ts         # WSL 服务下载进度界面
│   ├── languageServer.ts          # Language Server 生命周期管理与代理注入
│   ├── ipcHandlers.ts             # IPC 路由、安全秘钥存取与模型验证
│   ├── cryptoStore.ts             # 基于 AES-256-GCM 的安全秘钥加密
│   ├── windowState.ts             # 多显示器窗口位置自适应持久化
│   ├── faviconStore.ts            # 图标协议与本地缓存管理
│   ├── preload.ts                 # Preload 桥接、原生 API 暴露与快捷模态框
│   ├── main.ts                    # Electron 主进程生命周期与安全拦截
│   ├── proxy/                     # 本地代理、流式数据解析与工具转换
│   ├── utils.ts                   # 复合视口管理、缩放与工具函数
│   └── __tests__/                 # 自动化测试套件 (189 项全部通过)
├── dist/                          # 编译后的 JavaScript 产物
├── deploy.ps1                     # Windows 全功能部署脚本
├── deploy-antigravity.ps1         # 独立版 Antigravity 部署脚本
├── deploy-ide.ps1                 # Antigravity IDE 部署脚本
├── repatch-all.bat                # 一键部署双版本批处理
├── repatch-antigravity.bat        # 一键部署独立版批处理
├── repatch-ide.bat                # 一键部署 IDE 版批处理
├── package.json                   # 依赖与项目配置 (v2.31.0)
├── README.md                      # 英文文档 (English)
├── README.fa.md                   # 波斯语文档 (فارسی)
└── README.zh-CN.md                # 简体中文文档
```

---

## 常见问题排查（FAQ）

### Q1: 软件更新后我配置的模型还会保留吗？
**答：** 会。所有自定义模型配置及加密后的 API Key 均保存在系统的用户数据目录（`userData`）下的 `custom_models.json` 中，独立于程序本体文件，更新补丁或重装软件均不会丢失。

### Q2: 官方发布更新后如何处理？
**答：** 当 Antigravity 官方发布更新后，只需重新双击运行一次 `repatch-all.bat`（或对应的 `.bat` 脚本），几秒钟内即可在新版本上重新打好补丁，无需重复添加模型。

### Q3: 为什么按下 `Ctrl+Alt+M` 没有反应？
**答：** 请确认当前焦点在 Antigravity 应用程序窗口内。如果快捷键被其他系统软件占用，您可以随时在右下角系统托盘图标上点击右键选择 **⚙ Manage Custom Models** 打开。

### Q4: 是否支持运行命令和编辑文件等 Agent 工具调用（Tool Calling）？
**答：** 完全支持。内置代理层对 DeepSeek、Claude、OpenAI 等模型的工具调用（Function Calling / Tool Use）进行了双向无损转换，命令行执行、文件读写等 Agent 行为均能正常生效。
