// import { Component, inject } from '@angular/core';
import { FriendsService } from '../service/friends/friends-service';
import { Friends } from '../interfaces/user';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { ProfilUsersComponent } from '../profil-users-component/profil-users-component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-chat-component',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css'
})
export class ChatComponent {
  // router : Router = new Router();

  
  friendService = inject(FriendsService)


}










