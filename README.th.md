<div align="center">

# 🌌 แพตช์เพิ่มโมเดล AI แบบกำหนดเองสำหรับ Google Antigravity (v2.31.0)

### เชื่อมต่อโมเดล AI ภายนอกเข้ากับ Google Antigravity & Antigravity IDE ได้อย่างง่ายดาย

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
  <b>ไทย</b> ·
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
  <img src="assets/chat_model_dropdown.png" alt="เมนูเลือกโมเดลใน Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **ข้อจำกัดความรับผิดชอบ (แพตช์ความเข้ากันได้ที่ไม่เป็นทางการ):** โครงการนี้เป็นโครงการโอเพนซอร์สอิสระ และไม่มีความเกี่ยวข้องหรือได้รับการรับรองอย่างเป็นทางการจาก Google แต่อย่างใด เครื่องหมายการค้า "Google" และ "Antigravity" ใช้เพื่อระบุความเข้ากันได้ของผลิตภัณฑ์เท่านั้น

คลังนี้มอบแพตช์ความเข้ากันได้อย่างสมบูรณ์สำหรับ **Google Antigravity (v2.31.0)** และ **Antigravity IDE (v1.107.0)** เพื่อให้คุณสามารถเชื่อมต่อโมเดล AI ภายนอก (เช่น OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio และ API ที่รองรับมาตรฐาน OpenAI) ควบคู่ไปกับโมเดล Gemini ดั้งเดิม

ระบบทำงานผ่านพร็อกซี HTTP ภายในที่มีความปลอดภัยสูงบน Electron ทำวิศวกรรมย้อนกลับ Cloud Code API (`v1internal`) แปลงข้อมูลและคำสั่งเรียกใช้เครื่องมือ (Tool Calling / Function Calling) แบบเรียลไทม์ รองรับ WSL 2 บน Windows และเปิดหน้าต่างจัดการโมเดลผ่านปุ่มลัด **`Ctrl+Alt+M`** โดยไม่มีการดัดแปลงหรือรบกวนหน้าตาโปรแกรมเดิม (**Zero DOM Pollution**)

---

## ⚡ จุดเด่นสำคัญ

| ฟีเจอร์ | คำอธิบาย |
|---|---|
| 🪟 **รองรับ Antigravity 2.31.0 เต็มรูปแบบ** | รองรับสถาปัตยกรรมหน้าต่างคอมโพสิต `BaseWindow` + `WebContentsView`, การจำตำแหน่งหน้าต่างหลายจอ (`windowState.ts`) และ Favicon แบบแยกส่วน |
| 🛡️ **Zero DOM Pollution** | อินเทอร์เฟซดั้งเดิมคงความสะอาด 100% ไม่มีการแทรกโค้ดในหน้าการตั้งค่า หน้าต่างจัดการจะเปิดเมื่อเรียกใช้เท่านั้น |
| 🔒 **การเข้ารหัสคีย์ระดับฮาร์ดแวร์** | จัดเก็บ API Key อย่างปลอดภัยด้วยอัลกอริทึม **AES-256-GCM** ผ่าน Electron `safeStorage` |
| 🤖 **รองรับ Tool Calling สมบูรณ์แบบ** | แปลงคำสั่งเรียกฟังก์ชันและคำสั่งเทอร์มินัลของ Claude, OpenAI และ DeepSeek แบบสองทางได้อย่างแม่นยำ |
| 🐧 **ผสานรวม WSL 2 บน Windows** | เชื่อมต่อกับ Linux WSL 2 ได้ในคลิกเดียว พร้อมดาวน์โหลดและตรวจสอบความถูกต้อง SHA-256 สำหรับเซิร์ฟเวอร์ Linux อัตโนมัติ |
| 📦 **เทมเพลตผู้ให้บริการกว่า 15 ราย** | มีพรีเซ็ต URL สำหรับ OpenAI, Claude, OpenRouter, DeepSeek, Ollama และอื่นๆ ให้พร้อมใช้ |

---

## เริ่มต้นใช้งานด่วน (Quick Start — v2.31.0)

### 1. ติดตั้งแพตช์

บน **Windows** ให้ดับเบิลคลิกไฟล์แบตช์ (`.bat`) ตามเวอร์ชันที่ต้องการ:

- **ทั้งเวอร์ชัน Antigravity Standalone และ IDE**: ดับเบิลคลิก `repatch-all.bat` (หรือรัน `.\deploy.ps1`)
- **เฉพาะ Antigravity Standalone**: ดับเบิลคลิก `repatch-antigravity.bat` (หรือรัน `.\deploy-antigravity.ps1`)
- **เฉพาะ Antigravity IDE**: ดับเบิลคลิก `repatch-ide.bat` (หรือรัน `.\deploy-ide.ps1`)

บน **macOS** หรือ **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# หรือ
bash deploy_linux.sh    # Linux
```

---

### 2. เพิ่มและจัดการโมเดล

เปิดหน้าต่างจัดการโมเดลได้ทุกเมื่อผ่าน:
- **ปุ่มลัด**: **`Ctrl+Alt+M`** (Windows/Linux) หรือ **`Cmd+Option+M`** (macOS)
- **ถาดระบบ (System Tray)**: คลิกขวาที่ไอคอนมุมล่างขวา → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **เมนูโปรแกรม**: **File → Manage Custom Models...**
