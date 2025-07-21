import { Component, inject, Injector } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { Router } from '@angular/router';
import { UserService } from '../service/user/user-service';
// import { HeaderConnectedComponent } from '../header-connected-component/header-connected-component';

@Component({
  selector: 'app-profil-component',
  imports: [FooterComponent],
  templateUrl: './profil-component.html',
  styleUrl: './profil-component.css'
})
export class ProfilComponent {

  router : Router = new Router();

  userService =  inject(UserService)


}


