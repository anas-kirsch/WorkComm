import express from "express"
import { findConversation, createConversation } from "../models/chat.private.model.mjs"



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


    









}