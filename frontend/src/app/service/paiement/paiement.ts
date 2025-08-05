import { inject, Injectable } from '@angular/core';
import { TarifsComponent } from '../../tarifs-component/tarifs-component';
import { environment } from '../../../environments/environment.development';
import { loadStripe } from '@stripe/stripe-js';
import { AuthService } from '../auth/auth-service';

@Injectable({
  providedIn: 'root'
})
export class Paiement {

  static apiURL = environment.apiURL;
  static stripePublicKey = environment.stripePublicKey;

  authService = inject(AuthService);



  async buyPremium() {
    console.log("paiement lancé")

    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    // Appel backend avec fetch
    const response = await fetch(`${Paiement.apiURL}/api/paiement/stripe/premium`, {
      method: 'POST',
      headers: myHeaders,
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
