import { sequelize } from "../configs/dbConnect.mjs";
import { json, Op, Sequelize } from "sequelize";
import {User} from "../models/database.mjs"


/**
 * cette fonction retrouve un utilisateur de la table User par l'intermidaire de son adresse mail et le renvoie en reponse au controller auth.controller.mjs
 * @param {string} userMail 
 * @returns 
 */
export async function findUserByMail(userMail){

    return await User.findOne({ where: { mail: userMail } });

}

