import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import dns from 'dns/promises';

dotenv.config();

// Support soit d'un DATABASE_URL complet, soit de variables séparées
let DB_URL = process.env.DATABASE_URL?.trim();
const {
    DB_HOST,
    DB_PORT = '5432',
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
} = process.env;

// Sanitize password (remove anything after an unescaped # which is likely an inline comment accidental commit)
let passwordForUrl = DB_PASSWORD;
if (passwordForUrl) {
    const cleaned = passwordForUrl.split(/\s+#/)[0].trim();
    if (cleaned !== passwordForUrl) {
        console.warn('[db] Avertissement: DB_PASSWORD contenait un commentaire (# ...). Utilisation de la partie avant #.');
        passwordForUrl = cleaned;
    }
}

// Si l'utilisateur fournit DB_HOST (et user), on construit et on écrase DATABASE_URL
if (DB_HOST && DB_USER) {
    if (!DB_PASSWORD) {
        console.warn("[db] DB_PASSWORD manquant (connexion peut échouer)");
    }
    if (!DB_NAME) {
        console.warn("[db] DB_NAME manquant (utilisation fallback 'postgres')");
    }
    const safeName = DB_NAME || 'postgres';
    DB_URL = `postgres://${encodeURIComponent(DB_USER)}:${encodeURIComponent(passwordForUrl || '')}@${DB_HOST}:${DB_PORT}/${safeName}`;
    console.log(`[db] Chaîne construite depuis variables séparées host=${DB_HOST} db=${safeName} port=${DB_PORT}`);
} else if (!DB_URL) {
    console.warn("[db] Aucune configuration DB fournie (ni DATABASE_URL ni DB_HOST). Les opérations Sequelize échoueront.");
}

// Paramètres SSL / IPv4
const DB_SSL_DISABLED = (process.env.DB_SSL_DISABLED || '').toLowerCase() === 'true';
const FORCE_IPV4 = (process.env.DB_FORCE_IPV4 || 'true').toLowerCase() !== 'false';

let resolvedHostInfo = null;
if (FORCE_IPV4 && DB_HOST) {
    try {
        resolvedHostInfo = await dns.lookup(DB_HOST, { family: 4 });
        if (resolvedHostInfo?.address) {
            try {
                // Reconstruire l'URL avec l'adresse IPv4 directe (évite tentative IPv6)
                const u = new URL(DB_URL);
                u.hostname = resolvedHostInfo.address;
                DB_URL = u.toString();
                console.log(`[db] Host ${DB_HOST} résolu en IPv4 ${resolvedHostInfo.address}`);
            } catch (e) {
                console.warn('[db] Impossible de réécrire l\'URL avec IP IPv4:', e.message);
            }
        }
    } catch (e) {
        console.warn('[db] Échec résolution DNS IPv4 (fallback hostname direct):', e.message);
    }
}

let sequelize;
sequelize = new Sequelize(DB_URL || 'postgres://invalid:invalid@localhost:5432/invalid', {
  dialect: 'postgres',
  dialectOptions: {
    ...(DB_SSL_DISABLED ? {} : { ssl: { require: true, rejectUnauthorized: false } })
  },
  logging: false,
  host: resolvedHostInfo?.address || undefined,
  port: DB_PORT ? Number(DB_PORT) : undefined
});

export { sequelize };

async function connectWithRetry(attempt = 1) {
    const maxAttempts = Number(process.env.DB_MAX_RETRIES || 5);
    const delayBaseMs = 1000;
    try {
        await sequelize.authenticate();
        console.log(`[db] Connexion OK (attempt ${attempt}) host=${DB_HOST || '(from URL)'} ssl=${DB_SSL_DISABLED ? 'off' : 'on'}`);
    } catch (err) {
        const code = err?.original?.code || err?.code;
        const retryable = ['ENETUNREACH', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'];
        console.warn(`[db] Echec connexion (attempt ${attempt}/${maxAttempts}) code=${code}: ${err.message}`);
        if (attempt < maxAttempts && retryable.includes(code)) {
            const backoff = delayBaseMs * attempt;
            console.log(`[db] Retry dans ${backoff}ms...`);
            await new Promise(r => setTimeout(r, backoff));
            return connectWithRetry(attempt + 1);
        }
        if (code === '28P01') {
            console.error('[db] Mot de passe / identifiants invalides (code 28P01). Vérifie DB_USER / DB_PASSWORD.');
        }
        if (code === 'ENETUNREACH' && FORCE_IPV4) {
            console.warn('[db] ENETUNREACH malgré family=4. Vérifie connectivité réseau / firewall.');
        }
    }
}

connectWithRetry();

