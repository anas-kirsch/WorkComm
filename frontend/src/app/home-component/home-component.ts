import { Component } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { InscriptionComponent } from '../inscription-component/inscription-component';

import { Router } from '@angular/router';
@Component({
  selector: 'app-home-component',
  imports: [FooterComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css'
})
export class HomeComponent {
  router: Router = new Router()

  inscription() {
    this.router.navigate(["inscription"]);
  }


}
