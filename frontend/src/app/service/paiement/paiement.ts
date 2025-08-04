import { Injectable } from '@angular/core';
import { TarifsComponent } from '../../tarifs-component/tarifs-component';
import { environment } from '../../../environments/environment.development';
import { loadStripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class Paiement {

  static apiURL = environment.apiURL;
  static stripePublicKey = environment.stripePublicKey;


  async buyPremium() {
    // Appel backend avec fetch
    const response = await fetch(`${Paiement.apiURL}/api/paiement/stripe/premium`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product: 'premium' })
    });
    const data = await response.json();

    // Redirection vers Stripe Checkout
    const stripe = await loadStripe(environment.stripePublicKey);
    if (stripe && data.sessionId) {
      stripe.redirectToCheckout({ sessionId: data.sessionId });
    }
  }
}
