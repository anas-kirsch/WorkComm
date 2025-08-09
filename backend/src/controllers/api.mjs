// dependances externes du projet 
import {Sequelize } from "sequelize";
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

import userRouter from "../routes/user.route.mjs"
import adminRouter from "../routes/admin.route.mjs"
import authRouter from "../routes/auth.route.mjs"
import chatGroupRouter from "../routes/chat.group.route.mjs"
import chatPrivateRouter from "../routes/chat.private.route.mjs"
import navRouter from "../routes/nav.route.mjs"
import paiementRouter from "../routes/paiement.route.mjs";

import path from "path";
import { fileURLToPath } from "url";

/**
 * 
 * @param {Sequelize} sequelize 
 */
export function runServer(sequelize) {
    const app = express();
    const port = 4900;
    // Autorise l'accès CORS depuis l'IP du front
    app.use(cors({
        origin: 'http://192.168.1.248:4200',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    

    // Sert le dossier public/images sur /images
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use('/images', express.static(path.join(__dirname, '../../public/images')));


    app.use("/api/paiement", paiementRouter); // webhook route

    app.use(express.static("../public"));
    app.use(express.json());
    app.use(fileUpload());

    app.use("/api/user", userRouter);//ok
    app.use("/api/admin", adminRouter);
    app.use("/api/auth", authRouter);//ok
    app.use("/api/chatGroup", chatGroupRouter);//ok
    app.use("/api/chatPrivate", chatPrivateRouter);//ok
    app.use("/api/nav", navRouter);
    app.use("/api/premium", paiementRouter )

        app.listen(port, "0.0.0.0", () => {
        console.log(`Server listen on port ${port}`)
    })
}


