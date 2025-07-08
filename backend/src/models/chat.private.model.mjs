import { User } from '../models/database.mjs';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import { profilPicture } from "../models/database.mjs"
import { conversation } from '../models/database.mjs';


/**
 * cette fonction cherche l'existence d'une conversation entre deux amis
 * @param {string} chatName 
 */
export async function findConversation(chatName) {

    return await conversation.findOne({ where: { chat_name: chatName } });

}


/**
 * cette fonction créer une conversation entre deux amis
 * @param {string} chatName 
 * @param {number} id1 
 * @param {number} id2 
 */
export async function createConversation(chatName, id1, id2) {

    return await conversation.create({
        chat_name: chatName,
        UserId: id1,
        friendId: id2
    });

}

