import express from "express"
import { paiementController } from "../controllers/paiement.controller.mjs";
import getClientTokenAndVerifAccess from "../middlewares/getClientTokenAndVerifAccess.mjs";
import Stripe from "stripe";

const router =  express.Router();
const stripe = new Stripe(process.env.STRIPE_KEY);


/**
 * cette route permet de faire le paiment de l'abonnement premium
 */
router.post('/stripe/premium',getClientTokenAndVerifAccess, paiementController.paiementPremiumOption)


/**
 * cette router est directement appelé par stripe apres le paiement pour verification 
 */
router.post("/webhook", express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    console.log("le webhook est activé")
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            await paiementController.handleCheckoutCompleted(session);
        }

        res.status(200).send();
    } catch (err) {
        console.error("Webhook Error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});


/**
 * cette router permet de verifie si l'utilisateur a l'abonnement premium activé ou non 
 */
router.get('/status', getClientTokenAndVerifAccess, paiementController.getPremiumStatus);



export default router;