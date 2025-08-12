import express from "express"
import { findUser, findUserByUsernameOrMail, findUserOrCreate, getUserProfilPicture, getUserData } from "../models/user.model.mjs";
import { friendRequest, getUserFriend, getFriendRequest, getInverseFriendship, frienshipCreate, getFriendship, findAllFriendship } from "../models/friend.model.mjs"
import { getProfilPictureFromDataB } from "../controllers/getAndSaveProfilPicture.mjs"
import fs from 'fs'
import { Sequelize } from "sequelize";


import {
    createChatGroup,
    getGroupId,
    addUserToGroupIfNotExists,
    getAllGroupMember,
    isUserInGroup,
    addUserToGroup,
    removeUserFromGroup,
    findGroup,
    createMessage,
    createGroupMessageLink,
    findGroupMessageLink,
    updateMessage,
    deleteGroupMessageLink,
    findMessage,
    deleteMessage,
    findAllGroupMessagesByGroupId,
    getGroupMessages,
    getAllGroupMessagesByUser,
    getAllGroupsForUser
} from "../models/chat.group.model.mjs"


import {
    findConversation,
    createConversation,
    findPrivateConversation,
    createMessagePrivate,
    saveMessageHistory,
    deleteMessagePrivate,
    findPrivateMessage,
    updatePrivateMessageInDb,
    deletePrivateMessageLink,
    getConversationMessages,
    getPrivateMessages,
    getAllPrivateChatsForUser,
    getAllPrivateMessagesByUser
} from "../models/chat.private.model.mjs";


export class adminController {

    /**
     * cette methode static permet à un admin de donner le role d'admin a un utilisateur existant ou à creer un nouvel admin directement 
     * @returns 
     */
    static async adminRegister(request, response) {

        try {
            console.log("route : admin-register")

            const myNewAdmin = request.body;
            console.log("1", myNewAdmin);

            if (!myNewAdmin) {
                return response.status(400).json({ error: "Données manquantes." });
            }

            if (myNewAdmin) {
                if (myNewAdmin.password != myNewAdmin.confirmPassword) {
                    return response.status(400).json({ error: "Les mots de passe ne correspondent pas." });

                } else {
                    const ValidAdmin = {
                        username: myNewAdmin.username,
                        mail: myNewAdmin.mail,
                        password: myNewAdmin.password
                    }
                    console.log("2", ValidAdmin)

                    const insertNewAdmin = await AdminUser.create({
                        username: ValidAdmin.username,
                        mail: ValidAdmin.mail,
                        password: ValidAdmin.password,
                    });
                    console.log('3:', insertNewAdmin);

                    if (insertNewAdmin) {

                        response.status(200).json({
                            message: 'votre admin a bien été créer',
                            user: {
                                username: insertNewAdmin.username,
                                mail: insertNewAdmin.mail
                            }
                        });
                    };
                };
            };
        } catch (error) {
            console.error(error); // pour le voir dans la console
            response.status(500).json({ error: "Erreur serveur lors de l'inscription." });
        }
    }


    /**
     * cette methode permet à un administrateur de ban un utilisateur 
     * @returns 
     */
    static async adminBanUser(request, response) {
        const t = await sequelize.transaction();
        try {
            const userId = request.body.userId;

            // Récupération des données nécessaires
            const userToDelete = await findUser(userId, { transaction: t });
            const userFriends = await getUserFriend(userId, { transaction: t });
            const userPic = await getUserProfilPicture(userId, { transaction: t });
            const getConversation = await getAllPrivateChatsForUser(userId, { transaction: t });


            if (!userToDelete || !userPic) {
                await t.rollback();
                return response.status(404).json({ error: "Utilisateur ou photo non trouvée." });
            }

            // Récupération des messages à supprimer
            const groupMessages = await getAllGroupMessagesByUser(userId, { transaction: t });
            const privateMessages = await getAllPrivateMessagesByUser(userId, { transaction: t });

            // Construction de la liste des IDs de messages à supprimer
            const messageIds = [
                ...groupMessages.map(msg => msg.dataValues.MessageID),
                ...privateMessages.map(msg => msg.dataValues.MessageId)
            ];

            // Suppression des messages (si il y en a)
            if (messageIds.length > 0) {
                const deleteMessage = await deletePrivateMessages(messageIds, { transaction: t });

                if (deleteMessage) {
                    for (const msg of groupMessages) {
                        await msg.destroy({ transaction: t });
                    }
                    for (const msg of privateMessages) {
                        await msg.destroy({ transaction: t });
                    }
                }
            }
            // Suppression des amis
            if (userFriends && userFriends.length > 0) {
                for (const friend of userFriends) {
                    await friend.destroy({ transaction: t });
                }
            }

            // Suppression de la photo de profil en base

            // Suppression de l'utilisateur
            const imagePath = userPic.imagePath; // ex: http://localhost:4900/images/vscodedwwm_1752135614625.png
            const fileName = imagePath.split("/").pop();
            if (fileName && fileName !== "default.jpg") {
                // Chemin absolu vers le fichier à supprimer
                const absolutePath = path.join(__dirname, '../../public/images', fileName);
                try {
                    await fs.unlink(absolutePath);
                    console.log("Fichier supprimé :", absolutePath);
                } catch (err) {
                    if (err.code !== 'ENOENT') {
                        await t.rollback();
                        console.error("Erreur lors de la suppression du fichier :", err);
                        return response.status(500).json({ error: "Erreur lors de la suppression du fichier image." });
                    } else {
                        console.warn("Fichier déjà absent :", absolutePath);
                    }
                }
            }

            if (getConversation && getConversation.length > 0) {
                for (const conv of getConversation) {
                    await conv.destroy({ transaction: t });
                }
            }
            await userPic.destroy({ transaction: t });
            await userToDelete.destroy({ transaction: t });

            await t.commit();
            return response.status(200).json({ message: "Votre utilisateur a bien été supprimé." });
        } catch (error) {
            if (t) await t.rollback();
            console.error(error);
            return response.status(500).json({ error: "Erreur serveur lors de la suppression de l'utilisateur." });
        }
    }


}