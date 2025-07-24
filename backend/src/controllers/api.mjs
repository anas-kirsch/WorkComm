// dependances externes du projet 
import { json, Op, Sequelize } from "sequelize";
import express, { request, response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import parseFormData from '@trojs/formdata-parser';
import fileUpload from "express-fileupload";
import { get } from "http";
import jwt from "jsonwebtoken"
import fs from "fs/promises";
import { error, group } from "console";
import { getgroups } from "process";


import userRouter from "../routes/user.route.mjs"
import adminRouter from "../routes/admin.route.mjs"
import authRouter from "../routes/auth.route.mjs"
import chatGroupRouter from "../routes/chat.group.route.mjs"
import chatPrivateRouter from "../routes/chat.private.route.mjs"
import navRouter from "../routes/nav.route.mjs"

import path from "path";
import { fileURLToPath } from "url";
import formData from "@trojs/formdata-parser";

/**
 * 
 * @param {Sequelize} sequelize 
 */
export function runServer(sequelize) {
    const app = express();
    const port = 4900;
    app.use(cors());

    // Sert le dossier public/images sur /images
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use('/images', express.static(path.join(__dirname, '../../public/images')));

    app.use(express.static("../public"));
    app.use(express.json());
    app.use(fileUpload());

    app.use("/api/user", userRouter);//ok
    app.use("/api/admin", adminRouter);
    app.use("/api/auth", authRouter);//ok
    app.use("/api/chatGroup", chatGroupRouter);//ok
    app.use("/api/chatPrivate", chatPrivateRouter);//ok
    app.use("/api/nav", navRouter);

        app.listen(port, "0.0.0.0", () => {
        console.log(`Server listen on port ${port}`)
    })
}


