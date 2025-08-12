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

  // Service d'authentification pour récupérer les infos utilisateur
  authService = inject(AuthService)
  // Service de paiement pour gérer l'achat premium
  paiementService = inject(Paiement)
  // Statut d'abonnement premium de l'utilisateur
  subscriptionStatus : boolean = false;
  // Permet la navigation entre les routes Angular
  router: Router = new Router();


  goConnect() {
    // Redirige l'utilisateur vers la page de connexion
    this.router.navigate(["connexion"])
  }

  ngOnInit() {
    // Vérifie le statut premium au chargement du composant
    const premiumState = this.getPremiumFromCookie();
    console.log(premiumState)
    if (premiumState === true) {
      this.subscriptionStatus = true;
    }

  }

  getPremiumFromCookie(): boolean {
    // Récupère le statut premium depuis le cookie 'auth'
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth='));
    if (!authCookie) return false;
    try {
      // Décode la valeur du cookie et la parse en objet JS
      const authValue = decodeURIComponent(authCookie.split('=')[1]);
      const authObj = JSON.parse(authValue);
      // Retourne true si la propriété premium existe et est vraie
      return !!authObj.premium;
    } catch {
      // En cas d'erreur de parsing, retourne false
      return false;
    }
  }



}



