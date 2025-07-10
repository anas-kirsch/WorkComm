
import express from "express";
import { PrivateChatController } from "../controllers/chat.private.controller.mjs";
import { getClientTokenAndVerifAccess } from "../middlewares/getClientTokenAndVerifAccess.mjs";
import multer from "multer";
const upload = multer();

const router = express.Router();

/**
 * cette router créer une conversation entre deux amis
 */
router.post('/private-chat', getClientTokenAndVerifAccess,PrivateChatController.privateChat);


/**
 * cette route permet d'enregistrer les messages envoyés dans une conversation entre deux amis ainsi il seront sauvegarder
 */
router.post("/send-private-message", getClientTokenAndVerifAccess, PrivateChatController.sendPrivateMessage);


/**
 * cette route permet à un utilisateur de mettre à jour un message envoyé dans une conversation privée
 */
router.put("/update-private-message", getClientTokenAndVerifAccess, PrivateChatController.updatePrivateMessage);


/**
 * cette router permet à un utilisateur de supprimer un message avec actualisation en BDD
 */
router.delete("/delete-private-message",upload.none(), getClientTokenAndVerifAccess, PrivateChatController.deletePrivateMessage);



/**
 * cette route permet à un utilisateur lorsque qu'il clique sur un chat existant avec un amis de recuperer l'historique de conversation
 */
router.post("/getAll-private-message", getClientTokenAndVerifAccess, PrivateChatController.getAllPrivateMessage);




export default router;
