import { Component, inject } from '@angular/core';
import { FooterComponent } from '../app/footer-component/footer-component';
import { AuthService } from '../app/service/auth/auth-service';
import { Router } from '@angular/router';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../environments/environment.development';


@Component({
  selector: 'app-tarifs-component',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './tarifs-component.html',
  styleUrl: './tarifs-component.css'
})
export class TarifsComponent {

  authService = inject(AuthService)
  router : Router = new Router();
  // stripePromise = loadStripe('pk_test_...'); // Mets ta clé publique Stripe ici
  static apiURL = environment.apiURL;

  goConnect(){
    this.router.navigate(["connexion"])
  }

  // async AbonnementPremium(){
  //   const stripe = await this.stripePromise;
  //   // Crée un PaymentMethod avec Stripe Elements (à intégrer dans ton HTML)
  //   // Ici, on suppose que tu as déjà récupéré un paymentMethodId côté frontend
  //   const paymentMethodId = 'pm_card_visa'; // À remplacer par la vraie valeur Stripe Elements

  //   // Appelle ton backend pour créer le paiement
  //   const response = await fetch(`${AuthService.apiURL}/api/paiement/stripe/premium`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       amount: 999, // en centimes
  //       currency: 'eur',
  //       paymentMethodId
  //     })
  //   });

  //   const result = await response.json();
  //   if (result.success) {
  //     alert('Paiement réussi !');
  //   } else {
  //     alert('Erreur paiement : ' + result.error);
  //   }
  // }

  // async fetchPaiement(){
  //   // Optionnel : pour d'autres appels liés au paiement
  // }
}