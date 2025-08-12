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
  /**
   * Constructeur : injection du Router pour la navigation
   */
  constructor(private router: Router) { }

  /** Service pour vérifier l'accès premium */
  premiumService = inject(PremiumAccess);
  /** Indique si l'utilisateur est premium */
  isPremium = false;

  /** Indique si le menu mobile est ouvert */
  menuOpen = false;

  /**
   * Hook d'initialisation du composant (non utilisé ici)
   */
  ngOnInit(): void {
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

  /** Navigue vers la page des tarifs */
  tarifs() {
    this.router.navigate(["tarifs"]);
  }

  /** Navigue vers la page de contact */
  contact() {
    this.router.navigate(["contact"])
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


}