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

  router: Router = new Router();

  userService = inject(UserService)
  authService = inject(AuthService);
  isAuthenticated = AuthService.isConnected();
  premiumService = inject(PremiumAccess);
  isPremium = false;

  menuOpen = false;

  constructor() {
    if (this.isAuthenticated) {
      this.authService.isConnected = true;
    }
  }

  accueil() {
    this.router.navigate([""]);
  }

  inscription() {
    this.router.navigate(["inscription"]);
  }

  connexion() {
    this.router.navigate(["connexion"]);
  }

  ngOnInit() {
    this.checkPremiumStatus()
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      document.body.classList.add('hide-content-below-header');
    } else {
      document.body.classList.remove('hide-content-below-header');
    }
  }


  tarifs() {
    this.router.navigate(["tarifs"]);
  }


  deconnexion() {
    // document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure";
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    this.isAuthenticated = false;
    this.authService.isConnected = false;
    console.log("Cookie 'auth' supprimé");
    this.router.navigate([""]);
    localStorage.clear();


  }


  showProfil() {
    // const data = this.getUserData();
    // console.log(data)
    this.router.navigate(["profil"]);
  }

  goChat() {

    this.router.navigate(["chat"]);
  }


  contact() {
    this.router.navigate(["contact"])
  }




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
