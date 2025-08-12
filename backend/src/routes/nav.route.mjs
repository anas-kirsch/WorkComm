import express from "express"
import { NavController } from "../controllers/nav.controller.mjs";

const router =  express.Router();

/**
 * Cette route est la home page du site , // ajout d'un middlware : si le client a un jwt valid on lui renvoie ses infos sinon il doit se connecter ou s'inscrire
 */
router.get("/home",NavController.home)


export default router;