<div align="center">

# 🌌 أداة تفعيل النماذج المخصصة في Google Antigravity (الإصدار 2.31.0)

### اربط أي نموذج ذكاء اصطناعي خارجي ببرنامجي Google Antigravity و Antigravity IDE

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
  <b>العربية</b> ·
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
  <img src="assets/chat_model_dropdown.png" alt="قائمة اختيار النماذج في Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **إخلاء مسؤولية (تصحيح غير رسمي):** هذا المشروع مفتوح المصدر ومستقل تماماً ولا يتبع شركة Google أو يحظى بدعم رسمي منها. تُستخدم أسماء «Google» و «Antigravity» فقط للإشارة إلى توافق البرمجيات.

يوفر هذا المستودع تصحيح توافق شامل لإصدار **Google Antigravity (v2.31.0)** و **Antigravity IDE (v1.107.0)**، مما يتيح لك استخدام نماذج الذكاء الاصطناعي الخارجية (مثل OpenAI GPT-4o / o1 / o3 و Anthropic Claude 3.5 / 3.7 Sonnet و DeepSeek R1 / V3 و OpenRouter و Groq و Mistral و Cerebras و Kimi و Fireworks AI و Ollama و LM Studio و llama.cpp و NVIDIA NIM و Google AI Studio وأي خادم متوافق مع معايير OpenAI) جنباً إلى جنب مع نماذج Gemini المدمجة.

يعتمد المشروع على وسيط HTTP محلي آمن مدمج في Electron، مع هندسة عكسية لواجهة Cloud Code الداخلية (`v1internal`)، وتحويل الطلبات واستدعاء الأدوات (Tool Calling) لحظياً، مع دعم بيئة WSL 2 على Windows، ونافذة إدارة مستقلة تُفتح بالاختصار **`Ctrl+Alt+M`** بدون أي تعديل مشوه على الواجهة الأصلية (**Zero DOM Pollution**).

---

## ⚡ أبرز المزايا

| الميزة | الوصف |
|---|---|
| 🪟 **توافق كامل مع 2.31.0** | دعم بنية النوافذ المركبة `BaseWindow` + `WebContentsView`، وتثبيت أبعاد النوافذ متعددة الشاشات (`windowState.ts`)، وبروتوكول الأيقونات. |
| 🛡️ **Zero DOM Pollution** | تظل واجهة التطبيق الأصلية نقية 100% دون أي حقن في الإعدادات، والنافذة تفتح فقط عند الطلب. |
| 🔒 **تشفير المفاتيح بأمان عالي** | حفظ المفاتيح مشفرة بتقنية **AES-256-GCM** على مستوى العتاد عبر Electron `safeStorage`. |
| 🤖 **استدعاء متكامل للأدوات** | تحويل ثنائي الاتجاه لاستدعاء الدوال وتنفيذ أوامر الطرفية لجميع نماذج الذكاء الاصطناعي. |
| 🐧 **تكامل أصيل مع WSL 2** | اتصال مباشر بتوزيعات لينكس على Windows مع تحميل خادم لينكس والتحقق منه عبر SHA-256 تلقائياً. |
| 📦 **أكثر من 15 قالباً مسبق الإعداد** | قوالب جاهزة لـ OpenAI و Claude و OpenRouter و DeepSeek و Ollama وغيرها. |

---

## البدء السريع (Quick Start — v2.31.0)

### 1. تطبيق التصحيح

على **Windows**، قم بتشغيل الملف الدفعي (`.bat`) المناسب:

- **لكلا البرنامجين (العادي و IDE)**: شغّل `repatch-all.bat` (أو `.\deploy.ps1`)
- **لبرنامج Antigravity المستقل فقط**: شغّل `repatch-antigravity.bat` (أو `.\deploy-antigravity.ps1`)
- **لبرنامج Antigravity IDE فقط**: شغّل `repatch-ide.bat` (أو `.\deploy-ide.ps1`)

على **macOS** أو **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# أو
bash deploy_linux.sh    # Linux
```

---

### 2. إدارة النماذج

افتح نافذة الإدارة في أي وقت عبر:
- **اختصار لوحة المفاتيح**: **`Ctrl+Alt+M`** (Windows/Linux) أو **`Cmd+Option+M`** (macOS)
- **شريط المهام (Tray)**: انقر بزر الفأرة الأيمن على الأيقونة → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **قائمة التطبيق**: **File → Manage Custom Models...**
