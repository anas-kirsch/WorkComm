import { User } from '../models/database.mjs';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import { profilPicture } from "../models/database.mjs"
import { conversation } from '../models/database.mjs';
import { Message } from '../models/database.mjs';
import { privateMessage } from '../models/database.mjs';



/**
 * cette fonction cherche l'existence d'une conversation entre deux amis
 * @param {string} conversationName 
 */
export async function findConversation(conversationName) {

    return await conversation.findOne({ where: { chat_name: conversationName } });

}


/**
 * cette fonction créer une conversation entre deux amis
 * @param {string} conversationName 
 * @param {number} id1 
 * @param {number} id2 
 */
export async function createConversation(conversationName, id1, id2) {

    return await conversation.create({
        chat_name: conversationName,
        UserId: id1,
        friendId: id2
    });

}



/**
 * cette fonction recupere une conversation privée
 * @param {number} userId 
 * @param {number} friendId 
 * @param {string} conversationName 
 * @returns 
 */
export async function findPrivateConversation(userId, friendId, conversationName) {

    return await conversation.findOne({
        where: { UserId: userId, friendId: friendId, chat_name: conversationName }
    })

}


/**
 * 
 * @param {string|number} content 
 * @returns {Promise<Message>}
 */
export async function createMessage(content) {

    return await Message.create({
        content: content,
    });

}



/**
 * cette fonction save l'historique suivant  id des message, id de celui qui la envoyé, id de l'ami l'ayant recu, id de leur conversation privée
 * @param {number} userId 
 * @param {number} friendId 
 * @param {number} conversationId 
 * @param {number} messageId 
 * @returns {Promise<Object>}
 */
export async function saveMessageHistory(userId, friendId, conversationId, messageId) {

    return await privateMessage.create({
        SenderId: userId,
        receiverId: friendId,
        ConversationId: conversationId,
        MessageId: messageId
    })

}


/**
 * cette fonction supprime un message de la table message 
 * @param {number} messageId 
 * @returns {Promise<number>}
 */
export async function deleteMessage(messageId) {

    return await Message.destroy({
        where: { id: messageId }
    })
}



/**
 * 
 * @param {number} userId 
 * @param {number} conversationId 
 * @param {number} messageId 
 * @returns {Promise<Object|null>}
 */
export async function findPrivateMessage(userId, conversationId, messageId) {

    return await privateMessage.findOne({
        where: {
            SenderId: userId,
            ConversationId: conversationId,
            MessageId: messageId
        }
    })

}



/**
 * 
 * @param {string|number} newMessage 
 * @param {number} messageId 
 * @returns {Promise<[number, any[]]>}
 */
export async function updatePrivateMessageInDb(newMessage, messageId) {

    return await Message.update(
        { content: newMessage },
        { where: { id: messageId } }
    );

}


/**
 * cette fonction permet de supprime la ligne qui reference un message id ainsi que la conversation et l'id de l'utilisateur qui l'a envoyer
 * @param {number} userId 
 * @param {number} conversationId 
 * @param {number} messageId 
 * @returns {Promise<number>}
 */
export async function deletePrivateMessageLink(userId, conversationId, messageId) {

    return await privateMessage.destroy({
        where: {
            SenderId: userId,
            ConversationId: conversationId,
            MessageId: messageId
        }
    });


}


/**
 * cette fonction recupere tout l'historique des messages d'une conversation entre deux amis
 * @param {number} conversationId 
 * @returns {Promise<any[]>}
 */
export async function getConversationMessages(conversationId) {

    return await privateMessage.findAll({
        where: { ConversationId: conversationId }
    });

}


/**
 * Récupère tous les messages privés correspondant à une liste d'identifiants de messages.
 * @param {Array<number>} messageIds - Tableau des IDs des messages à récupérer.
 * @returns {Promise<Array<Message>>} - Liste des messages trouvés, triés par date de création croissante.
 */
export async function getPrivateMessages(messageIds) {
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return [];
    }
    return await Message.findAll({
        where: { id: messageIds },
        order: [['createdAt', 'ASC']] // enlève cette ligne si tu n'as pas de champ createdAt
    });
}












