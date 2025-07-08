
import express from "express"
import { findUser, findUserByUsernameOrMail, findUserOrCreate, getUserProfilPicture, getUserData} from "../models/user.model.mjs";
// import { findUserOrCreate } from "../models/user.model.mjs";
// import { getUserToDestroy } from "../models/user.model.mjs";
import nodemailer from 'nodemailer';
import { emailSender } from "./smtp.controller.mjs";
import { friendRequest, getUserFriend, getFriendRequest, getInverseFriendship, frienshipCreate, getFriendship, findAllFriendship } from "../models/friend.model.mjs"
import fs from 'fs/promises';
import { getProfilPictureFromDataB } from "../controllers/getAndSaveProfilPicture.mjs"


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
                        role: myNewUser.role,
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
     * Cette methode static permet à un utilisateur de supprimer son compte 
     */
    static async deleteUser(request, response) {

        try {

            // const { userId } = request.params;
            const userId = request.user.id;

            const getUserToDelete = await findUser(userId)
            // console.log(getUserToDelete);c

            const getPicUser = await getUserProfilPicture(userId);
            // console.log("------>", getPicUser)

            const getHisFriends = await getUserFriend(userId);


            if (getUserToDelete && getPicUser) {
                await getUserToDelete.destroy();
                await getPicUser.destroy();

                const imagePath = getPicUser.imagePath;
                const pathFile = "/images" + imagePath.split("/images").pop();
                console.log(pathFile);

                try {
                    await fs.unlink(`../public${pathFile}`);
                    console.log("Fichier supprimé :", pathFile);
                } catch (err) {
                    console.error("Erreur lors de la suppression du fichier :", err);
                }


                if (getUserToDelete && getHisFriends.length > 0) {
                    for (const friend of getHisFriends) {
                        await friend.destroy();
                    }
                    response.status(200).json("Votre utilisateur a bien été supprimé")

                } else {
                    response.status(200).json("Votre utilisateur a bien été supprimé")

                }
            }



        } catch (error) {

            console.error(error);
            response.status(500).json({ error: "Erreur serveur." });
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
            const friendId = request.body;
            console.log(userId, friendId);

            if (!userId || !friendId) {
                return res.status(400).json({ error: "Données manquantes ou invalides." });
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


    









}





















