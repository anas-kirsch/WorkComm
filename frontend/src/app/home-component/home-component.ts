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
  router: Router = new Router()
  authService = inject(AuthService)
  cookieAccepted: Boolean = false;

  inscription() {
    this.router.navigate(["inscription"]);
  }

  showProfil() {
    this.router.navigate(["profil"]);
  }

  cookieState() {
    let CookieAccepted = localStorage.getItem("cookie-choice")
    console.log(CookieAccepted) 
    
    if(CookieAccepted === "true"){
      this.cookieAccepted = true
    }
  }


  ngOnInit(){
    this.cookieState();
  }
  



}

