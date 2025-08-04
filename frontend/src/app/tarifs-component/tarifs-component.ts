import { Component, inject } from '@angular/core';
// import { FooterComponent } from './app/footer-component/footer-component';
import { Router } from '@angular/router';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { FooterComponent } from '../footer-component/footer-component';
import { AuthService } from '../service/auth/auth-service';
import { environment } from '../../environments/environment.development';
import { Paiement } from '../service/paiement/paiement';


@Component({
  selector: 'app-tarifs-component',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './tarifs-component.html',
  styleUrl: './tarifs-component.css'
})
export class TarifsComponent {

  authService = inject(AuthService)
  paiementService = inject(Paiement)

  router: Router = new Router();
  // stripePromise = loadStripe('pk_test_...'); // Mets ta clé publique Stripe ici
  // static apiURL = environment.apiURL;
  // static stripePublicKey = environment.stripePublicKey;

  

  goConnect() {
    this.router.navigate(["connexion"])
  }

}

