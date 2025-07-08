import { sequelize } from "./database.mjs";
import { runServer } from "./api.mjs";
import cors from "cors";
import { User } from "./database.mjs";

console.log("Avant sequelize.sync");
await sequelize.sync({logging : true})
    .then(async () => {
        console.log("Après sequelize.sync");
        await Promise.all([
            User.findOrCreate({ where: { username: "anas" }, defaults: { mail: "anas83kirsch@gmail.com", role: "Admin", password: "U2sdkq5c.831-" } }),
            User.findOrCreate({ where: { username: "taiyang" }, defaults: { mail: "taiyang83000@gmail.com", password: "Taiyang12345." } }),
            User.findOrCreate({ where: { username: "este" }, defaults: { mail: "este83000@gmail.com", password: "Este12345." } }),
            // User.findOrCreate({ where: { username: "nam" }, defaults: { mail: "nam83000@gmail.com", password: "Nam12345." } }),
            User.findOrCreate({ where: { username: "niko" }, defaults: { mail: "niko83000@gmail.com", password: "Niko12345." } }),
        
        ]);
        
        runServer(sequelize);

    })
    .catch(console.error)


