<div align="center">

# 🌌 Bản Vá Tương Thích Mô Hình AI Tùy Chỉnh Cho Google Antigravity (v2.31.0)

### Kết Nối Bất Kỳ Mô Hình AI Bên Ngoài Nào Vào Google Antigravity & Antigravity IDE

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
  <b>Tiếng Việt</b> ·
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
  <img src="assets/chat_model_dropdown.png" alt="Menu chọn mô hình trong Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Tuyên bố từ chối trách nhiệm (Bản vá không chính thức):** Đây là một dự án mã nguồn mở độc lập và không có liên kết, chứng thực hoặc hỗ trợ từ Google. Các nhãn hiệu "Google" và "Antigravity" chỉ được sử dụng nhằm mục đích mô tả khả năng tương thích.

Kho lưu trữ này cung cấp bản vá tương thích toàn diện cho **Google Antigravity (v2.31.0)** và **Antigravity IDE (v1.107.0)**, cho phép kết nối các mô hình AI bên ngoài (như OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio và bất kỳ API chuẩn OpenAI nào) song song cùng các mô hình Gemini mặc định.

Bản vá tích hợp một proxy HTTP nội bộ bảo mật trong Electron, dịch ngược API Cloud Code (`v1internal`), chuyển đổi luồng dữ liệu và lời gọi công cụ (Tool Calling / Function Calling) theo thời gian thực, hỗ trợ môi trường WSL 2 trên Windows và mở cửa sổ quản lý độc lập bằng phím tắt **`Ctrl+Alt+M`** mà **hoàn toàn không sửa đổi giao diện gốc** (Zero DOM Pollution).

---

## ⚡ Điểm Nổi Bật

| Tính năng | Mô tả |
|---|---|
| 🪟 **Tương thích Antigravity 2.31.0** | Tương thích kiến trúc cửa sổ ghép `BaseWindow` + `WebContentsView`, lưu vị trí đa màn hình (`windowState.ts`) và favicon nội bộ. |
| 🛡️ **Zero DOM Pollution** | Giữ giao diện gốc nguyên bản 100%, không chèn mã vào cài đặt. Bảng quản lý chỉ mở khi được gọi. |
| 🔒 **Mã hóa an toàn AES-256-GCM** | Khóa API được mã hóa an toàn ở cấp phần cứng thông qua Electron `safeStorage`. |
| 🤖 **Hỗ trợ Tool Calling toàn diện** | Dịch hai chiều mượt mà giữa các chuẩn Function Calling và lệnh terminal của Claude, OpenAI và DeepSeek. |
| 🐧 **Hỗ trợ WSL 2 trên Windows** | Kết nối một chạm tới các bản phân phối Linux WSL 2 kèm xác thực SHA-256 cho máy chủ Linux. |
| 📦 **Hơn 15 mẫu nhà cung cấp** | Cấu hình sẵn URL cho OpenAI, Claude, OpenRouter, DeepSeek, Ollama, v.v. |

---

## Bắt Đầu Nhanh (Quick Start — v2.31.0)

### 1. Cài Đặt Bản Vá

Trên **Windows**, nhấp đúp vào tệp batch (`.bat`) tương ứng:

- **Cả bản độc lập và bản IDE**: Chạy `repatch-all.bat` (hoặc `.\deploy.ps1`)
- **Chỉ bản Antigravity Standalone**: Chạy `repatch-antigravity.bat` (hoặc `.\deploy-antigravity.ps1`)
- **Chỉ bản Antigravity IDE**: Chạy `repatch-ide.bat` (hoặc `.\deploy-ide.ps1`)

Trên **macOS** hoặc **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# hoặc
bash deploy_linux.sh    # Linux
```

---

### 2. Thêm và Quản Lý Mô Hình

Mở cửa sổ quản lý bất cứ lúc nào qua:
- **Phím tắt**: **`Ctrl+Alt+M`** (Windows/Linux) hoặc **`Cmd+Option+M`** (macOS)
- **Khay hệ thống (System Tray)**: Nhấp chuột phải vào biểu tượng ở góc dưới màn hình → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Menu ứng dụng**: **File → Manage Custom Models...**
