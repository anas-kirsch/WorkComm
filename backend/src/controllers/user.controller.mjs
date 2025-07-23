
import express from "express"
import { findUser, findUserByUsernameOrMail, findUserOrCreate, getUserProfilPicture, getUserData, getUserByUsername } from "../models/user.model.mjs";
// import { findUserOrCreate } from "../models/user.model.mjs";
// import { getUserToDestroy } from "../models/user.model.mjs";
import nodemailer from 'nodemailer';
import { emailSender } from "./smtp.controller.mjs";
import { friendRequest, getUserFriend, getFriendRequest, getInverseFriendship, frienshipCreate, getFriendship, findAllFriendship } from "../models/friend.model.mjs"
import fs from 'fs/promises';
import { getProfilPictureFromDataB } from "../controllers/getAndSaveProfilPicture.mjs"
import { getAndSaveProfilPicture } from "../controllers/getAndSaveProfilPicture.mjs"
import { sequelize } from "../configs/dbConnect.mjs";
import { getAllGroupsForUser, getAllGroupMessagesByUser } from "../models/chat.group.model.mjs"
import { getAllPrivateChatsForUser, getAllPrivateMessagesByUser, getPrivateMessages, deletePrivateMessages } from "../models/chat.private.model.mjs"

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UserController {


    /**  
     * cette methode static permet à un utilisateur du site de se créer un compte 
     */
    static async register(request, response) {

        try {
            console.log("route : register")
            const myNewUser = request.body;

            // console.log("1", myNewUser);
            if (!myNewUser) {
                return response.status(400).json({ error: "Données manquantes." });
            }
            const ifUserExist = await findUserByUsernameOrMail(myNewUser)

            if (ifUserExist) {

                console.log(`l'user ${myNewUser.username} existe deja, essayez un autre nom d'utilisateur. `)
                return response.status(400).json(`l'user ${myNewUser.username} existe deja !`)
            }

            if (myNewUser) {
                if (myNewUser.password != myNewUser.confirmPassword) {
                    return response.status(400).json({ error: "Les mots de passe ne correspondent pas." });

                } else {

                    const validUser = {
                        username: myNewUser.username,
                        mail: myNewUser.mail,
                        role: "user",
                        language: myNewUser.language,
                        bio: myNewUser.bio,
                        password: myNewUser.password

                    }
                    console.log("2", validUser)

                    const insertNewUser = await findUserOrCreate(validUser)

                    if (insertNewUser) {

                        const userInstance = insertNewUser[0];

                        console.log("test file", request.files);

                        if (request.files || request.files == null) {

                            if (request.files && request.files.picture.size > 2 * 1024 * 1024) {
                                const userToDestroy = await findUser(userInstance.dataValues.id);
                                const deleteUserBecauseError = await userToDestroy.destroy();

                                return response.status(400).json({
                                    message: "erreur la photo est trop grande"
                                });

                            }

                            let picture = "null";

                            if (request.files) {
                                picture = request.files.picture;
                            }

                            const addPic = await getAndSaveProfilPicture(picture, userInstance.dataValues.id)

                            if (addPic) {
                                response.status(200).json({
                                    message: 'votre user a bien été créer',
                                    user: {
                                        userId: userInstance.dataValues.id,
                                        username: userInstance.dataValues.username,
                                        mail: userInstance.dataValues.mail,
                                        bio: userInstance.dataValues.bio,
                                        language: userInstance.dataValues.language
                                    }

                                })

                                const send = await emailSender(userInstance.dataValues.username, userInstance.dataValues.mail);

                                if (send) {
                                    console.log(`Email envoyé avec success à ${userInstance.dataValues.username}`)
                                }


                            }
                            else {
                                const getUserToDestroy = await findUser(insertNewUser.id);
                                const deleteUserBecauseError = await getUserToDestroy.destroy();
                                return response.status(400).json({ error: "Erreur lors de l'ajout de la photo de profil." });
                            }
                        }

                    }
                }
            }

        } catch (error) {
            if (error.message.includes("taille maximale autorisée")) {
                response.status(400).json({ error: error.message });
            }
            else if (error.message.includes("Le format de l'image n'est pas supporté")) {
                response.status(400).json({ error: error.message });
            } else {

                console.error(error); // pour le voir dans la console
                response.status(500).json({ error: "Erreur serveur lors de l'inscription." });
            }
        }



    }



    /**
     * cette methode static permet à un utilisateur de supprimer son compte 
     */
    static async deleteUser(request, response) {
        const t = await sequelize.transaction();
        try {
            const userId = request.user.id;

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

            // await getConversation.destroy({ transaction: t });
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



    /**
     * Cette methode static permet à un utilisateur d'envoyer une demande d'ami
     */
    static async sendFriendRequest(request, response) {
        try {
            const { userId, friendId } = request.body;

            if (!userId || !friendId) {
                return response.status(400).json({ error: "Données manquantes." });
            }
            if (userId === friendId) {
                return response.status(400).json({ error: "Vous ne pouvez pas vous ajouter vous-même." });
            }

            const user1 = await findUser(userId);
            const user2 = await findUser(friendId);

            if (!user1 || !user2) {
                return response.status(404).json({ error: "Utilisateur introuvable." });
            }

            // Vérifier si la relation existe déjà (à adapter selon votre modèle)
            const existingFriend = await user1.hasFriend(user2);
            if (existingFriend) {
                return response.status(400).json({ error: "Demande déjà envoyée ou utilisateur déjà ami." });
            }

            const addNewFriend = await user1.addFriend(user2);

            if (!addNewFriend) {
                return response.status(400).json({ error: "Impossible d'ajouter l'ami." });
            }

            response.status(200).json({
                message: "La demande d'ami a bien été envoyée."
            });

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur lors de l'envoi de la demande d'ami." });
        }
    }


    /**
     * Cette methode static permet à un utilisateur de récuperer ses demandes d'amis
     */
    static async getFriendRequest(request, response) {
        try {
            const userId = request.user.id;
            const requests = await friendRequest(userId);

            if (!requests || requests.length === 0) {
                return response.status(200).json([]); // Retourne un tableau vide si aucune demande
            }

            const dataUsers = await Promise.all(requests.map(async (request) => {
                const requestId = request.dataValues.UserId;
                const findDataUsers = await findUser(requestId);
                const profilPicture = await getProfilPictureFromDataB(requestId);

                return {
                    id: findDataUsers.dataValues.id,
                    username: findDataUsers.dataValues.username,
                    imagePath: profilPicture,
                };
            }));

            response.status(200).json(dataUsers);
        } catch (error) {
            response.status(500).json({ error: "Erreur serveur." });
        }
    }


    /**
     * cette methode static permet à un utilisateur de repondre à une demande d'ami
     */
    static async respondToFriendRequest(request, response) {
        try {

            const userId = request.user.id;
            console.log(userId);

            const { friendId, action } = request.body;
            console.log({
                friendId,
                action
            });

            if (!userId || !friendId || !["accept", "refuse"].includes(action)) {
                return response.status(400).json({ error: "Données manquantes ou invalides." });
            }

            const friendRequest = await getFriendRequest(userId, friendId);

            if (!friendRequest) {
                return response.status(404).json({ error: "Demande d'ami non trouvée." });
            }

            if (action == "accept") {
                friendRequest.status = "accepted";
                await friendRequest.save();

                // Crée ou met à jour la relation inverse
                let inverseRequest = await getInverseFriendship(userId, friendId);

                if (!inverseRequest) {
                    await frienshipCreate(userId, friendId)
                } else {
                    inverseRequest.status = "accepted";
                    await inverseRequest.save();
                }

                return response.status(200).json({ message: "vous avez bien accepté la demande d'ami " });
            } else if (action == "refuse") {
                await friendRequest.destroy(); // Supprime la relation
                return response.json({ message: "Demande d'ami refusée et supprimée." });
            }

        } catch (error) {
            console.error(error); // pour le voir dans la console
            response.status(500).json({ error: "Erreur serveur lors de l'envoie de la demande d'ami." });
        }



    }


    /**
     * cette methode static permet de supprimer un ami
     */
    static async deleteFriend(request, response) {
        try {
            const userId = request.user.id;

            const friendId = request.body.friendId;
            console.log(userId, friendId);

            if (!userId || !friendId) {
                return response.status(400).json({ error: "Données manquantes ou invalides." });
            }

            const relation1 = await getInverseFriendship(userId, friendId);
            const relation2 = await getFriendship(userId, friendId);

            await relation1.destroy();
            await relation2.destroy();

            return response.status(200).json({
                message: "vous avez bien supprimé l'ami."
            })

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur." });
        }
    }


    /**
     * cette methode static permet a un utilisateur de récuperer ses amis  
     */
    static async getMyfriends(request, response) {

        try {
            const userId = request.user.id;
            // console.log(userId);

            const allFriends = await findAllFriendship(userId);

            if (allFriends.length === 0) {
                return response.status(200).json([])
            }

            if (allFriends) {
                console.log(allFriends);
            }
            // console.log(allFriends)
            const dataOfFriend = [];

            for (const userFriend of allFriends) {
                const userfriendid = userFriend.dataValues.friendId;
                const profilPicture = await getProfilPictureFromDataB(userfriendid);


                const findDataUsers = await getUserData(userfriendid);
                const user = {
                    id: findDataUsers.dataValues.id,
                    username: findDataUsers.dataValues.username,
                    imagePath: profilPicture,
                    // pp : findDataUsers.dataValues.pp
                };
                // console.log(user);
                dataOfFriend.push(user);

            }
            // console.log(dataOfFriend)
            response.status(200).json(dataOfFriend);

        } catch (error) {

            console.error(error); // pour le voir dans la console
            response.status(500).json({ error: "Erreur serveur." });

        }

    }


    // ...existing code...


    /**
     *  ce controller permet de recuperer les users recherchés
     */
    // static async getUserFromUserTable(request, response) {

    //     try {
    //         const userId = request.user.id;
    //         const { search } = request.body;
    //         console.log({ userId, search });

    //         const ifUserExist = await findUser(userId);

    //         if (!ifUserExist) {
    //             return response.status(404).json({ error: "Utilisateur non trouvé." });
    //         }

    //         const users = await getUserByUsername(search);

    //         console.log(users);

    //         // On filtre les propriétés à retourner
    //         const filteredUsers = users.map(user => ({
    //             id: user.id,
    //             username: user.username,
    //             mail: user.mail,
    //             bio: user.bio,
    //             language: user.language
    //         }));

    //         // console.log(filteredUsers)

    //         return response.status(200).json({ users: filteredUsers });

    //     } catch (error) {
    //         console.error(error); // pour le voir dans la console
    //         response.status(500).json({ error: "Erreur serveur." });
    //     }
    // }




    // static async getUserFromUserTable(request, response) {
    // try {
    //     const userId = request.user.id;
    //     const { search } = request.body;
    //     console.log({ userId, search });

    //     const ifUserExist = await findUser(userId);

    //     if (!ifUserExist) {
    //         return response.status(404).json({ error: "Utilisateur non trouvé." });
    //     }

    //     const users = await getUserByUsername(search);

    //     // On filtre les propriétés à retourner et ajoute la photo de profil
    //     const filteredUsers = await Promise.all(users.map(async user => {
    //         const profilPicture = await getProfilPictureFromDataB(user.id);
    //         return {
    //             id: user.id,
    //             username: user.username,
    //             mail: user.mail,
    //             bio: user.bio,
    //             language: user.language,
    //             imagePath: profilPicture?.dataValues?.imagePath || "http://localhost:4900/images/default.jpg"
    //         };
    //     }));

    //     return response.status(200).json({ users: filteredUsers });

    // } catch (error) {
    //     console.error(error);
    //     response.status(500).json({ error: "Erreur serveur." });
    // }



    static async getUserFromUserTable(request, response) {
    try {
        const userId = request.user.id;
        const { search } = request.body;
        console.log({ userId, search });

        const ifUserExist = await findUser(userId);

        if (!ifUserExist) {
            return response.status(404).json({ error: "Utilisateur non trouvé." });
        }

        const users = await getUserByUsername(search);

        // On filtre les propriétés à retourner et ajoute la photo de profil
        const filteredUsers = await Promise.all(users.map(async user => {
            const profilPicture = await getProfilPictureFromDataB(user.id);
            return {
                id: user.id,
                username: user.username,
                mail: user.mail,
                bio: user.bio,
                language: user.language,
                imagePath: profilPicture?.dataValues?.imagePath || "http://localhost:4900/images/default.jpg"
            };
        }));

        // On retourne directement un tableau d'utilisateurs
        return response.status(200).json(filteredUsers);

    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Erreur serveur." });
    }
}






}





























