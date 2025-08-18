import { sequelize } from "./configs/dbConnect.mjs";
import { runServer } from "./controllers/api.mjs";
import { User } from "./models/database.mjs";

async function bootstrap() {
    console.log("[bootstrap] Début initialisation DB");
    let dbReady = false;
    try {
        await sequelize.sync({ logging: false });
        console.log("[bootstrap] Sync OK");
        await Promise.all([
            User.findOrCreate({ where: { username: "anas" }, defaults: { mail: "anas83kirsch@gmail.com", role: "Admin", password: "U2sdkq5c.831-" } }),
            User.findOrCreate({ where: { username: "taiyang" }, defaults: { mail: "taiyang83000@gmail.com", password: "Taiyang12345." } }),
            User.findOrCreate({ where: { username: "este" }, defaults: { mail: "este83000@gmail.com", password: "Este12345." } }),
            User.findOrCreate({ where: { username: "niko" }, defaults: { mail: "niko83000@gmail.com", password: "Niko12345." } }),
        ]);
        dbReady = true;
    } catch (err) {
        console.error("[bootstrap] ERREUR sync DB => API lancée en mode dégradé", err.message);
    }

    runServer(sequelize);
    if (!dbReady) {
        console.warn("[bootstrap] ATTENTION: base non synchronisée. Vérifie DATABASE_URL & DATABASE_SSL.");
    }
}

await bootstrap();


