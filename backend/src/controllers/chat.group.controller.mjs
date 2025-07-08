import express from "express"
import { createChatGroup,
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
    getGroupMessages } from "../models/chat.group.model.mjs"

export class GroupChatController {


    /**
     * cette methode static permet à un utilisateur de créer un groupe en invitant des membres au groupe 
     */
    static async groupChat(request, response) {

        try {

            const data = request.body;
            console.log(data);
            if (!data || !data.usersArray || !data.newGroupName) {
                return response.status(400).json({ error: "Données manquantes." });
            } else {

                // console.log(data.usersArray) // l'Array de tout les users invite au groupe ou y participant
                // console.log(data.newGroupName)// le nom du groupe 

                let usersArray = data.usersArray;
                if (typeof usersArray === "string") {
                    try {
                        usersArray = JSON.parse(usersArray);
                    } catch (error) {
                        return response.status(400).json({ error: "usersArray mal formé" });
                    }
                }
                if (!Array.isArray(usersArray) || usersArray.length === 0) {
                    return response.status(400).json({ error: "usersArray doit être un tableau non vide" });
                }


                // enregistre dans la table groupName le nom du groupe qui vient d'etre créer 
                const newGroup = await createChatGroup(data.newGroupName);

                // Si erreur dans l'ajout
                if (!newGroup) {
                    return response.status(500).json({
                        message: "impossible d'ajouter le groupe name en bdd",
                        body: data.newGroupName
                    })
                } else { //sinon

                    console.log("le groupe a bien été ajouter", data.newGroupName);

                    // une fois le nom de groupe enregistrer on récupère son id 
                    const getGroup = await getGroupId(data.newGroupName);

                    if (!getGroup) {
                        console.error("Impossible de récupérer l'id du groupe");
                        throw new Error("Impossible de récupérer l'id du groupe");
                    }

                    console.log("ID du groupe :", getGroup.id);


                    // insere le groupeId a chaque fois suivi des UserId qui sont dedans 
                    for (const oneUser of usersArray) {
                        const addUserToGroup = await addUserToGroupIfNotExists(getGroup.id, oneUser);

                        if (!addUserToGroup) {
                            throw new Error(`impossible d'ajouter a les UserId au groupe : ${getGroup.id}`)
                            console.error(`impossible d'ajouter a les UserId au groupe : ${getGroup.id}`);
                        }
                    }

                    // Récupère les membres du groupe pour la réponse
                    const members = await getAllGroupMember(getGroup.id);

                    response.status(201).json({
                        groupId: getGroup.id,
                        groupName: getGroup.group_name,
                        members: members.map(m => m.UserId)
                    });
                }
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    }


    /**
     * cette methode static permet d'ajouter un utilisateur comme nouveau membre dans un groupe existant
     */
    static async addGroupMember(request, response) {

        try {

            const data = request.body;
            console.log(data.newMemberId)
            console.log(data.groupId)

            if (!data) {
                return response.status(400).json({ error: "Données manquantes." });
            } else {

                const findGroup = await findGroup(data.groupId);

                if (!findGroup) {
                    return response.status(400).json({ error: "groupe inexistant." });

                }

                if (findGroup) {

                    const verifMemberExist = await isUserInGroup(data.groupId, data.newMemberId);

                    if (verifMemberExist) {
                        return response.status(400).json({ error: "membre deja dans le groupe." });
                    } {

                        const InsertNewMember = await addUserToGroup(data.groupId, data.newMemberId);

                        if (!InsertNewMember) {
                            return response.status(500).json({ error: "impossible d'ajouter cet utilisateur au groupe, reessayer.." })
                        }

                        if (InsertNewMember) {

                            return response.status(200).json({
                                message: `le nouveau membre du groupe a bien été ajouter : ${data.newMemberId}`,
                                body: {
                                    groupe: findGroup.group_name,
                                    id: data.newMemberId,
                                }
                            })
                        }

                    }

                }
            }

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }



    }


    /**
     * cette methode static permet à un utilisateur de quitter un groupe
     */
    static async quitGroup(request, response) {
        try {
            const userId = request.user.id;
            const data = request.body;
            console.log(userId);
            console.log(data.groupId);

            if (!data || !userId || !data.groupId) {
                return response.status(400).json({ error: "Données manquantes." });
            } else {
                const findGroup = await findGroup(data.groupId);

                if (!findGroup) {
                    return response.status(400).json({ error: "groupe inexistant." });
                }

                if (findGroup) {

                    const verifMemberExist = await isUserInGroup(data.groupId, userId);

                    if (!verifMemberExist) {
                        return response.status(400).json({ error: "membre du groupe introuvable." });
                    }

                    if (verifMemberExist) {
                        const deleteMember = await removeUserFromGroup(data.groupId, userId);

                        if (deleteMember) {
                            return response.status(200).json({
                                message: "vous avez bien quitté le groupe.",
                                memberId: userId,
                                groupId: data.groupId
                            });
                        } else {
                            return response.status(500).json({ error: "Erreur lors de la suppression du membre du groupe." });
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    }


    /**
    * cette methode static enregistre dans la table Messages le message envoyer par un utilisateur dans un groupe, puis apres cela il ajoute dans la table groupMessages 
    * l'id de celui qui l'a envoyer, dans quel groupe et l'id du message enregistrer préalablement afin de pouvoir toujours le retrouver
    */
    static async sendGroupMessage(request, response) {
        try {
            const userId = request.user.id;
            const { messageContent, groupId } = request.body;

            const MAX_MESSAGE_LENGTH = 2000;

            if (!messageContent || messageContent.length === 0) {
                return response.status(400).json({ error: "Le message ne peut pas être vide." });
            }
            if (messageContent.length > MAX_MESSAGE_LENGTH) {
                return response.status(400).json({ error: `Le message ne doit pas dépasser ${MAX_MESSAGE_LENGTH} caractères.` });
            }

            if (!messageContent || !userId || !groupId) {
                console.log(messageContent)
                console.log(groupId)
                console.log(userId)
                return response.status(400).json({ error: "Données manquantes." });
            }

            // Vérifie que l'utilisateur est membre du groupe
            const isMember = await isUserInGroup(groupId, userId);

            if (!isMember) {
                return response.status(403).json({ error: "Vous n'êtes pas membre de ce groupe." });
            }

            // Ajoute le message dans la table Messages
            const insertNewMessage = await createMessage(messageContent);

            if (!insertNewMessage) {
                console.error("impossible d'ajouter le message.");
                throw new Error("impossible d'ajouter le message");
            }

            let MessageID = insertNewMessage.dataValues.id;
            MessageID = JSON.stringify(MessageID)

            // Ajoute la liaison dans GroupMessage
            const newGroupMessage = await createGroupMessageLink(userId, groupId, MessageID);

            if (!newGroupMessage) {
                throw new Error("erreur : message non inséré dans la bdd");
            }

            return response.status(200).json({
                message: "Message enregistré, Historique à jour",
                body: {
                    userId,
                    groupId,
                    MessageID,
                    messageContent
                }
            });
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }





    }



    /**
     * cette methode static permet à un utilisateur de modifier un message qu'il à déjà envoyé dans un groupe
     */
    static async updateGroupMessage(request, response) {
        try {
            // data = Userid , message id , new message
            const userId = request.user.id;
            const { messageId, newMessage, groupId } = request.body;
            console.log({
                messageId,
                groupId,
                newMessage,
                userId
            });

            if (!messageId || !groupId || !newMessage || !userId) {
                return response.status(400).json({ error: "erreur données maquantes." })
            } else {

                if (newMessage.length > 2000) {
                    return response.status(400).json({ error: "Le message ne doit pas dépasser 2000 caractères." });
                }

                const verif = await findGroupMessageLink(userId, groupId, messageId);

                if (!verif) {
                    return response.status(403).json({ error: "Vous n'êtes pas autorisé à modifier ce message." });
                } else {

                    const changeMessage = await updateMessage(newMessage, messageId);

                    if (!changeMessage) {
                        return response.status(500).json({ error: "Impossible de modifier le message." });
                    }
                    return response.status(200).json({
                        body: { newMessage, userId, groupId },
                        message: "le message a bien été modifier"
                    })
                }
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    }


    /**
     * cette methode static permet à un utilisateur de supprimer un de ses messages dans un groupe 
     */
    static async deleteGroupMessage(request, response) {
        try {
            const userId = request.user.id;
            const { messageId, groupId } = request.body;

            if (!userId || !messageId || !groupId) {
                return response.status(400).json({ error: "Erreur données manquantes." });
            }

            // Vérifie que le lien existe et appartient à l'utilisateur
            const link = await findGroupMessageLink(userId, groupId, messageId);
            if (!link) {
                return response.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer ce message." });
            }

            // Supprime le lien et le message dans une transaction si possible
            const groupMessageDeleted = await deleteGroupMessageLink(userId, groupId, messageId);


            const message = await findMessage(messageId);
            if (!message) {
                return response.status(404).json({ error: "Message introuvable." });
            }

            const messageDeleted = await deleteMessage(messageId);

            if (!groupMessageDeleted || !messageDeleted) {
                return response.status(500).json({ error: "Erreur lors de la suppression du message." });
            }

            return response.status(200).json({
                message: "Le message a bien été supprimé.",
                body: { UserId: userId, GroupId: groupId }
            });
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    }


    /**
     * cette methode static permet de recuperer tout les messages d'un groupe, renvoie un array[] vide si aucun message
     */
    static async getAllGroupMessages(request, response) {
        try {
            const userId = request.user.id;
            const { groupId } = request.body;

            if (!userId || !groupId) {
                return response.status(400).json({ error: "Erreur données manquantes." })
            } else {
                const isUserInGroup = await isUserInGroup(groupId, userId);

                if (!isUserInGroup) {
                    return response.status(400).json({
                        error: `le user ${userId} n'est pas membre du groupe`
                    })
                }

                if (isUserInGroup) {
                    const getAllReferenced = await findAllGroupMessagesByGroupId(groupId);

                    if (!getAllReferenced || getAllReferenced.length === 0) {
                        return response.status(200).json({
                            message: "aucun message dans l'historique, commencez à chatter.",
                            body: []
                        });
                    } else {
                        // Récupère les IDs des messages
                        const messageIds = getAllReferenced.map(ref => ref.MessageID);
                        console.log("ID :", messageIds)

                        // Récupère tous les messages d'un coup
                        const getMessageContent = await getGroupMessages(messageIds);

                        return response.status(200).json({
                            message: "Voici votre historique",
                            body: {
                                getAllReferenced,
                                getMessageContent,
                            }
                        })
                    }
                }
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }

    }




}