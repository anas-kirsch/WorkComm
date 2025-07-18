import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-component',
  imports: [],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css'
})
export class HeaderComponent {
  router : Router = new Router()

  accueil(){
    this.router.navigate([""]);
  }

  inscription(){
    this.router.navigate(["inscription"]);
  }

  connexion(){
    this.router.navigate(["connexion"]);
  }


}
 