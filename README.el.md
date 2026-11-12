<div align="center">

# 🌌 Επέκταση Προσαρμοσμένων Μοντέλων για το Google Antigravity (v2.31.0)

### Συνδέστε Οποιοδήποτε Εξωτερικό Μοντέλο AI στο Google Antigravity & Antigravity IDE

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
  <a href="README.id.md">Bahasa Indonesia</a> ·
  <a href="README.it.md">Italiano</a> ·
  <b>Ελληνικά</b> ·
  <a href="README.ml.md">മലയാളം</a> ·
  <a href="README.roman-urdu.md">Roman Urdu</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.bg.md">Български</a>
</p>

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Μενού επιλογής μοντέλου στο Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Αποποίηση Ευθύνης (Ανεπίσημη Επέκταση):** Αυτό είναι ένα ανεξάρτητο έργο ανοιχτού κώδικα και δεν συνδέεται ούτε υποστηρίζεται επίσημα από την Google. Τα εμπορικά σήματα «Google» και «Antigravity» χρησιμοποιούνται αποκλειστικά για περιγραφικούς σκοπούς συμβατότητας.

Αυτό το αποθετήριο περιέχει ένα ολοκληρωμένο patch συμβατότητας για το **Google Antigravity (v2.31.0)** και το **Antigravity IDE (v1.107.0)**, το οποίο επιτρέπει τη σύνδεση εξωτερικών μοντέλων τεχνητής νοημοσύνης (όπως OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio και οποιοδήποτε API συμβατό με το πρότυπο OpenAI) παράλληλα με τα ενσωματωμένα μοντέλα Gemini.

Ενσωματώνει έναν ασφαλή τοπικό διακομιστή μεσολάβησης (HTTP proxy) στο Electron, μεταφράζει σε πραγματικό χρόνο τις κλήσεις εργαλείων (Tool Calling / Function Calling), υποστηρίζει απομακρυσμένες συνεδρίες WSL 2 στα Windows και παρέχει ένα ειδικό παράθυρο μέσω της συντόμευσης **`Ctrl+Alt+M`** με **Μηδενική Αλλοίωση του DOM** (Zero DOM Pollution).

---

## ⚡ Βασικά Χαρακτηριστικά

| Χαρακτηριστικό | Περιγραφή |
|---|---|
| 🪟 **Πλήρης Συμβατότητα με το 2.31.0** | Υποστήριξη σύνθετης αρχιτεκτονικής `BaseWindow` + `WebContentsView`, αποθήκευση θέσης σε πολλαπλές οθόνες (`windowState.ts`) και απομόνωση favicons. |
| 🛡️ **Zero DOM Pollution** | Το αρχικό περιβάλλον χρήστη παραμένει 100% καθαρό. Το παράθυρο ρυθμίσεων ανοίγει μόνο όταν ζητηθεί. |
| 🔒 **Κρυπτογράφηση Υλικού AES-256-GCM** | Τα κλειδιά API κρυπτογραφούνται με ασφάλεια μέσω του Electron `safeStorage`. |
| 🤖 **Πλήρης Υποστήριξη Tool Calling** | Αμφίδρομη μετάφραση κλήσεων συναρτήσεων και εκτέλεσης εντολών τερματικού. |
| 🐧 **Ενσωμάτωση WSL 2 στα Windows** | Σύνδεση με ένα κλικ σε διανομές Linux WSL 2 με αυτόματη επαλήθευση SHA-256 του διακομιστή. |
| 📦 **Πάνω από 15 Προεπιλογές** | Έτοιμα πρότυπα για OpenAI, Claude, OpenRouter, DeepSeek, Ollama και άλλα. |

---

## Γρήγορη Εκκίνηση (Quick Start — v2.31.0)

### 1. Εφαρμογή της Επέκτασης

Στα **Windows**, εκτελέστε το κατάλληλο αρχείο δέσμης ενεργειών (`.bat`):

- **Και για τις δύο εκδόσεις (Standalone & IDE)**: Εκτελέστε `repatch-all.bat` (ή `.\deploy.ps1`)
- **Μόνο για το Antigravity Standalone**: Εκτελέστε `repatch-antigravity.bat` (ή `.\deploy-antigravity.ps1`)
- **Μόνο για το Antigravity IDE**: Εκτελέστε `repatch-ide.bat` (ή `.\deploy-ide.ps1`)

Σε **macOS** ή **Linux**:
```bash
npm run build
bash deploy.sh          # macOS
# ή
bash deploy_linux.sh    # Linux
```

---

### 2. Διαχείριση Μοντέλων

Ανοίξτε το παράθυρο διαχείρισης οποιαδήποτε στιγμή:
- **Συντόμευση πληκτρολογίου**: **`Ctrl+Alt+M`** (Windows/Linux) ή **`Cmd+Option+M`** (macOS)
- **Περιοχή ειδοποιήσεων (Tray)**: Δεξί κλικ στο εικονίδιο δίσκου → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Μενού εφαρμογής**: **File → Manage Custom Models...**
