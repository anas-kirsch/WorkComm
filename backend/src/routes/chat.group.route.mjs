
import express from "express";
import { getClientTokenAndVerifAccess } from "../middlewares/getClientTokenAndVerifAccess.mjs";
import { GroupChatController } from "../controllers/chat.group.controller.mjs";
import multer from "multer";
const upload = multer();


const router = express.Router();


/**
 * cette route permet à un utilisateur de créer un groupe avec des membre invité
 */
router.post("/group-chat",getClientTokenAndVerifAccess, GroupChatController.groupChat);



/**
 * cette route permet d'ajouter un membre dans un groupe existant
 */
router.post("/add-group-member", getClientTokenAndVerifAccess, GroupChatController.addGroupMember);



/**
 * cette router permet à un utilisateur de quitter un groupe dans lequel il est présent
 */
router.delete("/quit-group-member", upload.none(), getClientTokenAndVerifAccess, GroupChatController.quitGroup);



/**
 * cette route enregistre dans la table Messages le message envoyer par un utilisateur dans un groupe, puis apres cela il ajoute dans la table groupMessages 
 * l'id de celui qui l'a envoyer, dans quel groupe et l'id du message enregistrer préalablement afin de pouvoir toujours le retrouver
 */
router.post("/send-group-message", getClientTokenAndVerifAccess, GroupChatController.sendGroupMessage);



/**
 * cette router permet de modifier un message deja envoyé dans un groupe
 */
router.put("/update-group-message", getClientTokenAndVerifAccess, GroupChatController.updateGroupMessage);



/**
 * cette route permet à un utilisateur de supprimer un de ses messages envoyé dans un groupe
 */
router.delete("/delete-group-message",  upload.none(), getClientTokenAndVerifAccess, GroupChatController.deleteGroupMessage);



/**
 * cette route permet de recuperer tout les messages envoyés par les membres d'un groupe 
 */
router.post("/getAll-group-message", getClientTokenAndVerifAccess, GroupChatController.getAllGroupMessages);




/**
 * cette route permet à un utilisateur de récupérer tout les groupes dans lequel il est (id des groupes et nom);
 */
router.get("/get-all-group-user", getClientTokenAndVerifAccess, GroupChatController.getUserGroups)







export default router;



