import express from "express"
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


export class PrivateChatController {


    /**
    * Crée ou récupère une conversation privée entre deux utilisateurs.
    * Retourne le nom de la room et l'id de la conversation.
    */
    static async privateChat(request, response) {

        try {

            const userId = request.user.id;
            // Récupère les id des deux utilisateurs qui vont chater ensemble
            const { friendUserId } = request.body;


            if (!userId || !friendUserId) {
                return response.status(400).json({ error: "Données manquantes." });
            }

            // Génère le nom unique de la room
            const [id1, id2] = [userId, friendUserId].sort((a, b) => a - b);
            const chatName = `${id1}/${id2}`;

            // Vérifie ou crée la conversation
            let conv = await findConversation(chatName);

            if (!conv) {
                conv = await createConversation(chatName, id1, id2)
            }

            // Renvoie au client le nom de la room et l'id de la conversation
            response.status(200).json({
                chat_name: chatName,
                conversationId: conv.id
            });

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }



    }



    
    static async sendPrivateMessage(request, response) {
        try {
            const userIdNum = Number(request.user.id);
            const { messageContent, friendId, conversationName } = request.body;

            if (!userIdNum || !messageContent || !friendId || !conversationName) {
                return response.status(400).json({ error: "Erreur données manquantes." });
            }
            console.log({
                userId: userIdNum, messageContent, friendId, conversationName
            });

            const MAX_MESSAGE_LENGTH = 2000;

            if (messageContent.length === 0) {
                return response.status(400).json({ error: "Le message ne peut pas être vide." });
            }
            if (messageContent.length > MAX_MESSAGE_LENGTH) {
                return response.status(400).json({ error: `Le message ne doit pas dépasser ${MAX_MESSAGE_LENGTH} caractères.` });
            }

            // Trie les IDs comme lors de la création de la conversation
            const friendIdNum = Number(friendId);
            const [id1, id2] = [userIdNum, friendIdNum].sort((a, b) => a - b);

            // Recherche la conversation avec les IDs triés
            const verifConversationExist = await findPrivateConversation(id1, id2, conversationName);
            console.log("tetststtstt", verifConversationExist);

            if (!verifConversationExist) {
                return response.status(404).json({ error: "Conversation introuvable." })
            }

            const insertNewMessage = await createMessagePrivate(messageContent);

            if (!insertNewMessage) {
                console.error("impossible d'ajouter le message.");
                throw new Error("impossible d'ajouter le message");
            }

            let MessageID = insertNewMessage.dataValues.id;
            MessageID = JSON.stringify(MessageID)

            const sendMessage = await saveMessageHistory(userIdNum, friendIdNum, verifConversationExist.id, MessageID);

            if (!sendMessage) {
                const destroy = await deleteMessagePrivate(MessageID);
                return response.status(500).json({ error: "erreur impossible d'enregistrer ce message dans l'historique" })
            }

            return response.status(200).json({
                message: "message bien envoyé, Historique à jour.",
                body: {
                    userId: userIdNum,
                    friendId: friendIdNum,
                    conversationName,
                    messageContent,
                    MessageID
                }
            })

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    }



    /**
     * cette methode static permet à un utilisateur de modifier un message envoyé dans une conversation privée
     */
    static async updatePrivateMessage(request, response) {
        try {

            const userId = request.user.id;
            const { messageId, newMessage, conversationName } = request.body;
            console.log({
                userId,
                messageId,
                newMessage,
                conversationName
            });

            if (!messageId || !conversationName || !newMessage || !userId) {
                return response.status(400).json({ error: "erreur données maquantes." });
            }

            const conversationID = await findConversation(conversationName);

            if (!conversationID) {
                console.error("id de conversation introuvable.");
                return response.status(500).json({ error: "erreur : impossible de trouver la conversation" })
            }

            const verifConversationExist = await findPrivateMessage(userId, conversationID.dataValues.id, messageId);

            if (!verifConversationExist) {
                return response.status(404).json({ error: "message inexistante. " })
            } else {

                console.log(conversationID)

                const changeMessage = await updatePrivateMessageInDb(newMessage, messageId);

                if (!changeMessage) {
                    return response.status(500).json({ error: "erreur impossible de modifier le message" });
                }

                if (changeMessage) {
                    return response.status(200).json({
                        body: { newMessage, userId, conversationName, messageId },
                        message: "le message a bien été modifier"
                    })
                }
            }
        } catch (error) {
            return response.status(500).json({ error: error.message || "Erreur serveur" });
        }
    }



    /**
     * cette methode static permet de supprimer un message dans une conversation privée et met à jour les tables qui referencie l'id du message, son contenu et son envoyeur 
     */
    static async deletePrivateMessage(request, response) {
        try {
            const userId = request.user.id;
            const { messageId, conversationName } = request.body;

            if (!userId || !messageId || !conversationName) {
                return response.status(400).json({ error: "Erreur données manquantes." });
            }

            const conversationID = await findConversation(conversationName);

            if (!conversationID) {
                console.error("id de conversation introuvable.");
                return response.status(400).json({ error: "id de conversation introuvable." })
            }

            const verifConversationExist = await deletePrivateMessageLink(userId, conversationID.dataValues.id, messageId);

            const delMessage = await deleteMessagePrivate(messageId);

            if (verifConversationExist === 0 || delMessage === 0) {
                return response.status(500).json({ error: "Erreur lors de la suppression du message." });
            }

            return response.status(200).json({
                message: "Le message a bien été supprimé.",
                body: { userId, conversationName }
            });

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    }



    /**
     * cette route permet de recuperer tout les messages d'une conversation privée entre deux amis
     */
    static async getAllPrivateMessage(request, response) {

        try {
            const userId = request.user.id;
            const { conversationName } = request.body;

            if (!userId || !conversationName) {
                return response.status(400).json({ error: "Erreur données manquantes." });
            }
            const conversationID = await findConversation(conversationName);

            if (!conversationID) {
                return response.status(404).json({ error: "Conversation introuvable." });
            }

            const getAllReferenced = await getConversationMessages(conversationID.id);
            console.log("test 900:",getAllReferenced)

            if (!getAllReferenced || getAllReferenced.length === 0) {
                return response.status(200).json({
                    message: "Aucun message dans l'historique, commencez à chatter.",
                    body: []
                });
            }
            // Récupère les IDs des messages
            const messageIds = getAllReferenced.map(ref => ref.MessageId);

            // Récupère tous les messages d'un coup, triés par date si possible
            const getMessageContent = await getPrivateMessages(messageIds);
            console.log("test 1000:",getMessageContent)

            return response.status(200).json({
                message: "Voici votre historique",
                body: {
                    id: userId,
                    conversation: conversationName,
                    references: getAllReferenced,
                    messages: getMessageContent
                }
            });

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    }







}