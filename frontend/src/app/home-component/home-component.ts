import { Component, inject } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { InscriptionComponent } from '../inscription-component/inscription-component';

import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth-service';
import { inject as angularInject } from '@angular/core';
@Component({
  selector: 'app-home-component',
  imports: [FooterComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css'
})
export class HomeComponent {
  router: Router = new Router()
  authService = inject(AuthService)

  

  inscription() {
    this.router.navigate(["inscription"]);
  }


}

