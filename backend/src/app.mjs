import { sequelize } from "./configs/dbConnect.mjs";
import { runServer } from "./controllers/api.mjs";
import { User } from "./models/database.mjs";

console.log("[app] Initialisation sequelize.sync...");
let syncOk = true;
try {
    await sequelize.sync({ logging: false });
    console.log("[app] Sync réussie");
    try {
        await Promise.all([
            User.findOrCreate({ where: { username: "anas" }, defaults: { mail: "anas83kirsch@gmail.com", role: "Admin", password: "U2sdkq5c.831-" } }),
            User.findOrCreate({ where: { username: "taiyang" }, defaults: { mail: "taiyang83000@gmail.com", password: "Taiyang12345." } }),
            User.findOrCreate({ where: { username: "este" }, defaults: { mail: "este83000@gmail.com", password: "Este12345." } }),
            User.findOrCreate({ where: { username: "niko" }, defaults: { mail: "niko83000@gmail.com", password: "Niko12345." } }),
        ]);
        console.log("[app] Seeds utilisateurs OK");
    } catch (seedErr) {
        console.warn("[app] Erreur seeds utilisateurs:", seedErr.message);
    }
} catch (err) {
    syncOk = false;
    console.error("[app] Echec sequelize.sync -> serveur lancé quand même:", err.message);
}

runServer(sequelize);
if (!syncOk) {
    console.warn("[app] ATTENTION: base non synchronisée (healthcheck peut rester OK mais fonctionnalités DB limitées).");
}


