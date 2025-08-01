import { Component, inject } from '@angular/core';
import { FooterComponent } from '../app/footer-component/footer-component';
import { AuthService } from '../app/service/auth/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tarifs-component',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './tarifs-component.html',
  styleUrl: './tarifs-component.css'
})
export class TarifsComponent {

  authService = inject(AuthService)
  router : Router = new Router();

  goConnect(){
    this.router.navigate(["connexion"])
  }
  
}


