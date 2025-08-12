import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../interfaces/user';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth-service';
import { UserService } from '../service/user/user-service';
import { PremiumAccess } from '../service/premium-access';


@Component({
  selector: 'app-header-connected-component',
  imports: [CommonModule],
  templateUrl: './header-connected-component.html',
  styleUrl: './header-connected-component.css'
})

export class HeaderConnectedComponent {
  /**
   * Router Angular pour la navigation entre les pages
   */
  router: Router = new Router();

  /** Service utilisateur pour récupérer les infos de l'utilisateur connecté */
  userService = inject(UserService)
  /** Service d'authentification */
  authService = inject(AuthService);
  /** Indique si l'utilisateur est authentifié */
  isAuthenticated = AuthService.isConnected();
  /** Service pour vérifier l'accès premium */
  premiumService = inject(PremiumAccess);
  /** Indique si l'utilisateur est premium */
  isPremium = false;

  /** Indique si le menu mobile est ouvert */
  menuOpen = false;

  /**
   * Constructeur : met à jour l'état d'authentification si besoin
   */
  constructor() {
    if (this.isAuthenticated) {
      this.authService.isConnected = true;
    }
  }

  /** Navigue vers la page d'accueil */
  accueil() {
    this.router.navigate([""]);
  }

  /** Navigue vers la page d'inscription */
  inscription() {
    this.router.navigate(["inscription"]);
  }

  /** Navigue vers la page de connexion */
  connexion() {
    this.router.navigate(["connexion"]);
  }

  /**
   * Hook d'initialisation du composant : vérifie le statut premium
   */
  ngOnInit() {
    this.checkPremiumStatus()
  }

  /**
   * Ouvre ou ferme le menu mobile et applique la classe CSS correspondante au body
   */
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      document.body.classList.add('hide-content-below-header');
    } else {
      document.body.classList.remove('hide-content-below-header');
    }
  }

  /** Navigue vers la page des tarifs */
  tarifs() {
    this.router.navigate(["tarifs"]);
  }

  /**
   * Déconnecte l'utilisateur, supprime le cookie et le localStorage, puis redirige vers l'accueil
   */
  deconnexion() {
    // document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure";
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    this.isAuthenticated = false;
    this.authService.isConnected = false;
    console.log("Cookie 'auth' supprimé");
    this.router.navigate([""]);
    localStorage.clear();
  }

  /** Navigue vers la page de profil utilisateur */
  showProfil() {
    // const data = this.getUserData();
    // console.log(data)
    this.router.navigate(["profil"]);
  }

  /** Navigue vers la page de chat */
  goChat() {
    this.router.navigate(["chat"]);
  }

  /** Navigue vers la page de contact */
  contact() {
    this.router.navigate(["contact"])
  }




  /**
   * Vérifie le statut premium de l'utilisateur à partir du cookie 'auth'
   */
  async checkPremiumStatus() {
    const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    if (cookies['auth']) {
      try {
        const data = JSON.parse(decodeURIComponent(cookies['auth']));
        this.isPremium = !!data.premium;
        console.log("1 : ",this.isPremium)
      } catch {
        this.isPremium = false;
        console.log("2 : ",this.isPremium)
      
      }
    } else {
      this.isPremium = false;
    }
  }



}
