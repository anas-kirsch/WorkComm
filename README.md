# WorkComm

**WorkComm** est une application de chat professionnel collaborative permettant à des équipes de travailler ensemble de manière fluide et centralisée. Elle intègre des fonctionnalités de messagerie en temps réel, de gestion de comptes utilisateurs, et prévoit des outils de collaboration comme la traduction automatique et le partage de documents.

## 🧠 Contexte

Dans un environnement de travail de plus en plus décentralisé, la collaboration à distance est devenue essentielle. WorkComm répond à ce besoin en offrant une plateforme légère mais puissante, pensée pour les équipes internationales et les petites entreprises souhaitant centraliser leur communication et leurs documents.

---

## ✨ Fonctionnalités principales

- ✅ **Messagerie en temps réel** entre utilisateurs et groupes.
- ✅ **Création de compte** avec gestion de profil : nom, email, langue, bio, photo de profil.
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
- **Angular Forms** - gestion des formulaires utilisateurs.
- **HttpClient** - communication avec l'API.
- **Socket.IO Client** - réception des messages en temps réel.
- **Responsive design** - compatible mobile / tablette / desktop.

---

## 📌 Fonctionnalités à venir / Améliorations possibles

- 📄 Ajout d’un **éditeur de notes collaboratives** (type Notion léger).
- 📎 Système de **partage et téléchargement de documents**.
- 🔔 Système de **notifications en temps réel** (nouveaux messages, ajouts…).
- 🎨 **Personnalisation du thème** de l’application (mode sombre, clair, etc.).
- 📊 Statistiques d’utilisation et **tableau de bord** pour les admins.

---

## 🚀 Lancement local

```bash
# Back-end
cd backend
npm install
nodemon src/app.mjs

# Front-end
cd front
npm install
ng serve

```

| N° | Catégorie                        | Fonctionnalités de base (existantes)                                                                                                                                         | Sécurité associée                                                                                           | Fonctionnalités prévues / à améliorer                             |
|----|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| 1  | Authentification & gestion utilisateur | - Création de compte (username, email, mot de passe, bio, langue, photo de profil) <br> - Connexion sécurisée (JWT, mot de passe hashé) <br> - Réinitialisation de mot de passe (email, token, formulaire de changement) <br> - Suppression de compte utilisateur <br> - Gestion du profil (édition, photo, bio, etc.) <br> - Système de rôles (utilisateur, admin, premium) | - Authentification JWT <br> - Hashage des mots de passe (bcrypt) <br> - Middleware de vérification des tokens <br> - Validation des formulaires côté frontend <br> - Accès restreint pour les routes sensibles (admin, premium) | Personnalisation du thème (sombre/clair)                        |
| 2  | Messagerie & groupes             | - Messagerie instantanée privée (Socket.IO) <br> - Messagerie de groupe (création, ajout/suppression de membres, envoi de messages) <br> - Liste d’amis, demandes d’amis, gestion des relations <br> - Historique des messages, affichage optimisé | - Accès restreint par authentification <br> - Sécurisation des sockets et des échanges                      | - Notifications en temps réel (messages, ajouts…) <br> - Éditeur de notes collaboratives (type Notion) <br> - Notifications visuelles (badge chat) |
| 3  | Paiement & abonnements           | - Pages de tarifs (gratuit/premium) <br> - Paiement (Stripe, routes backend dédiées) <br> - Gestion de l’abonnement premium (accès à des fonctionnalités avancées) <br> - Pages de succès/échec de paiement | - Vérification d’accès premium <br> - Sécurisation des transactions                                          | Statistiques d’utilisation et dashboard admin                    |
| 4  | Administration                   | - Routes et contrôleurs pour l’administration (ban, création admin, dashboard à venir) <br> - Middleware d’accès réservé aux admins                                           | - Accès restreint par rôle admin <br> - Middleware d’accès admin                                            | Dashboard admin (statistiques, gestion avancée)                  |
| 5  | Navigation & UI                  | - Pages: accueil, inscription, connexion, profil, chat, tarifs, contact, politique de confidentialité, information, profil d’autres utilisateurs <br> - Header dynamique (connecté/déconnecté, premium) <br> - Footer commun <br> - Navigation sécurisée (guards Angular) | - Guards Angular pour navigation sécurisée                                                                 | - Personnalisation du thème <br> - Responsive design (mobile/tablette/desktop) |
| 6  | Gestion des fichiers & images    | - Upload de photo de profil à l’inscription <br> - Stockage d’images dans le dossier public côté backend                                                                      | - Validation des fichiers uploadés <br> - Accès restreint aux fichiers                                      | Partage et téléchargement de documents                           |
