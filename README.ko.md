<div align="center">

# 🌌 Google Antigravity 커스텀 모델 패치 (v2.31.0)

### Google Antigravity & Antigravity IDE에서 모든 외부 AI 모델 연결

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
  <b>한국어</b> ·
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
  <img src="assets/chat_model_dropdown.png" alt="Antigravity 커스텀 모델 선택 드롭다운" width="80%">
</p>

</div>

> [!NOTE]
> **면책 조항 (비공식 호환성 패치):** 본 프로젝트는 독립적인 오픈 소스 도구이며 Google과 제휴, 보증 또는 지원 관계가 없습니다. "Google" 및 "Antigravity" 상표는 호환 제품 설명 용도로만 사용됩니다.

본 저장소는 **Google Antigravity (v2.31.0)** 및 **Antigravity IDE (v1.107.0)**에서 내장 Gemini 모델 외에도 다양한 외부 AI 모델(OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio 및 OpenAI 표준 호환 API)을 자유롭게 사용할 수 있도록 지원하는 패치입니다.

Electron 애플리케이션 내부에 안전한 로컬 HTTP 역방향 프록시를 임베드하고 Cloud Code 내부 API(`v1internal`)를 리버스 엔지니어링하여, 요청/응답 형식과 툴 호출(Tool Calling / Function Calling)을 실시간으로 변환합니다. Windows 환경의 WSL 2 원격 개발을 지원하며 **`Ctrl+Alt+M`** 단축키로 호출되는 독립 모달을 제공하여 **Zero DOM Pollution**(네이티브 UI 변형 없음)을 보장합니다.

---

## ⚡ 주요 특징

| 기능 | 설명 |
|---|---|
| 🪟 **Antigravity 2.31.0 완벽 호환** | 2.31.0 복합 `BaseWindow` + `WebContentsView` 레이어 구조, 멀티 모니터 좌표 기억(`windowState.ts`), 파비콘 프로토콜 완벽 대응. |
| 🛡️ **Zero DOM Pollution** | 설정 화면에 불필요한 DOM 주입 없이 원본 UI를 100% 유지하며, 모델 관리 모달은 필요할 때만 호출됩니다. |
| 🔒 **안전한 키 금고 (AES-256-GCM)** | 모든 API 키는 Electron `safeStorage`를 통해 하드웨어 기반으로 안전하게 암호화 보관됩니다. |
| 🤖 **원활한 에이전트 툴 호출** | Claude, OpenAI, DeepSeek의 Function Calling 및 터미널 명령어 실행을 실시간 양방향 변환합니다. |
| 🐧 **네이티브 Windows WSL 2 지원** | WSL 2 리눅스 배포판과 원클릭 연동 및 SHA-256 검증된 리눅스 서버 바이너리 자동 배포. |
| 📦 **15개 이상의 프리셋 제공** | OpenAI, Claude, OpenRouter, DeepSeek, Ollama 등 주요 공급자 프리셋 기본 제공. |

---

## 빠른 시작 (Quick Start — v2.31.0)

### 1. 패치 적용하기

**Windows**에서는 대상 환경에 맞는 배치 파일(`.bat`)을 더블 클릭합니다:

- **독립 실행형 및 IDE 모두 적용**: `repatch-all.bat` 실행 (또는 `.\deploy.ps1`)
- **독립형 Antigravity만 적용**: `repatch-antigravity.bat` 실행 (또는 `.\deploy-antigravity.ps1`)
- **Antigravity IDE만 적용**: `repatch-ide.bat` 실행 (또는 `.\deploy-ide.ps1`)

**macOS** 또는 **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# 또는
bash deploy_linux.sh    # Linux
```

---

### 2. 커스텀 모델 추가 및 관리

v2.31.0에서는 언제 어디서나 **커스텀 AI 모델 관리 패널**을 즉시 호출할 수 있습니다:

- **단축키**: **`Ctrl+Alt+M`** (Windows/Linux) 또는 **`Cmd+Option+M`** (macOS)
- **작업 표시줄 트레이**: 시스템 트레이 아이콘 우클릭 → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **메뉴 모음**: 상단 메뉴 **File → Manage Custom Models...**

#### 모달 주요 기능:
1. **모델 추가 (Add Model)**: **15개 제공업체 프리셋** 지원 (API URL 자동 완성).
2. **모델 설정**: 모델 ID(예: `gpt-4o`, `claude-3-7-sonnet`, `deepseek-chat`), 표시 이름, API 키(**AES-256-GCM** 암호화) 입력.
3. **연결 테스트 (Test Connection)**: 저장 전 엔드포인트 연결성 및 인증 키 유효성 실시간 점검.
4. **인라인 편집 및 이름 변경**: 암호화된 키를 재입력하지 않고 즉시 설정 변경.
5. **실시간 검색**: 3개 이상의 모델 등록 시 실시간 필터 검색창 제공.
6. **안전한 인라인 삭제**: 방해되는 브라우저 팝업 없이 원클릭 확인 삭제.
7. **키 일괄 복구 (Batch Fix OpenRouter)**: 재설치 등으로 키 복호화가 실패할 경우 상단 배너에서 원클릭 재등록.
8. **채팅창에서 즉시 선택**: 추가된 모델은 Antigravity 채팅 입력창 하단 드롭다운에 즉시 표시됩니다.

---

### 3. WSL 2 연결 (Windows)

Antigravity v2.31.0은 Windows WSL 2와 완벽하게 통합됩니다:
- **File → Connect to WSL** 또는 트레이 우클릭 → **Connect to WSL**에서 Linux 배포판 선택.
- Linux용 `language_server`를 자동 다운로드하고 SHA-256 검증 후 `~/.antigravity-server/bin/`에 설치합니다.
- 언제든지 **Reopen Locally**를 눌러 Windows 로컬 환경으로 복귀할 수 있습니다.

---

## 자주 묻는 질문 (FAQ)

### Q1: 앱을 업데이트하거나 재부팅해도 등록한 모델이 유지되나요?
**A:** 네. 모든 커스텀 모델 설정과 암호화된 키는 사용자 데이터 디렉토리(`userData`)의 `custom_models.json`에 저장되므로 안전하게 보존됩니다.

### Q2: Antigravity 공식 업데이트가 출시되면 어떻게 하나요?
**A:** 공식 업데이트 설치 후 `repatch-all.bat`를 다시 실행하면 몇 초 만에 최신 버전에 패치가 재적용됩니다.

### Q3: 에이전트의 터미널 명령어 실행과 파일 편집(Tool Calling)이 작동하나요?
**A:** 네, 완벽하게 지원됩니다. 프록시 계층에서 Function Calling 구조를 실시간 양방향 변환하므로 정상적으로 동작합니다.
