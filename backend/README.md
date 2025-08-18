## Backend (API + Private & Group Socket Servers)

Ports utilisés par défaut:
- API: 4900 (BACKEND_PORT)
- Socket privé: 10100 (PRIVATE_SOCKET_PORT)
- Socket groupe: 9000 (GROUP_SOCKET_PORT)

### Variables d'environnement principales
```
BACKEND_PORT=4900
PRIVATE_SOCKET_PORT=10100
GROUP_SOCKET_PORT=9000
DATABASE_URL=postgres://user:password@host:5432/dbname
FRONTEND_URL=https://frontend.example.com
PC_LOCAL_URL=http://192.168.1.10:4200
LOCALHOST_URL=http://localhost:4200
JWT_SECRET=change_me
STRIPE_KEY=sk_live_xxx
```

### Lancer en local (sans Docker)
```
cd backend
npm install
cp .env.example .env  # puis éditer
npm start
```

### Construire l'image Docker
```
docker build -t workcomm-backend ./backend
```

### Exécuter le conteneur
```
docker run --env-file backend/.env \
	-p 4900:4900 -p 10100:10100 -p 9000:9000 \
	--name workcomm-backend \
	workcomm-backend
```

Endpoints de healthcheck:
- API: GET /api/nav/ping (port 4900)

Logs attendus au démarrage:
- [start-all] API démarrée.
- [start-all] Socket privé démarré.
- [start-all] Socket groupe démarré.

### Notes
- Les serveurs Socket.io sont démarrés via `src/start-all.mjs`.
- Changer les ports en modifiant le fichier `.env` (pas besoin de rebuild pour les sockets; rebuild non requis pour BACKEND_PORT désormais).

