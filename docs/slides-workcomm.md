---
marp: true
paginate: true
class: lead
headingDivider: 2
title: "WorkComm — Architecture, Sécurité & Mise en production"
author: ""
---

# WorkComm

Node/Express + PostgreSQL/Sequelize • Angular • Socket.IO • Stripe • Docker/Nginx

(À souligner: objectif produit en 1 phrase, techno clés, démo finale: auth → chat temps réel → paiement)

---

## Vue d’ensemble

- Frontend: Angular (SPA) servi derrière Nginx
- Backend: Node.js/Express (ESM), APIs REST + Socket.IO
- BDD: PostgreSQL via ORM Sequelize
- DevOps: Docker + docker-compose.prod, reverse proxy Nginx (WS + HTTPS)

(À souligner: schéma simple: Nginx ↔ Front/Back ↔ PostgreSQL, WebSockets upgradés)

---

## Backend — Stack & responsabilités

- Node.js + Express en modules ES (.mjs), routes par domaine
- REST: auth, user, chat (privé/groupe), admin, paiement (Stripe)
- Middleware auth (Authorization: Bearer <JWT>) + rôles admin
- Validation/erreurs/logs (try/catch centralisés)

(À souligner: séparation claire route → middleware → controller → modèle)

---

## Organisation (MVC + sockets)

- Controllers: `backend/src/controllers/*.mjs`
- Routes: `backend/src/routes/*.mjs` (Express Router)
- Models: `backend/src/models/*.mjs` (Sequelize)
- Middlewares: `backend/src/middlewares/*.mjs`
- Sockets: `groupSocket.mjs`, `privateSocket.mjs`

(À souligner: controllers minces, logique data dans modèles/services, sockets isolés par contexte)

---

## Routing Express

- Routes par domaine: auth, user, chat.private, chat.group, paiement, admin
- Chaîne type: Router → middleware auth → controller → Sequelize
- Versionnage possible: `/api/v1` (évolutivité)

(À souligner: où le middleware auth s’insère, endpoints publics vs protégés)

---

## Base de données — PostgreSQL + Sequelize

- Choix: SQL robuste (ACID), JSONB, perfs et fiabilité
- ORM: Sequelize (associations, migrations, validations)
- Connexion/Config: `backend/src/configs/dbConnect.mjs`

(À souligner: productivité + sécurité via ORM, migrations versionnées)

---

## Modélisation & relations (exemples)

- Tables: users, friends, chat_group, chat_private, paiement, admins
- Relations:
  - User 1–N Messages privés / messages de groupe
  - User N–N Groupes (table de jointure)
  - Paiement 1–N User (historique)
- Contraintes: clés étrangères, unicité email/username

(À souligner: data integrity et index sur colonnes critiques)

---

## Opérations DB avancées

- Migrations/seeders (Sequelize CLI)
- Transactions (paiement + écritures atomiques)
- Indexes (unicité, recherche), soft delete si besoin (paranoid)

(À souligner: cohérence forte lors des flux sensibles comme Stripe)

---

## Temps réel — Socket.IO

- Fichiers: `privateSocket.mjs`, `groupSocket.mjs`
- Auth socket (token dans handshake), rooms par conversation
- Événements: message, typing, read, présence
- Robustesse: reconnection, ACKs, limitation simple

(À souligner: mapping salon = conversation, sécurité à la connexion)

---

## Paiement — Stripe

- Flow: PaymentIntent côté serveur → client secret au front
- Webhooks: statut paiement (succès/échec), idempotency keys
- Sécurité: secret côté serveur, vérification signature webhook

(À souligner: aucune clé secrète en front, persistance post-webhook)

---

## Sécurité backend (defense-in-depth)

- Auth JWT: header Authorization Bearer, middleware d’auth
- Rôles/admin: `admin.middleware.mjs`
- Bonnes pratiques: CORS, Helmet, rate limiting, validation d’entrée, bcrypt

(À souligner: couches cumulatives, logs d’accès/erreurs)

---

## Frontend Angular — aperçu

- Structure: `frontend/src/app/` (routes, composants, services, guards)
- Standalone components + `app.routes.ts`
- Environments: `frontend/src/environments/`

(À souligner: routing clair, découpage par features, DI via services)

---

## Routing Angular

- Fichier: `app.routes.ts` (routes publiques/privées)
- Guards: AuthGuard (redirige si pas de token), AdminGuard (rôle)
- Lazy loading & preloading possibles

(À souligner: UX et sécurité côté client, complémentaire au backend)

---

## Services & Interceptors

- Services HTTP (AuthService, ChatService, PaiementService)
- Interceptor: ajoute Authorization: Bearer <JWT>
- Socket service: encapsule Socket.IO client

(À souligner: centraliser auth et erreurs, réutilisabilité)

---

## Composants UI

- Exemples: chat, abonnement, header/footer, cookie-banner
- Inputs/Outputs, state local minimal, accessibilité (ARIA)
- Toaster/feedback erreurs via interceptor

(À souligner: séparation présentation vs data)

---

## HTML & CSS

- Styles: `frontend/src/styles.css` + styles de composants
- Conventions: BEM / utilitaires, variables CSS (thème)
- Performance: lazy images, fonts, critical CSS

(À souligner: maintenabilité et cohérence visuelle)

---

## Responsive & media queries

- Breakpoints: XS/SM/MD/LG/XL (à adapter au design)
- Layout: Flex/Grid, container queries si supportées
- Images responsive: `srcset`, `sizes`

(À souligner: démo mobile vs desktop du chat)

---

## Sécurité end-to-end

- Secrets & env: .env non versionnés, variables injectées en prod
- Tokens: JWT (durée, refresh si applicable); cookies httpOnly/sameSite si modèle cookie
- Interceptor front + middleware auth back

(À souligner: stockage sécurisé, éviter XSS/CSRF, validation systématique)

---

## Build & mise en production

- Conteneurs: `backend/Dockerfile`, `frontend/Dockerfile`
- Orchestrateur: `docker-compose.prod.yml`
- Nginx: `frontend/scripts/nginx.conf` (SPA, cache, WebSocket upgrade)
- Migrations DB au déploiement

(À souligner: HTTPS (Let’s Encrypt), montée de version sans downtime)

---

## Observabilité, qualité, DX

- Logs centralisés, healthchecks, métriques de base
- Tests unitaires/intégration (API, sockets, Stripe mock)
- Docs: README, éventuellement Swagger/OpenAPI pour l’API

(À souligner: détection précoce, feedback rapide)

---

## Démo guidée

- 1) Login/inscription → token
- 2) Chat temps réel (privé/groupe): envoi/réception
- 3) Paiement test (Stripe) → statut confirmé
- 4) Admin rapide → vue restreinte
- 5) Responsive: mobile vs desktop

(À souligner: fil rouge utilisateur, valeur perçue)

---

## Roadmap & next steps

- Hardening sécurité (rate-limit par IP, audit deps)
- Optimisations Socket (presence, offline queue)
- Observabilité (traces, corrélation req-id)
- CI/CD complet (build, tests, scan, déploiement auto)

(À souligner: priorités vs impact)
