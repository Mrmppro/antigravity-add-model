<div align="center">

# 🌌 Google Antigravity 自訂模型相容性補丁 (v2.31.0)

### 為 Google Antigravity & Antigravity IDE 接入任意外部大語言模型

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
  <b>繁體中文</b> ·
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
  <a href="README.bg.md">Български</a>
</p>

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Antigravity 自訂模型選擇選單" width="80%">
</p>

</div>

> [!NOTE]
> **免責聲明（非官方相容性補丁）：** 本專案為獨立開源工具，與 Google 無任何隸屬、認可或官方支援關係。「Google」與「Antigravity」商標僅用於描述相容產品，其所有權利均歸各自商標持有者所有。

本專案為 **Google Antigravity (v2.31.0)** 與 **Antigravity IDE (v1.107.0)** 提供完整的外部大型語言模型擴充支援。讓您在原生的 Gemini 模型之外，無縫接入各類外部 AI 模型（包含 OpenAI GPT-4o / o1 / o3、Anthropic Claude 3.5 / 3.7 Sonnet、DeepSeek R1 / V3、OpenRouter、Groq、Mistral、Cerebras、Kimi 月之暗面、Fireworks AI、Ollama、LM Studio、llama.cpp、NVIDIA NIM、Google AI Studio 以及任何相容於 OpenAI 介面規範的服務端點）。

透過在 Electron 應用程式中內嵌輕量安全的反向 HTTP 代理，逆向工程 Cloud Code 內部 API (`v1internal`)，即時轉換請求/回應格式與工具調用（Tool Calling），支援 Windows 下的 WSL 2 開發環境，並透過 **`Ctrl+Alt+M`** 快速鍵調出專用視窗，實現真正的**零 DOM 污染**（Zero DOM Pollution）。

---

## ⚡ 核心優勢

| 功能 | 說明 |
|---|---|
| 🪟 **相容 Antigravity 2.31.0** | 完美支援 2.31.0 複合 `BaseWindow` + `WebContentsView` 架構、多螢幕視窗座標持久化 (`windowState.ts`) 與 Favicon 協定。 |
| 🛡️ **真正的零 DOM 污染** | 原生介面 100% 純淨，不在 Settings 中注入任何不穩定元素，管理面板按需喚出。 |
| 🔒 **硬體級金鑰加密** | 所有 API 金鑰均透過 Electron `safeStorage` 的 **AES-256-GCM** 加密儲存。 |
| 🤖 **流暢的 Agent 工具調用** | 完整支援 Claude、OpenAI 與 DeepSeek 的 Function Calling 與終端機指令即時雙向轉換。 |
| 🐧 **原生支援 Windows WSL 2** | 一鍵連接 WSL 2 並在遠端自動佈署經 SHA-256 驗證的 Linux 伺服端。 |
| 📦 **15+ 主流廠商預設** | 內建 OpenAI、Anthropic、OpenRouter、DeepSeek、Ollama 等，點擊即可自動填寫 URL。 |

---

## 快速上手（Quick Start — v2.31.0）

### 1. 佈署補丁

在 **Windows** 上，直接雙擊執行對應的批次檔（或透過 PowerShell 執行）：

- **同時套用於獨立版與 IDE 版**：雙擊 `repatch-all.bat`（或執行 `.\deploy.ps1`）
- **僅獨立版 Antigravity**：雙擊 `repatch-antigravity.bat`（或執行 `.\deploy-antigravity.ps1`）
- **僅 Antigravity IDE**：雙擊 `repatch-ide.bat`（或執行 `.\deploy-ide.ps1`）

在 **macOS** 或 **Linux** 上：
```bash
npm run build
bash deploy.sh          # macOS
# 或
bash deploy_linux.sh    # Linux
```

---

### 2. 新增與管理自訂模型

在 v2.31.0 中，Antigravity 原生介面完全不受修改。您可以隨時開啟**自訂 AI 模型管理視窗**：

- **快捷鍵**：按下 **`Ctrl+Alt+M`**（Windows/Linux）或 **`Cmd+Option+M`**（macOS）
- **系統匣圖示**：右鍵點擊工作列右下角圖示 → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **應用程式選單**：點擊 **File → Manage Custom Models...**

#### 視窗功能：
1. **新增模型 (Add Model)**：提供 **15 種熱門供應商預設**（API URL 自動填寫）。
2. **金鑰與名稱設定**：輸入模型 ID（如 `gpt-4o`、`claude-3-7-sonnet`、`deepseek-chat`）、自訂顯示名稱及 API Key（**AES-256-GCM** 儲存）。
3. **連線測試 (Test Connection)**：儲存前一鍵測試連線狀態與金鑰正確性。
4. **即時編輯與更名**：無需重新輸入已儲存的加密金鑰。
5. **即時搜尋**：當設定超過 3 個模型時自動提供搜尋過濾。
6. **安全刪除**：內嵌式確認按鈕，無阻塞性瀏覽器彈窗。
7. **金鑰一鍵復原 (Batch Fix OpenRouter)**：若重新安裝導致既有加密金鑰失效，頂部橫幅提供一鍵批次重設。
8. **對話選單立即生效**：儲存後立即出現在 Antigravity 對話框下方的模型切換清單中。

---

### 3. 連接 WSL 2 環境（Windows）

Antigravity v2.31.0 完美整合 Windows WSL 2 開發環境：
- 點選 **File → Connect to WSL** 或在系統匣右鍵選擇 **Connect to WSL** 並選取 Linux 發行版。
- 系統將自動下載對應版本之 Linux `language_server`、進行 SHA-256 驗證並安裝至 `~/.antigravity-server/bin/`。
- 隨時可點選 **Reopen Locally** 無縫返回 Windows 原生環境。

---

## 常見問題（FAQ）

### Q1: 更新應用程式後設定的模型會遺失嗎？
**答：** 不會。所有自訂模型與加密金鑰均保存在使用者資料目錄 (`userData`) 的 `custom_models.json` 中，重新套用補丁或軟體更新都不會被刪除。

### Q2: 官方發布更新後該如何操作？
**答：** 只需重新執行一次 `repatch-all.bat`，數秒之內即可在新版本上重新套用補丁，所有自訂模型立即恢復使用。

### Q3: 終端機指令與檔案編輯（Tool Calling）能否正常運作？
**答：** 完全支援。內建代理層能即時雙向轉換工具呼叫，Agent 執行程式碼與讀寫檔案均可正常發揮。
