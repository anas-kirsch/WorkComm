
import express from "express"
import { paiementController } from "../controllers/paiement.controller.mjs";

const router =  express.Router();


/**
 * cette route permet de faire le paiment de l'abonnement premium
 */
router.post('/stripe/premium',paiementController.paiementPremiumOption)


export default router;