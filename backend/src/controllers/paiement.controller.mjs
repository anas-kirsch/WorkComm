
import express, { request, response } from "express"
import Stripe from "stripe";

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
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Offre Premium',
                        },
                        unit_amount: 1990, // prix en centimes (19,90€)
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: 'http://192.168.1.248:4200/success-paiement',
                cancel_url: 'http://192.168.1.248:4200/failure-paiement',
            });
            response.json({ sessionId: session.id });
        } catch (err) {
            response.status(500).json({ error: err.message });
        }
    }



}


