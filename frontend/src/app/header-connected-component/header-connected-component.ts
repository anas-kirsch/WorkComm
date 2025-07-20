import { Component, inject } from '@angular/core';
import { User } from '../interfaces/user';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth-service';

@Component({
  selector: 'app-header-connected-component',
  imports: [],
  templateUrl: './header-connected-component.html',
  styleUrl: './header-connected-component.css'
})
export class HeaderConnectedComponent {

  router: Router = new Router();

  authService = inject(AuthService);
  isAuthenticated = AuthService.isConnected();

  constructor() {
    if (this.isAuthenticated) {
      this.authService.isConnected = true;
    }

  }

   accueil(){
    this.router.navigate([""]);
  }

  ngOnInit() {
    // console.log(this.getProfilPicture())

    // a voir 
  }


  getProfilPicture(): User | null {
    // Récupère tous les cookies
    const cookies = document.cookie.split('; ');
    // Trouve le cookie 'auth'
    const authCookie = cookies.find(row => row.startsWith('auth='));
    if (!authCookie) return null;

    // Extrait la valeur et la décode
    const authValue = authCookie.split('=')[1];
    const decoded = decodeURIComponent(authValue);

    // Parse en objet JS
    try {
      const authData = JSON.parse(decoded);
      // Exemple d'accès à l'image
      // console.log(authData.imagePath)
      return authData;
    } catch (e) {
      console.error('Erreur de parsing du cookie auth', e);
      return null;
    }
  }

  deconnexion() {
    // Supprime le cookie 'auth'
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure";
    // Met à jour l'état d'authentification
    this.isAuthenticated = false;
    this.authService.isConnected = false;
    console.log("Cookie 'auth' supprimé");

    this.router.navigate([""]);

  }


  showProfil(){
    this.router.navigate(["profil"]);
  }





}
