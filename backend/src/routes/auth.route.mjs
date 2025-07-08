
import express from "express"
import {authController} from "../controllers/auth.controller.mjs"

const router = express.Router();


/**
 * cette route permet à un utilisateur inscris de se connecter 
 */
router.post("/login",authController.login)







export default router; 