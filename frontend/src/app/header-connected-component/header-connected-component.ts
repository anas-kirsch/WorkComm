import { Component, inject } from '@angular/core';
import { User } from '../interfaces/user';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth-service';
import { UserService } from '../service/user/user-service';

@Component({
  selector: 'app-header-connected-component',
  imports: [],
  templateUrl: './header-connected-component.html',
  styleUrl: './header-connected-component.css'
})
export class HeaderConnectedComponent {

  router: Router = new Router();

  userService = inject(UserService)
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
    // const data = this.getUserData();
    // console.log(data)
    this.router.navigate(["profil"]);
  }





}
