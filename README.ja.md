<div align="center">

# 🌌 Google Antigravity カスタムモデル拡張パッチ (v2.31.0)

### Google Antigravity & Antigravity IDE で任意の外部 AI モデルを活用

[![Google Antigravity](https://img.shields.io/badge/Google_Antigravity-v2.31.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Antigravity IDE](https://img.shields.io/badge/Antigravity_IDE-v1.107.0-34A853?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Tests Passing](https://img.shields.io/badge/Tests-189_Passed-2ea44f?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![WSL 2](https://img.shields.io/badge/WSL_2-Supported-blueviolet?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Security Vault](https://img.shields.io/badge/Security-AES--256--GCM-critical?style=for-the-badge&logo=security&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![UI Clean](https://img.shields.io/badge/UI-Zero_DOM_Pollution-blue?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)

---

#### 🌐 言語を選択 / Choose Your Language / انتخاب زبان / 选择语言 / Seleccionar idioma / Choisir la langue

| [🇺🇸 English](README.md) | [🇮🇷 فارسی](README.fa.md) | [🇨🇳 简体中文](README.zh-CN.md) | [🇯🇵 日本語](README.ja.md) |
| :---: | :---: | :---: | :---: |
| [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇷🇺 Русский](README.ru.md) |

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Antigravity モデル選択ドロップダウン" width="80%">
</p>

</div>

> [!NOTE]
> **免責事項（非公式互換パッチ）：** 本プロジェクトは独立したオープンソースプロジェクトであり、Google との提携、承認、サポート関係はありません。「Google」および「Antigravity」の商標は互換製品の説明のみを目的として使用されており、各権利所有者に帰属します。

このリポジトリは、**Google Antigravity (v2.31.0)** および **Antigravity IDE (v1.107.0)** において、標準の Gemini モデルに加えて外部の大規模言語モデル（OpenAI GPT-4o / o1 / o3、Anthropic Claude 3.5 / 3.7 Sonnet、DeepSeek R1 / V3、OpenRouter、Groq、Mistral、Cerebras、Kimi、Fireworks AI、Ollama、LM Studio、llama.cpp、NVIDIA NIM、Google AI Studio、その他 OpenAI 互換 API）を利用可能にする拡張パッチです。

Electron アプリ内に安全なローカル HTTP プロキシを組み込み、Cloud Code 内部 API（`v1internal`）をリバースエンジニアリングして各プロバイダーのリクエスト/レスポンスおよびツール呼び出し（Tool Calling）をリアルタイムに相互変換します。Windows 上の WSL 2 環境に対応し、**`Ctrl+Alt+M`** のショートカットでいつでも呼び出せる**ゼロ DOM 汚染（Zero DOM Pollution）**設計の専用モーダルを提供します。

---

## ⚡ 主な特徴

| 機能 | 概要 |
|---|---|
| 🪟 **Antigravity 2.31.0 完全対応** | 2.31.0 の複合 `BaseWindow` + `WebContentsView` 構造、マルチモニター位置記憶（`windowState.ts`）、Favicon プロトコルに最適化。 |
| 🛡️ **ゼロ DOM 汚染 (Zero DOM Pollution)** | 本体の DOM を一切改変せず、設定画面への不要な要素注入も行いません。専用モーダルは完全オンデマンドで動作。 |
| 🔒 **強固な暗号化キー保護** | API キーは Electron の `safeStorage`（**AES-256-GCM**）により安全に暗号化保存されます。 |
| 🤖 **シームレスな Tool Calling** | 各社モデルの関数呼び出しやコマンド実行を双方向かつ高精度にリアルタイム変換。 |
| 🐧 **ネイティブ WSL 2 統合** | Windows から WSL 2 環境へワンクリック接続。Linux 版サーバーを自動取得・検証。 |
| 📦 **15+ プロバイダープリセット** | OpenAI、Claude、OpenRouter、DeepSeek、Ollama など豊富なプリセットを標準搭載。 |

---

## クイックスタート（Quick Start — v2.31.0）

### 1. パッチの適用（デプロイ）

**Windows** の場合、対象のアプリケーションに合わせて以下のバッチファイルをダブルクリックして実行します（PowerShell からの実行も可能）：

- **スタンドアロン版および IDE 版の両方**：`repatch-all.bat` を実行（または `.\deploy.ps1`）
- **スタンドアロン版 Antigravity のみ**：`repatch-antigravity.bat` を実行（または `.\deploy-antigravity.ps1`）
- **Antigravity IDE のみ**：`repatch-ide.bat` を実行（または `.\deploy-ide.ps1`）

**macOS** または **Linux** の場合：
```bash
npm run build
bash deploy.sh          # macOS
# または
bash deploy_linux.sh    # Linux
```

---

### 2. カスタムモデルの追加と管理

v2.31.0 では、Antigravity 本体の UI に対する DOM 挿入を行わないため、元のデザインが完全に保たれます。専用の管理モーダルは以下の方法でいつでも呼び出せます：

- **ショートカットキー**：**`Ctrl+Alt+M`**（Windows/Linux）または **`Cmd+Option+M`**（macOS）
- **タスクトレイ**：タスクバー右下のトレイアイコンを右クリック → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **アプリケーションメニュー**：上部メニュー **File → Manage Custom Models...**

#### モーダルの主な機能：
1. **モデルの追加（Add Model）**：**15 種類のプロバイダープリセット**から選択可能（API URL は自動補完）。
2. **モデル設定**：モデル ID（例: `gpt-4o`, `claude-3-7-sonnet`, `deepseek-chat`）、表示名、API キー（Electron `safeStorage` により **AES-256-GCM** で安全に暗号化）を入力。
3. **接続テスト（Test Connection）**：保存前にワンクリックで接続と認証を確認。
4. **インライン編集と名前変更**：保存済みの暗号化キーを再入力することなく設定を更新。
5. **リアルタイム検索**：登録モデルが 3 件を超えると検索バーが表示され、名前や ID で即座に絞り込み可能。
6. **安全なインライン削除**：ブラウザ標準の邪魔な確認ダイアログなしで削除可能。
7. **キーの一括復元（Batch Fix OpenRouter）**：アプリ再インストール等で暗号化キーが無効になった場合、上部の警告バナーから一括で再登録が可能。
8. **チャットで即座に選択**：追加されたモデルは Antigravity チャット下部のモデル選択ドロップダウンに自動表示されます。

---

### 3. WSL 2 環境への接続（Windows）

Antigravity v2.31.0 は WSL 2 とシームレスに統合されています：
- メニューの **File → Connect to WSL** またはタスクトレイの **Connect to WSL** から任意の Linux ディストリビューションを選択。
- 適切なバージョンの Linux 版 `language_server` を自動ダウンロードし、SHA-256 チェックサムを検証の上、`~/.antigravity-server/bin/` に配置します。
- **Reopen Locally** を選択することで、いつでも Windows ローカル環境へ瞬時に戻せます。

---

## Auto Switch 機能について（v2.31.0 の動作状況）

> [!NOTE]
> Antigravity v2.31.0 の動作安定性を最優先とし、意図しない自動切り替えを防ぐため、**チャット時の自動ルーティング機能（Auto Switch）は v2.31.0 ではデフォルトで無効化されています**。チャットのドロップダウンで選択されたモデルが常に直接使用されます。ルーティングロジックや検証コードは開発者向けに `src/autoSwitch/` および `docs/gravity-auto-switch.md` に保持されています。

---

## アーキテクチャと動作の仕組み

```
Antigravity Desktop / IDE
  └── Language Server (Go 言語バイナリ)
        └── --api_server_url → http://127.0.0.1:50999 (ローカルリバースプロキシ)
                                  ├── Google 公式モデル → Google Cloud Code サーバーへ直結
                                  └── 外部カスタムモデル → 各社 API (OpenAI, Anthropic 等) へ転送
```

### v2.31.0 における新機能と対応
1. **複合ウィンドウ構造への対応（`BaseWindow` + `WebContentsView`）**：2.31.0 で導入された `curtainView` と `hubWcv` の階層構造に対応し、ウィンドウ管理やイベント配送を最適化。
2. **マルチディスプレイのウィンドウ状態記憶（`windowState.ts`）**：画面外へのウィンドウのはみ出しを防ぎ、解像度や配置状態を終了時に即座に保存。
3. **内蔵ブラウザとスクリプトサンドボックス（`scriptJail` & `webviewBrowser`）**：2.31.0 の内蔵ブラウザ機能、デスクトップマイク権限（`desktopMic`）、WebAuthn 認証と競合することなく共存。
4. **ファビコン保護プロトコル（`antigravity-favicon://`）**：安全なキャッシュプロトコルを完全実装。

---

## 対応プロバイダー一覧（Providers）

複数の異なるプロバイダーのモデルを**同時に登録・利用**できます：

| プロバイダー | フォーマット | 認証キー / 環境変数 | デフォルト API URL |
|---|---|---|---|
| **OpenAI** | `openai` | API Key (`OPENAI_API_KEY`) | `https://api.openai.com/v1/chat/completions` |
| **Anthropic** | `anthropic` | API Key (`ANTHROPIC_API_KEY`) | `https://api.anthropic.com/v1/messages` |
| **OpenRouter** | `openrouter` | API Key | `https://openrouter.ai/api/v1/chat/completions` |
| **Ollama** (ローカル) | `ollama` | *(不要)* | `http://localhost:11434/v1/chat/completions` |
| **LM Studio** (ローカル) | `lmstudio` | *(不要)* | `http://localhost:1234/v1/chat/completions` |
| **llama.cpp** (ローカル) | `llamacpp` | *(任意)* | `http://localhost:8080/v1/chat/completions` |
| **Google AI Studio** | `google` | Gemini API Key | `https://generativelanguage.googleapis.com/v1beta/models/...` |
| **DeepSeek** | `deepseek` | API Key | `https://api.deepseek.com/anthropic` |
| **Groq** | `groq` | API Key | `https://api.groq.com/openai/v1` |
| **Mistral** | `mistral` | API Key | `https://api.mistral.ai/v1` |
| **Cerebras** | `cerebras` | API Key | `https://api.cerebras.ai/v1` |
| **Kimi (Moonshot)** | `kimi` | API Key | `https://api.moonshot.ai/anthropic/v1` |
| **Fireworks AI** | `fireworks` | API Key | `https://api.fireworks.ai/inference/v1` |
| **NVIDIA NIM** | `nim` | API Key | `https://integrate.api.nvidia.com/v1` |
| **Custom / Other** | `custom` | 任意 | OpenAI / Anthropic 互換のエンドポイント |

---

## ディレクトリ構成

```
antigravity-add-model/
├── src/                           # TypeScript ソースコード
│   ├── proto/                     # HostBridge Protobuf 定義
│   ├── services/                  # 設定・ストレージサービス
│   ├── autoSwitch/                # Auto Switch ルーティング・検証
│   ├── wsl.ts                     # WSL 2 連携・Linux サーバー管理
│   ├── provisionSplash.ts         # WSL ダウンロード進捗画面
│   ├── languageServer.ts          # Language Server プロセス制御
│   ├── ipcHandlers.ts             # IPC ハンドラ・モデル CRUD・検証
│   ├── cryptoStore.ts             # AES-256-GCM 安全暗号化
│   ├── windowState.ts             # ウィンドウ状態の保存と復元
│   ├── faviconStore.ts            # ファビコンプロトコル処理
│   ├── preload.ts                 # Preload API・ショートカットモーダル
│   ├── main.ts                    # Electron メインプロセス
│   ├── proxy/                     # プロキシ・ストリーミング・ツール変換
│   ├── utils.ts                   # ウィンドウ制御・ズーム管理
│   └── __tests__/                 # ユニットテスト (189 件全パス)
├── dist/                          # コンパイル済み JS 成果物
├── deploy.ps1                     # Windows 統合デプロイスクリプト
├── deploy-antigravity.ps1         # スタンドアロン版デプロイスクリプト
├── deploy-ide.ps1                 # IDE 版デプロイスクリプト
├── repatch-all.bat                # 両バージョン一括適用バッチ
├── repatch-antigravity.bat        # スタンドアロン版適用バッチ
├── repatch-ide.bat                # IDE 版適用バッチ
├── package.json                   # パッケージ定義 (v2.31.0)
├── README.md                      # 英語 (English)
├── README.fa.md                   # ペルシア語 (فارسی)
├── README.zh-CN.md                # 簡体字中国語 (简体中文)
└── README.ja.md                   # 日本語ドキュメント
```

---

## よくある質問（FAQ）

### Q1: アプリを再起動または更新しても設定したモデルは保持されますか？
**A:** はい。設定や暗号化された API キーはユーザーデータディレクトリ（`userData`）の `custom_models.json` に保存されるため、アプリ本体の更新やパッチの再実行で消去されることはありません。

### Q2: Antigravity の公式アップデートがあった場合はどうすればよいですか？
**A:** 公式アップデート適用後、再度 `repatch-all.bat`（または該当のバッチ）を実行するだけで、数秒で新バージョンにパッチが再適用されます。

### Q3: `Ctrl+Alt+M` を押してもモーダルが表示されません。
**A:** Antigravity のウィンドウがアクティブになっていることを確認してください。または、画面右下のタスクトレイアイコンを右クリックして **⚙ Manage Custom Models** を選択してください。

### Q4: コマンド実行やファイル編集などのツール呼び出し（Tool Calling）は動作しますか？
**A:** はい、完全に対応しています。プロキシ層が各モデルの Function Calling 形式を相互変換するため、Agent によるコード実行やファイル読み書きも通常通り実行されます。
