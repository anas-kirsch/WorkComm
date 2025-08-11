import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PremiumAccess } from '../service/premium-access';


@Component({
  selector: 'app-header-component',
  imports: [],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css'
})
export class HeaderComponent {

  constructor(private router: Router) { } // Injection du Router
  premiumService = inject(PremiumAccess);
  isPremium = false;

  menuOpen = false;

  ngOnInit(): void {
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


  tarifs() {
    this.router.navigate(["tarifs"]);
  }

  contact() {
    this.router.navigate(["contact"])
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      document.body.classList.add('hide-content-below-header');
    } else {
      document.body.classList.remove('hide-content-below-header');
    }
  }

  // async checkPremiumStatus() {
  //   const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
  //     const [key, value] = cookie.trim().split('=');
  //     acc[key] = value;
  //     return acc;
  //   }, {});
  //   if (cookies['auth']) {
  //     try {
  //       const data = JSON.parse(decodeURIComponent(cookies['auth']));
  //       this.isPremium = !!data.premium;
  //     } catch {
  //       this.isPremium = false;
  //     }
  //   } else {
  //     this.isPremium = false;
  //   }
  // }



}
