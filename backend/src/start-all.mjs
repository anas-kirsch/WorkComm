// Point d'entrée unique pour API + sockets privé & groupe
// Chaque module lance son propre serveur sur son port défini dans les variables d'environnement.
// Assurez-vous que BACKEND_PORT, PRIVATE_SOCKET_PORT et GROUP_SOCKET_PORT sont définies.

console.log("[start-all] Initialisation des services...");

// Import API (sequelize sync + serveur HTTP principal)
await import('./app.mjs');
console.log('[start-all] API démarrée.');

// Import sockets (ils appellent server.listen à l'import)
await import('./controllers/privateSocket.mjs');
console.log('[start-all] Socket privé démarré.');

await import('./controllers/groupSocket.mjs');
console.log('[start-all] Socket groupe démarré.');

console.log('[start-all] Tous les services sont lancés.');
