import express from "express"
import {authController} from "../controllers/auth.controller.mjs"

const router = express.Router();


/**
 * cette route permet à un utilisateur inscris de se connecter 
 */
router.post("/login", authController.login)


/**
 * cette route permet à un utilisateur de réinitialiser son mot de passe 
 */
router.post("/reset-password", authController.resetPassword)



/**
 * cette router permet à l'utilisateur par le biai d'un formulaire d'entrer un nouveau mot de passe pour son compte 
 */
router.put("/change-password", authController.passwordUpdater)



export default router; 