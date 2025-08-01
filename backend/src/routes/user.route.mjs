
import express from "express";
import {UserController} from "../controllers/user.controller.mjs"
import { getClientTokenAndVerifAccess } from "../middlewares/getClientTokenAndVerifAccess.mjs";
import multer from "multer";
import { User } from "../models/database.mjs";
import { contactMail, getMailContent } from "../controllers/smtp.controller.mjs";
const upload = multer();

const router = express.Router();


/**
 * Cette route permet à un client du site de se créer un compte utilisateur 
 * upload a voir
 */
router.post("/register",UserController.register);


/**
 * Cette router permet à un client du site de se créer un compte utilisateur
 */
router.delete("/delete/user",getClientTokenAndVerifAccess,UserController.deleteUser);


/**
 * cette route permet à un client d'envoyer une demande d'ami a un utilisateur 
 */
router.post("/send-friend-requests",getClientTokenAndVerifAccess,UserController.sendFriendRequest)


/**
 * cette route permet à un utilisateur de récuperer ses demandes d'amis
 */
router.get("/friend-requests",getClientTokenAndVerifAccess,UserController.getFriendRequest)


/**
 * cette route permet à un utilisateur d'accepter une demande d'ami
 */
router.post("/confirm-friend-requests",getClientTokenAndVerifAccess,UserController.respondToFriendRequest)


/**
 * cette route permet de supprimer un ami 
 */
router.delete("/delete-friend",upload.none(),getClientTokenAndVerifAccess,UserController.deleteFriend);


/**
 * cette route permet à un utilisateur de récuperer ses amis 
 */
router.get("/myfriend", getClientTokenAndVerifAccess, UserController.getMyfriends);



/**
 * cette route permet à un utilisateur d'en chercher d'autre dans la table User
 */
router.post("/getUser",getClientTokenAndVerifAccess, UserController.getUserFromUserTable);



/**
 * recupere uniquement les données d'un utilisateurs à partir de son username 
 */
router.post('/getByUsername',getClientTokenAndVerifAccess, UserController.getByUsername)



/**
 * cette router verifie l'etat d'une demande d'ami
 */
router.post("/checkFriendRequestStatus", getClientTokenAndVerifAccess, UserController.checkFriendRequestStatus);




/**
 * cette route permet à un utilisateur de récuperer toute les demandes d'amis qu'il à envoyer encore en attente 
 */
router.get("/getPendingSentFriendRequests", getClientTokenAndVerifAccess, UserController.getPendingSentFriendRequests);




/**
 * cette route recupere le contenu d'un formulaire du frontend pour l'envoyer par mail à l'aide du protocol smtp
 */
router.post("/contact", getMailContent);






export default router;