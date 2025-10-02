import { Component, Inject, inject } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { InscriptionComponent } from '../inscription-component/inscription-component';

import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth-service';
import { inject as angularInject, OnInit } from '@angular/core';
import { CookieBannerComponent } from '../cookie-banner-component/cookie-banner-component';


@Component({
  selector: 'app-home-component',
  imports: [FooterComponent, CookieBannerComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css'
})

export class HomeComponent {
  /**
   * Router Angular pour la navigation entre les pages
   */
  router: Router = new Router()

  /** Service d'authentification */
  authService = inject(AuthService)

  /** Indique si l'utilisateur a accepté les cookies */
  cookieAccepted: Boolean = false;

  /** Navigue vers la page d'inscription */
  inscription() {
    this.router.navigate(["inscription"]);
  }

  /** Navigue vers la page de profil utilisateur */
  showProfil() {
    this.router.navigate(["profil"]);
  }

  /**
   * Vérifie l'état d'acceptation des cookies dans le localStorage
   */
  cookieState() {
    let CookieAccepted = localStorage.getItem("cookie-choice")
    // console.log(CookieAccepted)  
    
    if(CookieAccepted === "true"){
      this.cookieAccepted = true
    }
  }

  /**
   * Hook d'initialisation du composant : vérifie l'état des cookies
   */
  ngOnInit(){
    this.cookieState();
  }
  

}

