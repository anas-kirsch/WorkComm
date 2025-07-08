
import express from "express";
import { PrivateChatController } from "../controllers/chat.private.controller.mjs";
import { getClientTokenAndVerifAccess } from "../controllers/getClientTokenAndVerifAccess.mjs";


const router = express.Router();


/**
 * 
 */
router.post('/private-chat',getClientTokenAndVerifAccess,PrivateChatController.privateChat);



export default router;