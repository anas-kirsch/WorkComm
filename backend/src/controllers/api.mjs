// dependances externes du projet 
import { json, Op, Sequelize } from "sequelize";
import express, { request, response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import parseFormData from '@trojs/formdata-parser';
import fileUpload from "express-fileupload";
import { get } from "http";
import jwt from "jsonwebtoken"
import fs from "fs/promises";
import { error, group } from "console";
import { getgroups } from "process";

// dépendances internes du projet
import { User } from "./database.mjs";
import { getAndSaveProfilPicture } from "./models/getAndSaveProfilPicture.mjs";
import { profilPicture } from "./database.mjs";
import { getProfilPictureFromDataB } from "./models/getAndSaveProfilPicture.mjs"
import { getClientTokenAndVerifAccess } from "./models/getClientTokenAndVerifAccess.mjs";
import { groupName } from "./database.mjs";
import { groupMembers } from "./database.mjs";
import { conversation } from "./database.mjs";
import { sequelize } from "./database.mjs";
import { Friends } from "./database.mjs";
import { Message } from "./database.mjs";
import { GroupMessage } from "./database.mjs";
import { privateMessage } from "./database.mjs";
import { stringify } from "querystring";
import { Json } from "sequelize/lib/utils";
import { publicDecrypt, verify } from "crypto";

const secret = process.env.SECRET_KEY ?? "secret-key";


/**
 * 
 * @param {Sequelize} sequelize 
 */
export function runServer(sequelize) {
    const app = express();
    const port = 4900;
    app.use(cors());

    app.use(express.static("../public"));

    app.use(express.json());
    // app.use(fileUpload({
    //     limits: { fileSize: 2 * 1024 * 1024 },
    // }));
    app.use(fileUpload());


   

    /**
     * cette route doit permettre a l'admin de supprimer des utilisateur 
     * 
    */
    // app.delete("/admin/delete/:userId", async (request, response) => {

    //     try {

    //         const userId = request.params
    //         const getUserToDelete = await User.findByPk(userId);
    //         // console.log(getUserToDelete);
    //         const getPicUser = await profilPicture.findOne({ where: { UserId: userId } });
    //         console.log("------>", getPicUser)

    //         const getHisFriends = await Friends.findAll({
    //             where: { [Op.or]: { UserId: userId, friendId: userId } }
    //         })


    //         if (getUserToDelete && getPicUser) {
    //             await getUserToDelete.destroy();
    //             await getPicUser.destroy();

    //             const imagePath = getPicUser.imagePath;
    //             const pathFile = "/images" + imagePath.split("/images").pop();
    //             console.log(pathFile);

    //             try {
    //                 await fs.unlink(`../public${pathFile}`);
    //                 console.log("Fichier supprimé :", pathFile);
    //             } catch (err) {
    //                 console.error("Erreur lors de la suppression du fichier :", err);
    //             }


    //             if (getUserToDelete && getHisFriends.length > 0) {
    //                 for (const friend of getHisFriends) {
    //                     await friend.destroy();
    //                 }
    //                 response.status(200).json("Votre utilisateur a bien été supprimé")

    //             } else {
    //                 response.status(200).json("Votre utilisateur a bien été supprimé")

    //             }
    //         }

    //     } catch (error) {
    //         console.error(error);
    //         response.status(500).json({ error: "Erreur serveur." });

    //     }


    // })









    // group






    // private 



    /**
     * cette route permet un utilisateur d'envoyer un message a son ami 
     */
    app.post("/send-private-message", getClientTokenAndVerifAccess, async (request, response) => {

        try {

            const UserId = request.user.id;
            const { messageContent, friendId, group_name } = request.body;

            if (!UserId || !messageContent || !friendId || !group_name) {
                return response.status(400).json("Erreur données manquantes.");
            }

            console.log({
                UserId, messageContent, friendId, group_name
            })

            const MAX_MESSAGE_LENGTH = 2000;

            if (messageContent.length === 0) {
                return response.status(400).json({ error: "Le message ne peut pas être vide." });
            }
            if (messageContent.length > MAX_MESSAGE_LENGTH) {
                return response.status(400).json({ error: `Le message ne doit pas dépasser ${MAX_MESSAGE_LENGTH} caractères.` });
            }


            const verifConversationExist = await conversation.findOne({
                where: { UserId: UserId, friendId: friendId, chat_name: group_name }
            })

            console.log('test 1', verifConversationExist);

            if (!verifConversationExist) {
                return response.status(404).json({ error: "Conversation introuvable." })
            }

            console.log("success")//

            const insertNewMessage = await Message.create({
                content: messageContent,
            });

            if (!insertNewMessage) {
                console.error("impossible d'ajouter le message.");
                throw new Error("impossible d'ajouter le message");
            }

            let MessageID = insertNewMessage.dataValues.id;
            MessageID = JSON.stringify(MessageID)

            const sendMessage = await privateMessage.create({
                SenderId: UserId,
                receiverId: friendId,
                ConversationId: verifConversationExist.id,
                MessageId: MessageID
            })

            if (!sendMessage) {
                const destroy = await Message.destroy({
                    where: { id: MessageID }
                })
            }

            return response.status(200).json({
                message: "message bien envoyé, Historique à jour.",
                body: {
                    UserId,
                    friendId,
                    group_name,
                    messageContent,
                    MessageID
                }
            })

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }




    })


    /**
     * permet de modifier un message dans un chat privée avec un ami
     */
    app.put("/update-private-message", getClientTokenAndVerifAccess, async (request, response) => {
        try {

            const UserId = request.user.id;
            const { messageId, newMessage, group_name } = request.body;
            console.log({
                UserId,
                messageId,
                newMessage,
                group_name
            });

            if (!messageId || !group_name || !newMessage || !UserId) {
                return response.status(400).json("erreur données maquantes.")
            }

            const conversationID = await conversation.findOne({
                where: {
                    chat_name: group_name
                }
            })

            if (!conversationID) {
                console.error("id de conversation introuvable.");
                throw new error("id de conversation introuvable.");
            }

            const verifConversationExist = await privateMessage.findOne({
                where: {
                    SenderId: UserId,
                    ConversationId: conversationID.dataValues.id,
                    MessageId: messageId
                }
            })

            if (!verifConversationExist) {
                return response.status(404).json({ error: "message inexistante. " })
            } else {

                console.log(conversationID)

                const changeMessage = await Message.update(
                    { content: newMessage }, // champs à mettre à jour
                    { where: { id: messageId } }    // condition de sélection
                );


                if (!changeMessage) {
                    throw new Error("impossible de modifier le message ")
                }

                if (changeMessage) {

                    return response.status(200).json({

                        body: { newMessage, UserId, group_name },
                        message: "le message a bien été modifier"
                    })

                }
            }

        } catch (error) {
            return response.status(500).json({ error: error.message || "Erreur serveur" });
        }

    })


    /**
     * permet de supprimer un message chat privée envoyer à un ami
     */
    app.delete('/delete-private-message', getClientTokenAndVerifAccess, async (request, response) => {
        try {
            const UserId = request.user.id;
            const { messageId, group_name } = request.body;

            if (!UserId || !messageId || !group_name) {
                return response.status(400).json("Erreur données manquantes.");
            }

            const conversationID = await conversation.findOne({
                where: { chat_name: group_name }
            });

            if (!conversationID) {
                console.error("id de conversation introuvable.");
                throw new Error("id de conversation introuvable.");
            }

            const verifConversationExist = await privateMessage.destroy({
                where: {
                    SenderId: UserId,
                    ConversationId: conversationID.dataValues.id,
                    MessageId: messageId
                }
            });

            const delMessage = await Message.destroy({
                where: { id: messageId }
            });

            if (verifConversationExist === 0 || delMessage === 0) {
                return response.status(500).json({ error: "Erreur lors de la suppression du message." });
            }

            return response.status(200).json({
                message: "Le message a bien été supprimé.",
                body: { UserId, group_name }
            });

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    });


    /**
     * cette route permet de recuperer tout les messages d'un chat privée avec un ami
     */
    app.post('/getAll-private-message', getClientTokenAndVerifAccess, async (request, response) => {
        try {
            const UserId = request.user.id;
            const { group_name } = request.body;

            if (!UserId || !group_name) {
                return response.status(400).json({ error: "Erreur données manquantes." });
            }

            const conversationID = await conversation.findOne({
                where: { chat_name: group_name }
            });

            // console.log("test",conversationID)

            if (!conversationID) {
                return response.status(404).json({ error: "Conversation introuvable." });
            }

            const getAllReferenced = await privateMessage.findAll({
                where: { ConversationId: conversationID.id }
            });



            if (!getAllReferenced || getAllReferenced.length === 0) {
                return response.status(200).json({
                    message: "Aucun message dans l'historique, commencez à chatter.",
                    body: []
                });
            }

            // Récupère les IDs des messages
            const messageIds = getAllReferenced.map(ref => ref.MessageId);

            // console.log(messageIds)

            // Récupère tous les messages d'un coup, triés par date si possible
            const getMessageContent = await Message.findAll({
                where: { id: messageIds },
                order: [['createdAt', 'ASC']] // enlève cette ligne si tu n'as pas de champ createdAt
            });

            return response.status(200).json({
                message: "Voici votre historique",
                body: {
                    references: getAllReferenced,
                    messages: getMessageContent
                }
            });

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    });




    app.listen(port, () => {

        console.log(`Server listen on port ${port}`)
    })

}

