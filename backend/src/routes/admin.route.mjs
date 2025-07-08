
import express from "express"
import { adminController } from "../controllers/admin.controller.mjs";

const router = express.Router();


/**
 * cette route : A FINIR
 */
router.post("/admin-register",adminController.adminRegister);




export default router; 