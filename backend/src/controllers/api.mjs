import { Sequelize } from "sequelize";
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
    const port = Number(process.env.BACKEND_PORT); //port du backend 
    // Autorise l'accès CORS depuis l'IP du front
    app.use(cors({
        origin: [process.env.FRONTEND_URL, process.env.PC_LOCAL_URL, process.env.LOCALHOST_URL], //url du frontend
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use('/images', express.static(path.join(__dirname, '../../public/images')));

    // Ajout du router webhook Stripe avant express.json et fileUpload
    app.use("/api/paiement", paiementRouter);

    app.use(express.static("../public"));
    app.use(express.json());
    app.use(fileUpload());

    app.use("/api/user", userRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/chatGroup", chatGroupRouter);
    app.use("/api/chatPrivate", chatPrivateRouter);
    app.use("/api/nav", navRouter);
    app.use("/api/paiement", paiementRouter); // autres routes paiement
    app.use("/api/premium", paiementRouter)

    app.listen(port, "0.0.0.0", () => {
        console.log(`Server listen on port ${port}`)
    })
}


