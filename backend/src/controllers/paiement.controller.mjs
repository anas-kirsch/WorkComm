
import express from "express"
import Stripe from "stripe";
import { paimentAccepted, premiumIsTrue } from "../models/paiement.model.mjs";

const stripe = new Stripe(process.env.STRIPE_KEY);


export class paiementController {

    /**
     * cette methode static permet de faire les paiment stripe pour l'option premium du site 
     * @param {*} request 
     * @param {*} response 
     */
    static async paiementPremiumOption(request, response) {
        try {
            // Ici tu définis ton produit premium
            if (!request.user || !request.user.id) {
                return response.status(401).json({ error: "Utilisateur non authentifié." });
            }
            const userId = request.user.id;

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: 'Offre Premium',
                            },
                            unit_amount: 1990, // prix en centimes (19,90€)
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `http://192.168.1.248:4200/success-paiement?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}`,
                cancel_url: 'http://192.168.1.248:4200/failure-paiement',
                metadata: { user_id: userId }
            });

            response.json({ sessionId: session.id });

        } catch (err) {
            console.error("Erreur Stripe:", err);
            response.status(500).json({ error: err.message });
        }
    }

    static async handleCheckoutCompleted(session) {
        const userId = session.metadata.user_id;
        console.log("Webhook reçu, userId:", userId);
        const result = await paimentAccepted(userId);
        console.log("Résultat paimentAccepted:", result);
    }


    static async getPremiumStatus(request, response) {
        try {
            if (!request.user || !request.user.id) {
                return response.status(401).json({ error: "Utilisateur non authentifié." });
            }
            const userId = request.user.id;

            // interaction avec le model 
            const getPremiumStatus = await premiumIsTrue(userId);

            if (!getPremiumStatus) {
                return response.status(404).json({ error: "Utilisateur non trouvé." });
            }

            // return la reponse en cas de succes
            return response.status(200).json(getPremiumStatus);

        } catch (error) {
            console.error("Erreur dans la recuperation du status:", err);
            response.status(500).json({ error: err.message });
        }
    }


}



