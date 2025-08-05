


import { User } from "./database.mjs";
import { Op } from "sequelize";



/**
 * active en bdd l'abonnement pour l'user qui a payer
 * @param {number} userId 
 */
export async function paimentAccepted(userId) {
    return await User.update(
        { premium: true }, // champs à mettre à jour
        { where: { id: userId, premium: false } } // filtre sur l'utilisateur et premium false
    );
}