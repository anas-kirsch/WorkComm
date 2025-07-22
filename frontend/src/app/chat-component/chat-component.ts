// import { Component, inject } from '@angular/core';
import { FriendsService } from '../service/friends/friends-service';
import { Friends } from '../interfaces/user';
import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-chat-component',
  imports: [CommonModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css'
})
export class ChatComponent {

  friendService = inject(FriendsService)
  foundUsers: Friends[] = []; // Ajoute cette propriété

  constructor(private cdr: ChangeDetectorRef) { }
  // ...
  searchValue: string = '';

  async onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    if (value != "") {
      const data = await this.friendService.fetchInputSearch(value);
      this.foundUsers = data.users;
      this.cdr.detectChanges();
    } else {
      this.foundUsers = [];
      this.cdr.detectChanges();
    }
  }


  showUserProfil(dataOfUser : Friends){

    console.log(dataOfUser)
  }




}