


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



/**
 * cette methode recupere le status de l'abonnement d'un utilisateur en BDD
 * @param {number} userId 
 * @returns 
 */
export async function premiumIsTrue(userId) {
    return await User.findOne({
        where : { id : userId },
        attributes : ["id", "username", "premium"]
    })
}