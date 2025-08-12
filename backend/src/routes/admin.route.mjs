import express from "express"
import { adminController } from "../controllers/admin.controller.mjs";
import  {accessForAdminOnly} from "../middlewares/admin.middleware.mjs"

const router = express.Router();


/**
 * cette route : A FINIR
 */
router.post("/admin-register",accessForAdminOnly,adminController.adminRegister);


/**
 * cette route permet à un administrateur de ban un utilisateur 
 */
router.delete("/admin-ban-user",accessForAdminOnly, adminController.adminBanUser)



export default router; 