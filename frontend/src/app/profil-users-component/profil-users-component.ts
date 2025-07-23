import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { FriendsService } from '../service/friends/friends-service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-profil-users-component',
  imports: [CommonModule],
  templateUrl: './profil-users-component.html',
  styleUrl: './profil-users-component.css'
})
export class ProfilUsersComponent {
  router : Router = new Router();


   friendService = inject(FriendsService)


  

}
