import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer-component',
  imports: [],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.css'
})
export class FooterComponent {

  router : Router = new Router();

  goPrivacyPolicyAndTerms(){
    this.router.navigate(["goPrivacyPolicyAndTerms"])
  }

}
