import { inject, Injectable } from '@angular/core';
import { TarifsComponent } from '../../tarifs-component/tarifs-component';
import { environment } from '../../../environments/environment.development';
import { loadStripe } from '@stripe/stripe-js';
import { AuthService } from '../auth/auth-service';

@Injectable({
  providedIn: 'root'
})
export class Paiement {

  // URL de l'API backend
  static apiURL = environment.apiURL;
  // Clé publique Stripe pour l'intégration du paiement
  static stripePublicKey = environment.stripePublicKey;

  // Service d'authentification pour récupérer le token utilisateur
  authService = inject(AuthService);



  async buyPremium() {
    // Lance le processus d'achat premium
    console.log("paiement lancé")

    // Récupère le token d'authentification pour sécuriser la requête
    const tokenHeader = this.authService.insertTokeninHeader();

    // Prépare les headers pour la requête HTTP
    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    // Appel backend pour créer une session Stripe Checkout
    const response = await fetch(`${Paiement.apiURL}/api/paiement/stripe/premium`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({ product: 'premium' })
    });
    const data = await response.json();

    // Redirection vers Stripe Checkout avec la session reçue du backend
    const stripe = await loadStripe(environment.stripePublicKey);
    if (stripe && data.sessionId) {
      stripe.redirectToCheckout({ sessionId: data.sessionId });
    }
  }
}
