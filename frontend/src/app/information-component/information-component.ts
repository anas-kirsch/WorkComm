import { Component } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { Router } from '@angular/router';



@Component({
  selector: 'app-information-component',
  imports: [FooterComponent],
  templateUrl: './information-component.html',
  styleUrl: './information-component.css'
})
export class InformationComponent {
  router: Router = new Router()


  connexion() {
    this.router.navigate(["connexion"]);
  }




}
