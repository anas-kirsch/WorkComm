# WorkComm

**WorkComm** est une application de chat professionnel collaborative permettant à des équipes de travailler ensemble de manière fluide et centralisée. Elle intègre des fonctionnalités de messagerie en temps réel, de gestion de comptes utilisateurs, et prévoit des outils de collaboration comme la traduction automatique et le partage de documents.

## 🧠 Contexte

Dans un environnement de travail de plus en plus décentralisé, la collaboration à distance est devenue essentielle. WorkComm répond à ce besoin en offrant une plateforme légère mais puissante, pensée pour les équipes internationales et les petites entreprises souhaitant centraliser leur communication et leurs documents.

---

## ✨ Fonctionnalités principales

- ✅ **Messagerie en temps réel** entre utilisateurs et groupes.
- ✅ **Création de compte** avec gestion de profil : nom, email, langue, bio, photo de profil.
- ✅ **Ajout d'autres utilisateurs** à son espace de travail.
- ✅ **Traduction automatique** des messages (prévu via intégration d'une API).
- ✅ **Espace collaboratif** (notes partagées, documents, à venir).
- ✅ **Système d'authentification sécurisé** avec mot de passe hashé.
- ✅ **Interface intuitive** responsive pour desktop et mobile.

---

## 🛠️ Stack Technique

### 🔙 Back-end

- **Node.js** & **JavaScript**
- **Express.js** - serveur web et API REST.
- **Socket.IO** - communication en temps réel (messagerie instantanée).
- **Sequelize** - ORM pour bases de données relationnelles.
- **PostgreSQL** - base de données relationnelle.
- **Supabase** - hébergement base de données / API en temps réel.
- **JWT (JSON Web Tokens)** - gestion des sessions et de l'authentification.
- **bcrypt** - hashage des mots de passe pour plus de sécurité.

### 🔝 Front-end

- **Angular** (TypeScript)
- **HTML5 / CSS3** - structure et style.
- **RxJS** - gestion des flux de données réactifs.
- **Angular Forms** - gestion des formulaires utilisateurs.
- **HttpClient** - communication avec l'API.
- **Socket.IO Client** - réception des messages en temps réel.
- **Responsive design** - compatible mobile / tablette / desktop.

---

## 📌 Fonctionnalités à venir / Améliorations possibles

- 🌐 Intégration complète d'une **API de traduction** (DeepL, Google Translate…).
- 📄 Ajout d’un **éditeur de notes collaboratives** (type Notion léger).
- 📎 Système de **partage et téléchargement de documents**.
- 🔔 Système de **notifications en temps réel** (nouveaux messages, ajouts…).
- 📅 Intégration d’un **calendrier d’équipe partagé**.
- 🎨 **Personnalisation du thème** de l’application (mode sombre, clair, etc.).
- 📊 Statistiques d’utilisation et **tableau de bord** pour les admins.
- 🧪 Écriture de **tests automatisés** (unitaires et end-to-end).

---

## 🚀 Lancement local

```bash
# Back-end
cd backend
npm install
npm run dev

# Front-end
cd frontend
npm install
ng serve
