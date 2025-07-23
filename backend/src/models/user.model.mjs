import { User } from '../models/database.mjs';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import {profilPicture} from "../models/database.mjs"


/**
 * cette fonction verifie si le username ou le mail utiliser par un client pour se créer un compte est déjà pris 
 * @param {object} userData 
 * @returns 
 */
export async function findUserByUsernameOrMail(userData) {
    return await User.findOne({
        where: {
            [Op.or]: [
                { username: userData.username },
                { mail: userData.mail }
            ]
        }
    });
}



/**
 * cette fonction attend les données d'un formulaire client pour verifier si l'utilisateur existe, si non alors il le créer 
 * @param {object} userData 
 * @returns
 */
export async function findUserOrCreate(userData) {

    return await User.findOrCreate({
        where: {
            username: userData.username,
            mail: userData.mail,
        },
        defaults: {
            role: "user",
            language: userData.language,
            bio: userData.bio,
            password: userData.password,
        }
    });

}


/**
 * cette fonction cherche un utilisateur par son id
 * @param {number} userId 
 */
export async function findUser(userId){

    return await User.findOne({ where: { id: userId } })

}

/**
 * cette fonction cherche la photo de profil d'un utilisateur 
 * @param {number} userId
 */
export async function getUserProfilPicture(userId){

    return await profilPicture.findOne({where : { UserId : userId}});

}



/**
 * cette fonction recupere les données des amis d'un utilisateur (ex : nom, photo de profil)
 * @param {number} userId 
 */
export async function getUserData(userId) {

    return await User.findByPk(userId);

}



/**
 * Récupère tous les utilisateurs dont le username commence par les caractères donnés
 * @param {string} usernamePart
 * @returns {Promise<Array>} Liste des utilisateurs correspondants
 */
export async function getUserByUsername(usernamePart) {
    return await User.findAll({
        where: {
            username: {
                [Op.like]: `${usernamePart}%`
            }
        }
    });
}



/**
 * recupere un user par son username
 * @param {string} username 
 */
export async function getByUsernameModel(username) {
    
    return await User.findOne({
        where: {
            username: username
        }
    });
}



