<div align="center">

# 🌌 Google Antigravity Özel Model Uyumluluk Yaması (v2.31.0)

### Google Antigravity & Antigravity IDE'ye İstediğiniz Harici Yapay Zeka Modelini Ekleyin

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
  <b>Türkçe</b> ·
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
  <img src="assets/chat_model_dropdown.png" alt="Antigravity Model Seçim Menüsü" width="80%">
</p>

</div>

> [!NOTE]
> **Yasal Uyarı (Resmi Olmayan Uyumluluk Yaması):** Bu proje bağımsız bir açık kaynak çalışmasıdır ve Google ile hiçbir resmi bağı, onayı veya sponsorluğu yoktur. "Google" ve "Antigravity" markaları yalnızca ürün uyumluluğunu belirtmek için kullanılmıştır.

Bu depo, **Google Antigravity (v2.31.0)** ve **Antigravity IDE (v1.107.0)** için harici yapay zeka modellerini (OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio ve OpenAI uyumlu tüm API'ler) yerleşik Gemini modelleriyle birlikte çalıştırmayı sağlayan gelişmiş bir uyumluluk yaması içerir.

Electron uygulamasına yerel güvenli bir HTTP proxy entegre eder, Cloud Code dahili API'sini (`v1internal`) tersine mühendislikle çözümler, istek/yanıt formatlarını ve araç çağrılarını (Tool Calling) gerçek zamanlı dönüştürür, Windows WSL 2 ortamını destekler ve **`Ctrl+Alt+M`** kısayolu ile açılan bağımsız bir modal sunarak **Sıfır DOM Kirliliği** (Zero DOM Pollution) sağlar.

---

## ⚡ Öne Çıkan Özellikler

| Özellik | Açıklama |
|---|---|
| 🪟 **Antigravity 2.31.0 Tam Uyumlu** | 2.31.0 kompozit `BaseWindow` + `WebContentsView` mimarisi, çoklu monitör pencere konumu (`windowState.ts`) ve Favicon protokolü desteği. |
| 🛡️ **Sıfır DOM Kirliliği** | Yerel arayüz %100 temiz kalır; Ayarlar menüsüne hiçbir kararsız öğe eklenmez. Yönetim paneli yalnızca istendiğinde açılır. |
| 🔒 **AES-256-GCM Güvenli Kasa** | Tüm API anahtarları Electron `safeStorage` aracılığıyla donanım destekli **AES-256-GCM** ile şifrelenir. |
| 🤖 **Ajan Araç Çağrısı (Tool Calling)** | Claude, OpenAI ve DeepSeek için komut satırı çalıştırma ve dosya düzenleme araçlarını çift yönlü dönüştürür. |
| 🐧 **Yerel Windows WSL 2 Desteği** | Windows üzerinden WSL 2 Linux dağıtımlarına tek tıkla bağlanma ve SHA-256 doğrulamalı Linux sunucusu kurma. |
| 📦 **15+ Sağlayıcı Şablonu** | OpenAI, Claude, OpenRouter, DeepSeek, Ollama ve daha fazlası için hazır URL şablonları. |

---

## Hızlı Başlangıç (Quick Start — v2.31.0)

### 1. Yamayı Uygulama

**Windows** üzerinde hedef uygulamanıza uygun toplu iş dosyasını (`.bat`) çift tıklayın:

- **Hem Standalone hem IDE İçin**: `repatch-all.bat` çalıştırın (veya `.\deploy.ps1`)
- **Yalnızca Antigravity Standalone**: `repatch-antigravity.bat` çalıştırın (veya `.\deploy-antigravity.ps1`)
- **Yalnızca Antigravity IDE**: `repatch-ide.bat` çalıştırın (veya `.\deploy-ide.ps1`)

**macOS** veya **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# veya
bash deploy_linux.sh    # Linux
```

---

### 2. Özel Modelleri Ekleme ve Yönetme

v2.31.0 sürümünde dilediğiniz zaman **Özel AI Modelleri Yönetim Penceresini** açabilirsiniz:

- **Klavye Kısayolu**: **`Ctrl+Alt+M`** (Windows/Linux) veya **`Cmd+Option+M`** (macOS)
- **Sistem Tepsisi**: Görev çubuğu sağ altındaki simgeye sağ tıklayın → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Uygulama Menüsü**: **File → Manage Custom Models...**

---

## Sıkça Sorulan Sorular (SSS)

### Uygulama güncellendiğinde modellerim silinir mi?
**Hayır.** Modeller ve şifrelenmiş API anahtarları sistemin kullanıcı verileri klasöründe (`userData`) `custom_models.json` dosyasında saklanır, yama yenilendiğinde veya yeniden yüklendiğinde silinmez.

### Resmi bir Antigravity güncellemesi geldiğinde ne yapmalıyım?
Yalnızca `repatch-all.bat` dosyasını yeniden çalıştırmanız yeterlidir. Birkaç saniye içinde yama yeni sürüme uygulanır ve modelleriniz anında kullanılabilir hale gelir.
