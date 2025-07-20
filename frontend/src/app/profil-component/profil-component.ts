import { Component } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profil-component',
  imports: [FooterComponent],
  templateUrl: './profil-component.html',
  styleUrl: './profil-component.css'
})
export class ProfilComponent {

  router : Router = new Router();

 



}


