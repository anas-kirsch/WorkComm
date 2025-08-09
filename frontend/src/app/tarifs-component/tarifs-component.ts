import { Component, inject, OnInit } from '@angular/core';
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
  subscriptionStatus : boolean = false;
  router: Router = new Router();
  // stripePromise = loadStripe('pk_test_...'); // Mets ta clé publique Stripe ici
  // static apiURL = environment.apiURL;
  // static stripePublicKey = environment.stripePublicKey;



  goConnect() {
    this.router.navigate(["connexion"])
  }

  ngOnInit() {
    const premiumState = this.getPremiumFromCookie();
    console.log(premiumState)
    if (premiumState === true) {
      this.subscriptionStatus = true;
    }

  }

  getPremiumFromCookie(): boolean {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth='));
    if (!authCookie) return false;
    try {
      const authValue = decodeURIComponent(authCookie.split('=')[1]);
      const authObj = JSON.parse(authValue);
      return !!authObj.premium;
    } catch {
      return false;
    }
  }




}



