<div align="center">

# 🌌 Patch Model Kustom untuk Google Antigravity (v2.31.0)

### Hubungkan Model AI Eksternal Apa Pun ke Google Antigravity & Antigravity IDE

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
  <b>Bahasa Indonesia</b> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.el.md">Ελληνικά</a> ·
  <a href="README.ml.md">മലയാളം</a> ·
  <a href="README.roman-urdu.md">Roman Urdu</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.bg.md">Български</a>
</p>

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Menu Pilihan Model di Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Pernyataan Penyangkalan (Patch Non-Resmi):** Proyek ini adalah proyek sumber terbuka independen dan tidak berafiliasi dengan, didukung, atau disponsori oleh Google. Merek dagang "Google" dan "Antigravity" hanya digunakan untuk keperluan deskripsi kompatibilitas.

Repositori ini menyediakan patch kompatibilitas penuh untuk **Google Antigravity (v2.31.0)** dan **Antigravity IDE (v1.107.0)** yang memungkinkan Anda menghubungkan model AI eksternal (seperti OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio, dan API standar OpenAI lainnya) berdampingan dengan model bawaan Gemini.

Patch ini menyematkan proxy HTTP lokal yang aman di Electron, merekayasa balik API internal Cloud Code (`v1internal`), menerjemahkan panggilan alat (Tool Calling / Function Calling) secara langsung, mendukung WSL 2 di Windows, dan menyediakan modal terpisah via **`Ctrl+Alt+M`** tanpa mengubah tampilan bawaan (**Zero DOM Pollution**).

---

## ⚡ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🪟 **Kompatibel Penuh Antigravity 2.31.0** | Mendukung arsitektur `BaseWindow` + `WebContentsView`, pelacakan jendela multimonitor (`windowState.ts`), dan favicon terisolasi. |
| 🛡️ **Zero DOM Pollution** | Antarmuka bawaan 100% bersih tanpa manipulasi menu Settings. Modal dibuka sesuai kebutuhan. |
| 🔒 **Brankas Kunci Terenkripsi** | Kunci API disimpan aman dengan enkripsi tingkat perangkat keras **AES-256-GCM** via Electron `safeStorage`. |
| 🤖 **Dukungan Tool Calling Penuh** | Penerjemahan dua arah untuk eksekusi perintah terminal dan modifikasi file agen AI. |
| 🐧 **Dukungan Asli Windows WSL 2** | Terhubung ke distribusi Linux WSL 2 dengan verifikasi SHA-256 server otomatis. |
| 📦 **Lebih dari 15 Preset Penyedia** | Preset siap pakai untuk OpenAI, Claude, OpenRouter, DeepSeek, Ollama, dll. |

---

## Panduan Cepat (Quick Start — v2.31.0)

### 1. Pasang Patch

Di **Windows**, jalankan berkas batch (`.bat`) yang sesuai:

- **Untuk Standalone & IDE**: Jalankan `repatch-all.bat` (atau `.\deploy.ps1`)
- **Hanya Antigravity Standalone**: Jalankan `repatch-antigravity.bat` (atau `.\deploy-antigravity.ps1`)
- **Hanya Antigravity IDE**: Jalankan `repatch-ide.bat` (atau `.\deploy-ide.ps1`)

Di **macOS** atau **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# atau
bash deploy_linux.sh    # Linux
```

---

### 2. Tambah & Kelola Model

Buka jendela manajemen model kapan saja melalui:
- **Pintasan Keyboard**: **`Ctrl+Alt+M`** (Windows/Linux) atau **`Cmd+Option+M`** (macOS)
- **Baki Sistem (Tray)**: Klik kanan ikon di pojok kanan bawah → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Menu Aplikasi**: **File → Manage Custom Models...**
