import { User } from '../models/database.mjs';
import { Op } from 'sequelize';
import { Friends } from '../models/database.mjs';


/**
 * cette fonction recupere tout les amis d'un utlisateur 
 * @param {number} userId
 */
export async function getUserFriend(userId) {

    return await Friends.findAll({
        where: { [Op.or]: { UserId: userId, friendId: userId } }
    })

}


/**
 * cette fonction recupere toute les demandes d'amis
 * @param {number} userId 
 */
export async function friendRequest(userId) {

    return await Friends.findAll({ where: { friendId: userId, status: 'pending' } });

}


/**
 * cette fonction recupère une demande d'ami unique
 * @param {number} userId 
 * @param {number} friendId 
 * @returns 
 */
export async function getFriendRequest(userId, friendId) {

    return await Friends.findOne({
        where: { friendId: userId, UserId: friendId, status: 'pending' }
    });
}


/**
 * cette fonction recupere une relation inverse d'une amitiée
 * @param {number} userId 
 * @param {number} friendId 
 * @returns 
 */
export async function getInverseFriendship(userId, friendId) {

    return await Friends.findOne({
        where: { friendId: friendId, UserId: userId }
    });

}


/**
 * cette fonction créer une amitié
 * @param {number} userId 
 * @param {number} friendId 
 */
export async function frienshipCreate(userId, friendId) {

    return await Friends.create({
        UserId: userId,
        friendId: friendId,
        status: "accepted"
    });

}


/**
 * cette fonction recupere une amitie avec un utilisateur
 * @param {number} userId 
 * @param {number} friendId 
 * @returns 
 */
export async function getFriendship(userId, friendId) {
    return await Friends.findOne({
        where: {
            [Op.or]: [
                { UserId: userId, friendId: friendId },
                { UserId: friendId, friendId: userId }
            ]
        }
    });
}


/**
 * cette fonction recupere les amis accepter d'un utilisateur 
 * @param {number} userId 
 * @returns 
 */
export async function findAllFriendship(userId) {

    return await Friends.findAll({
        // where: { [Op.or]: [{ UserId: userId }, { friendId: userId }], status: 'accepted' }
        where: { UserId: userId, status: "accepted" },
    });



}


/**
 * Récupérer les demandes d'amis envoyées et en attente
 * @param {number} userId 
 * @returns 
 */
export async function pendingSentFriendRequests(userId) {
    return await Friends.findAll({ where: { UserId: userId, status: 'pending' } });
}




/**
 * 
 * @param {Array} friendIds 
 * @returns 
 */
export async function getUsernameById(friendIds){

   return await User.findAll({
        where: { id: friendIds },
        attributes: ['id', 'username']
    });
    
}

