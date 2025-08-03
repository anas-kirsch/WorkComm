
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
            const { amount, currency, paymentMethodId } = request.body;

            // Créer un PaymentIntent Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount, // en centimes (ex: 999 pour 9,99€)
                currency : "eur",
                payment_method: paymentMethodId,
                confirm: true,
            });

            response.status(200).json({ success: true, paymentIntent });
        } catch (error) {
            response.status(400).json({ success: false, error: error.message });
        }
    }



}


