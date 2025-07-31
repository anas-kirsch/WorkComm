import { User } from '../models/database.mjs';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import { profilPicture } from "../models/database.mjs"
import { groupName } from '../models/database.mjs';
import { groupMembers } from '../models/database.mjs';
import { Message } from '../models/database.mjs';
import { GroupMessage } from '../models/database.mjs';


/**
 * cette fonction créer un groupe de plusieurs utilisateurs pour qu'il puissent chatter
 * @param {string} group_name 
 * @returns 
 */
export async function createChatGroup(group_name) {

    return await groupName.create({
        group_name: group_name

    })
}

/**
 * cette fonction recupere l'ID d'un groupe existent ou venant d'etre créer 
 * @param {string} group_name 
 */
export async function getGroupId(group_name) {

    return await groupName.findOne({ where: { group_name: group_name } });

}

/**
 * Ajoute un utilisateur à un groupe s'il n'y est pas déjà.
 * @param {number} groupId 
 * @param {number} userId 
 * @returns 
 */
export async function addUserToGroupIfNotExists(groupId, userId) {

    return await groupMembers.findOrCreate({
        where: {

            groupNameId: groupId,
            UserId: userId

        }
    });

}


/**
 * cette fonction recupere tout les membres d'un groupe, et selectionne dans chaque ligne uniquement les userId trouvés
 * @param {number} groupId 
 * @returns 
 */
export async function getAllGroupMember(groupId) {

    return await groupMembers.findAll({
        where: { groupNameId: groupId },
        attributes: ['UserId']
    });

}


/**
 * cette fonction recupere un groupe avec son id 
 * @param {number} groupId 
 * @returns 
 */
export async function findGroup(groupId) {

    return await groupName.findOne({ where: { id: groupId } });

}


/**
 * cette fonction verifie si un utilisateur est deja dans un groupe
 * @param {number} groupId 
 * @param {number} memberId 
 * @returns 
 */
export async function isUserInGroup(groupId, memberId) {

    return await groupMembers.findOne({
        where: { groupNameId: groupId, UserId: memberId }
    })

}



/**
 * cette fonction ajoute un nouveau membre à un groupe existant 
 * @param {number} groupeId 
 * @param {number} newMemberId 
 */
export async function addUserToGroup(groupeId, newMemberId) {

    return await groupMembers.create({
        groupNameId: groupeId, UserId: newMemberId
    })

}


/**
 * cette fonction supprime un membre d'un groupe
 * @param {number} groupeId 
 * @param {number} memberId 
 * @returns 
 */
export async function removeUserFromGroup(groupeId, memberId) {

    return await groupMembers.destroy({
        where: {
            groupNameId: groupeId,
            UserId: memberId
        }
    });

}


/**
 * cette fonction enregistre dans la table Message un message 
 * @param {string} content 
 * @returns {Promise<object>}
 */
export async function createMessage(content) {

    return await Message.create({
        content: content,
    });

}


/**
 * Crée une liaison entre un utilisateur, un groupe et un message dans la table GroupMessage.
 * @param {number} userId 
 * @param {number} groupId 
 * @param {number|string} messageId 
 * @returns {Promise<object>}
 */
export async function createGroupMessageLink(userId, groupId, messageId) {
    return await GroupMessage.create({
        UserId: userId,
        GroupNameId: groupId,
        MessageID: messageId
    });
}


/**
 * cette fonction verifie l'existence du message d'un utilisateur dans un groupe
 * @param {number} userId 
 * @param {number} groupId 
 * @param {number} messageId 
 * @returns 
 */
export async function findGroupMessageLink(userId, groupId, messageId) {

    return await GroupMessage.findOne({
        where: {
            UserId: userId, GroupNameId: groupId, MessageID: messageId
        }
    })

}


/**
 * cette fonction met à jour un message de la table Message
 * @param {string|number} newMessage 
 * @param {number} messageId 
 * @returns 
 */
export async function updateMessage(newMessage, messageId) {

    return await Message.update(
        { content: newMessage },
        { where: { id: messageId } }
    );

}

/**
 * cette fonction supprimer le referencement d'un message dans la table GroupeMessage
 * @param {number} userId 
 * @param {number} groupId 
 * @param {number} messageId 
 */
export async function deleteGroupMessageLink(userId, groupId, messageId) {

    return await GroupMessage.destroy({
        where: { UserId: userId, GroupNameId: groupId, MessageID: messageId }
    });

}



/**
 * cette fonction recupere un message de la table message
 * @param {number} messageId 
 * @returns 
 */
export async function findMessage(messageId) {

    return await Message.findOne({ where: { id: messageId } });

}



/**
 * cette fonction detruit un message de la table Message 
 * @param {number} messageId 
 * @returns 
 */
export async function deleteMessage(messageId) {

    return await Message.destroy({
        where: { id: messageId }
    });

}



/**
 * cette fonction permet de recuperer tout les messagesId referencés dans un groupe
 * @param {number} groupId 
 * @returns 
 */
export async function findAllGroupMessagesByGroupId(groupId) {

    return await GroupMessage.findAll({
        where: {
            GroupNameId: groupId
        }
    })

}


/**
 * Récupère tous les messages dont l'id est dans le tableau messageIds
 * @param {number[]|string[]} messageIds - Tableau d'IDs de messages
 * @returns {Promise<Array>} 
 */
export async function getGroupMessages(messageIds) {

    return await Message.findAll({
        where: { id: messageIds }
    });

}


/**
 * Récupère tous les groupes auxquels un utilisateur appartient
 * @param {number} userId
 * @returns {Promise<Array>}
 */
export async function getAllGroupsForUser(userId) {
    return await groupMembers.findAll({
        where: { UserId: userId },
        attributes: ['groupNameId']
    });
}



/**
 * Récupère tous les messages envoyés par un utilisateur dans tous les groupes
 * @param {number} userId
 * @returns {Promise<Array>}
 */
export async function getAllGroupMessagesByUser(userId) {
    return await GroupMessage.findAll({
        where: { UserId: userId }
    });
}


/**
 * Supprime tous les messages dont l'id est dans le tableau messageIds
 * @param {number[]|string[]} messageIds - Tableau d'IDs de messages
 * @returns {Promise<number>} - Nombre de messages supprimés
 */
export async function deleteMessages(messageIds) {
    return await Message.destroy({
        where: { id: messageIds }
    });
}


// /**
//  * Supprime tous les messages privés dont l'id est dans le tableau messageIds
//  * @param {number[]|string[]} messageIds - Tableau d'IDs de messages privés
//  * @returns {Promise<number>} - Nombre de messages supprimés
//  */
// export async function deletePrivateMessages(messageIds) {
//     return await Message.destroy({
//         where: { id: messageIds }
//     });
// }


/**
 * cette fonction permet de recuperer un nom de groupe avec son id 
 * @param {number} groupeId 
 * @returns 
 */
export async function getManyGroupName(groupeId) {

    return await groupName.findOne({
        where : {id : groupeId},
    })

}



/**
 * Récupère tous les membres d'un groupe avec uniquement leur id utilisateur
 * @param {number} groupId
 * @returns {Promise<Array>} Liste des ids des utilisateurs membres du groupe
 */
export async function getGroupMembersWithUserInfo(groupId) {
    return await groupMembers.findAll({
        where: { groupNameId: groupId },
        include: [{
            model: User,
            attributes: ['id']
        }],
        attributes: []
    });
}




/**
 * Récupère les usernames pour une liste d'IDs utilisateur
 * @param {number[]} userIds
 * @returns {Promise<Array>} Liste des objets { id, username }
 */
export async function getUsernamesByIds(userIds) {
    return await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'username']
    });
}

