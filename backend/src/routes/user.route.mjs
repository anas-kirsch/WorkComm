
import express from "express";
import {UserController} from "../controllers/user.controller.mjs"
import { getClientTokenAndVerifAccess } from "../middlewares/getClientTokenAndVerifAccess.mjs";
import multer from "multer";
const upload = multer();

const router = express.Router();


/**
 * Cette route permet à un client du site de se créer un compte utilisateur 
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






export default router;