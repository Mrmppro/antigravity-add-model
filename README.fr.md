<div align="center">

# 🌌 Correctif de Modèles Personnalisés pour Google Antigravity (v2.31.0)

### Connectez N'importe Quel Modèle d'IA Externe à Google Antigravity & Antigravity IDE

[![Google Antigravity](https://img.shields.io/badge/Google_Antigravity-v2.31.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Antigravity IDE](https://img.shields.io/badge/Antigravity_IDE-v1.107.0-34A853?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Tests Passing](https://img.shields.io/badge/Tests-189_Passed-2ea44f?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![WSL 2](https://img.shields.io/badge/WSL_2-Supported-blueviolet?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![Security Vault](https://img.shields.io/badge/Security-AES--256--GCM-critical?style=for-the-badge&logo=security&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)
[![UI Clean](https://img.shields.io/badge/UI-Zero_DOM_Pollution-blue?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/Mrmppro/antigravity-add-model)

---

#### 🌐 Choisir la langue / Choose Your Language / انتخاب زبان / 选择语言 / 言語を選択 / Seleccionar idioma

| [🇺🇸 English](README.md) | [🇮🇷 فارسی](README.fa.md) | [🇨🇳 简体中文](README.zh-CN.md) | [🇯🇵 日本語](README.ja.md) |
| :---: | :---: | :---: | :---: |
| [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇷🇺 Русский](README.ru.md) |

---

<p align="center">
  <img src="assets/chat_model_dropdown.png" alt="Sélecteur de modèles Antigravity" width="80%">
</p>

</div>

> [!NOTE]
> **Avertissement (Correctif non officiel) :** Ce projet est un outil open source indépendant qui n'est ni affilié à, ni approuvé par Google. Les marques « Google » et « Antigravity » sont mentionnées uniquement à titre descriptif de compatibilité logicielle ; tous les droits appartiennent à leurs titulaires respectifs.

Ce dépôt fournit un correctif de compatibilité complet pour **Google Antigravity (v2.31.0)** et **Antigravity IDE (v1.107.0)** permettant d'utiliser des modèles d'IA tiers (tels qu'OpenAI GPT-4o / o1 / o3, Anthropic Claude 3.5 / 3.7 Sonnet, DeepSeek R1 / V3, OpenRouter, Groq, Mistral, Cerebras, Kimi, Fireworks AI, Ollama, LM Studio, llama.cpp, NVIDIA NIM, Google AI Studio et tout endpoint conforme aux spécifications OpenAI) aux côtés des modèles natifs Gemini.

En intégrant un proxy HTTP local sécurisé dans l'application Electron, en rétro-ingéniant l'API interne de Cloud Code (`v1internal`), en traduisant les flux et les appels d'outils (Tool Calling / Function Calling), et en supportant l'environnement de développement WSL 2 sous Windows, ce projet offre une modale dédiée accessible via **`Ctrl+Alt+M`** sans aucune altération de l'interface native (**Zero DOM Pollution**).

---

## ⚡ Points Forts

| Fonctionnalité | Description |
|---|---|
| 🪟 **Prêt pour Antigravity 2.31.0** | Compatible avec l'architecture `BaseWindow` + `WebContentsView`, la gestion multi-écrans (`windowState.ts`) et le protocole de favicon. |
| 🛡️ **Zero DOM Pollution** | L'interface native demeure 100% vierge de toute altération. La fenêtre de configuration s'affiche uniquement à la demande. |
| 🔒 **Coffre de Clés Sécurisé** | Clés d'API chiffrées au repos par l'algorithme **AES-256-GCM** via Electron `safeStorage`. |
| 🤖 **Prise en Charge des Outils (Tool Calling)** | Traduction bidirectionnelle fluide des fonctions et commandes bash pour les agents d'IA. |
| 🐧 **Support Natif de WSL 2** | Connexion directe aux distributions Linux de WSL 2 sous Windows avec vérification SHA-256 du serveur. |
| 📦 **Plus de 15 Préréglages** | OpenAI, Claude, OpenRouter, DeepSeek, Ollama, Groq, Mistral et bien d'autres configurés en un clic. |

---

## Démarrage Rapide (Quick Start — v2.31.0)

### 1. Appliquer le correctif

Sous **Windows**, double-cliquez sur le fichier de commande (`.bat`) correspondant (ou via PowerShell) :

- **Antigravity Standalone et IDE** : Exécutez `repatch-all.bat` (ou `.\deploy.ps1`)
- **Antigravity Standalone uniquement** : Exécutez `repatch-antigravity.bat` (ou `.\deploy-antigravity.ps1`)
- **Antigravity IDE uniquement** : Exécutez `repatch-ide.bat` (ou `.\deploy-ide.ps1`)

Sous **macOS** ou **Linux** :
```bash
npm run build
bash deploy.sh          # macOS
# ou
bash deploy_linux.sh    # Linux
```

---

### 2. Ajouter et Gérer des Modèles d'IA

Dans la version 2.31.0, l'interface utilisateur d'Antigravity reste totalement intacte. Ouvrez la modale de **Gestion des Modèles Personnalisés** à tout moment :

- **Raccourci clavier** : Appuyez sur **`Ctrl+Alt+M`** (Windows/Linux) ou **`Cmd+Option+M`** (macOS)
- **Zone de notification (Tray)** : Clic droit sur l'icône de la barre des tâches → **⚙ Manage Custom Models (Ctrl+Alt+M)**
- **Menu de l'application** : Rendez-vous dans **File → Manage Custom Models...**

#### Fonctionnalités de la modale :
1. **Ajout de modèle (Add Model)** : Choisissez parmi **15 préréglages de fournisseurs** (l'URL de l'API est pré-remplie).
2. **Configuration** : Indiquez l'ID du modèle (ex. `gpt-4o`, `claude-3-7-sonnet`, `deepseek-chat`), le nom d'affichage et la clé API (chiffrée en **AES-256-GCM** via Electron `safeStorage`).
3. **Test de connexion (Test Connection)** : Vérifiez immédiatement l'accessibilité et la validité de la clé avant de sauvegarder.
4. **Édition et renommage sur place** : Modifiez les paramètres sans devoir saisir à nouveau votre clé chiffrée.
5. **Recherche instantanée** : Dès que plus de 3 modèles sont configurés, un champ de recherche permet de filtrer rapidement.
6. **Suppression sécurisée** : Confirmation intégrée sans fenêtre popup bloquante.
7. **Restauration de clés (Batch Fix OpenRouter)** : Si les clés chiffrées ne peuvent plus être lues suite à une réinstallation, une bannière permet de les réenregistrer en lot.
8. **Sélection directe dans le chat** : Les modèles ajoutés apparaissent instantanément dans la liste déroulante des modèles de conversation d'Antigravity.

---

### 3. Connexion à WSL 2 (Windows)

Antigravity v2.31.0 s'intègre nativement avec WSL 2 :
- Ouvrez **File → Connect to WSL** ou faites un clic droit sur l'icône de notification → **Connect to WSL** et sélectionnez votre distribution Linux.
- Le binaire Linux `language_server` est téléchargé automatiquement, vérifié par empreinte SHA-256 et déployé dans `~/.antigravity-server/bin/`.
- Revenez à tout moment à l'environnement Windows local en cliquant sur **Reopen Locally**.

---

## État de la Fonctionnalité Auto Switch (v2.31.0)

> [!NOTE]
> Afin de garantir une stabilité optimale et un contrôle absolu pour l'utilisateur, **le routage automatique de modèles (Auto Switch) est désactivé par défaut dans la version 2.31.0**. Le modèle sélectionné manuellement dans le menu du chat sera toujours sollicité en direct. Le moteur de routage et ses tests demeurent consultables dans `src/autoSwitch/` et `docs/gravity-auto-switch.md`.

---

## Architecture Technique

```
Antigravity Desktop / IDE
  └── Language Server (Binaire compilé Go)
        └── --api_server_url → http://127.0.0.1:50999 (Proxy local sécurisé)
                                  ├── Modèles officiels Google → Google Cloud Code
                                  └── Modèles personnalisés → API tierces (OpenAI, Anthropic, etc.)
```

### Améliorations de compatibilité v2.31.0
1. **Fenêtres composites (`BaseWindow` + `WebContentsView`)** : Prise en charge intégrale de la nouvelle superposition d'affichages (`curtainView` et `hubWcv`).
2. **Persistance multi-écrans (`windowState.ts`)** : Mémorisation des dimensions et coordonnées des fenêtres pour éviter les pertes de position lors du passage d'un moniteur à l'autre.
3. **Navigateur interne et sandbox (`scriptJail` & `webviewBrowser`)** : Intégration harmonieuse avec le navigateur webview intégré, les autorisations de microphone (`desktopMic`) et l'authentification WebAuthn.
4. **Protocole de favicon sécurisé (`antigravity-favicon://`)** : Gestion du cache local sécurisé pour les icônes de sites.

---

## Fournisseurs Pris en Charge (Presets)

Vous pouvez configurer simultanément **plusieurs modèles de différents fournisseurs** :

| Fournisseur | Format | Clé d'API / Variable | URL par défaut |
|---|---|---|---|
| **OpenAI** | `openai` | Clé API (`OPENAI_API_KEY`) | `https://api.openai.com/v1/chat/completions` |
| **Anthropic** | `anthropic` | Clé API (`ANTHROPIC_API_KEY`) | `https://api.anthropic.com/v1/messages` |
| **OpenRouter** | `openrouter` | Clé API | `https://openrouter.ai/api/v1/chat/completions` |
| **Ollama** (Local) | `ollama` | *(Aucune)* | `http://localhost:11434/v1/chat/completions` |
| **LM Studio** (Local) | `lmstudio` | *(Aucune)* | `http://localhost:1234/v1/chat/completions` |
| **llama.cpp** (Local) | `llamacpp` | *(Optionnelle)* | `http://localhost:8080/v1/chat/completions` |
| **Google AI Studio** | `google` | Clé Gemini API | `https://generativelanguage.googleapis.com/v1beta/models/...` |
| **DeepSeek** | `deepseek` | Clé API | `https://api.deepseek.com/anthropic` |
| **Groq** | `groq` | Clé API | `https://api.groq.com/openai/v1` |
| **Mistral** | `mistral` | Clé API | `https://api.mistral.ai/v1` |
| **Cerebras** | `cerebras` | Clé API | `https://api.cerebras.ai/v1` |
| **Kimi (Moonshot)** | `kimi` | Clé API | `https://api.moonshot.ai/anthropic/v1` |
| **Fireworks AI** | `fireworks` | Clé API | `https://api.fireworks.ai/inference/v1` |
| **NVIDIA NIM** | `nim` | Clé API | `https://integrate.api.nvidia.com/v1` |
| **Custom / Other** | `custom` | Clé personnalisée | Point de terminaison compatible OpenAI ou Anthropic |

---

## Foire Aux Questions (FAQ)

### Mes modèles sont-ils conservés lors d'une mise à jour ?
**Oui.** Les réglages et clés d'API sont stockés dans le répertoire utilisateur (`userData`) dans le fichier `custom_models.json`. Ils ne sont jamais supprimés lors d'une réapplication du patch.

### Que faire lors d'une mise à jour officielle d'Antigravity ?
Il suffit de réexécuter `repatch-all.bat` (ou le script correspondant). En quelques secondes, la nouvelle version sera patchée et vos modèles redeviendront accessibles immédiatement.

### Les appels d'outils et commandes en terminal (Tool Calling) fonctionnent-ils ?
**Oui.** Le proxy traduit les spécifications d'outils et les appels de fonctions de manière bidirectionnelle, permettant à l'agent d'exécuter des scripts ou d'éditer des fichiers normalement.
