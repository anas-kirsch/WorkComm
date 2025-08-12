import { Component } from '@angular/core';
import { FooterComponent } from "../footer-component/footer-component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-paiement-component',
  imports: [FooterComponent],
  templateUrl: './success-paiement-component.html',
  styleUrl: './success-paiement-component.css'
})
export class SuccessPaiementComponent {

  router : Router = new Router();

  goHome(){
    this.router.navigate([""])
  }
}
