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
     * 
     * A MODIFIER : CETTE METHODE EST A REVOIR ET A SECURISER AVEC UN JWT ADMIN 
     * 
     *
     * 
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



    // static async adminBanUser(request, response) {
    //     try {
    //         const banUserId = request.body.id;
    //         if (!banUserId) {
    //             return response.status(400).json({ error: "ID utilisateur manquant." });
    //         }

    //         // Récupérer l'utilisateur, sa photo de profil et ses amis
    //         const getUserToDelete = await findUser(banUserId);
    //         const getPicUser = await getUserProfilPicture(banUserId); // Correction ici
    //         const getHisFriends = await getUserFriend(banUserId);
    //         const getGroup = await getAllGroupsForUser(banUserId);
    //         const getMessageIdofUserInAllGroup = await getAllGroupMessagesByUser(banUserId);
    //         const AgetAllPrivateChatsForUser = await getAllPrivateChatsForUser(banUserId);
    //         const AgetAllPrivateMessagesByUser = await getAllPrivateMessagesByUser(banUserId);






    //         if (!getUserToDelete || !getPicUser || !getHisFriends || !getGroup || !getMessageIdofUserInAllGroup || !AgetAllPrivateChatsForUser || !AgetAllPrivateMessagesByUser) {
    //             return response.status(500).json({ error: "erreur dans les requetes." })
    //         } else {


    //             console.log("1 getUserToDelete:", getUserToDelete);
    //             console.log("2 getPicUser:", getPicUser);
    //             console.log("3 getHisFriends:", getHisFriends);
    //             console.log("4 getGroup:", getGroup);
    //             console.log("5 getMessageIdofUserInAllGroup:", getMessageIdofUserInAllGroup);
    //             console.log("6 getAllPrivateChatsForUser:", AgetAllPrivateChatsForUser);
    //             console.log("7 getAllPrivateMessagesByUser:", AgetAllPrivateMessagesByUser);
    //             // console.log({
    //             //     getUserToDelete,
    //             //     getPicUser,
    //             //     getHisFriends,
    //             //     getGroup,
    //             //     getMessageIdofUserInAllGroup,
    //             //     getAllPrivateChatsForUser,
    //             //     getAllPrivateMessagesByUser

    //             // })

    //         }



            





            // const deletePrivateMessages = await deletePrivateMessages("array");
            // const destroyAllGroupMessage = await deleteMessages("array");



            // if (!getUserToDelete) {
            //     return response.status(404).json({ error: "Utilisateur introuvable." });
            // }

            // // Suppression des relations d'amitié
            // if (getHisFriends && getHisFriends.length > 0) {
            //     for (const friend of getHisFriends) {
            //         await friend.destroy();
            //     }
            // }

            // // Suppression de la photo de profil si elle existe
            // if (getPicUser) {
            //     const imagePath = getPicUser.imagePath;
            //     const pathFile = "/images" + imagePath.split("/images").pop();
            //     try {
            //         await fs.unlink(`../public${pathFile}`);
            //         console.log("Fichier supprimé :", pathFile);
            //     } catch (err) {
            //         console.error("Erreur lors de la suppression du fichier :", err);
            //     }
            //     await getPicUser.destroy();
            // }

            // // Suppression de l'utilisateur
            // await getUserToDelete.destroy();

            // return response.status(200).json({ message: "Utilisateur banni et supprimé avec succès." });

    //     } catch (error) {
    //         console.error(error);
    //         return response.status(500).json({ error: "Erreur serveur lors du bannissement." });
    //     }
    // }




static async adminBanUser(request, response) {
    try {
        const banUserId = request.body.id;
        if (!banUserId) {
            return response.status(400).json({ error: "ID utilisateur manquant." });
        }

        // Récupérer l'utilisateur, sa photo de profil et ses relations
        const getUserToDelete = await findUser(banUserId);
        if (!getUserToDelete) {
            return response.status(404).json({ error: "Utilisateur introuvable." });
        }

        const getPicUser = await getUserProfilPicture(banUserId);
        if (!getPicUser) {
            return response.status(404).json({ error: "Photo de profil introuvable." });
        }

        const getHisFriends = await getUserFriend(banUserId);
        // const getGroup = await getAllGroupsForUser(banUserId);
        // const getMessageIdofUserInAllGroup = await getAllGroupMessagesByUser(banUserId);
        // const AgetAllPrivateChatsForUser = await getAllPrivateChatsForUser(banUserId);
        // const AgetAllPrivateMessagesByUser = await getAllPrivateMessagesByUser(banUserId);

        // Suppression des amis
        if (getHisFriends && getHisFriends.length > 0) {
            for (const friend of getHisFriends) {
                await friend.destroy();
            }
        }

        // // Suppression des groupes
        // if (getGroup && getGroup.length > 0) {
        //     for (const group of getGroup) {
        //         await group.destroy();
        //     }
        // }

        // // Suppression des messages de groupe
        // if (getMessageIdofUserInAllGroup && getMessageIdofUserInAllGroup.length > 0) {
        //     for (const groupMsg of getMessageIdofUserInAllGroup) {
        //         await groupMsg.destroy();
        //     }
        // }

        // // Suppression des conversations privées
        // if (AgetAllPrivateChatsForUser && AgetAllPrivateChatsForUser.length > 0) {
        //     for (const chat of AgetAllPrivateChatsForUser) {
        //         await chat.destroy();
        //     }
        // }

        // // Suppression des messages privés
        // if (AgetAllPrivateMessagesByUser && AgetAllPrivateMessagesByUser.length > 0) {
        //     for (const msg of AgetAllPrivateMessagesByUser) {
        //         await msg.destroy();
        //     }
        // }

        // // Suppression de la photo de profil
        // if (getPicUser) {
        //     const imagePath = getPicUser.imagePath;
        //     const pathFile = "/images" + imagePath.split("/images").pop();
        //     try {
        //         await fs.promises.unlink(`../public${pathFile}`);
        //         console.log("Fichier supprimé :", pathFile);
        //     } catch (err) {
        //         console.error("Erreur lors de la suppression du fichier :", err);
        //     }
        //     await getPicUser.destroy();
        // }

        // Suppression de l'utilisateur
        await getUserToDelete.destroy();

        return response.status(200).json({ message: "Utilisateur banni et supprimé avec succès." });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: "Erreur serveur lors du bannissement." });
    }
}





}