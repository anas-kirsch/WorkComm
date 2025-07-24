// import { Component, inject } from '@angular/core';
import { FriendsService } from '../service/friends/friends-service';
import { Friends } from '../interfaces/user';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-chat-component',
  imports: [CommonModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css'
})
export class ChatComponent implements OnInit {

  openSection: string | null = null;
  friendService = inject(FriendsService)
  foundUsers: Friends[] = [];

  constructor(private cdr: ChangeDetectorRef) { }
  searchValue: string = '';
  friendRequests: any[] = [];



  isIncomingFriendRequest = false;
  isFriendRequestPending = false;
  isFriend = false;

  async ngOnInit() {
    try {
      this.friendRequests = await this.friendService.getFriendRequests();
      console.log("demande d'amis :", this.friendRequests)
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes d'amis", error);
    }
  }


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



  /**
   * cette fonction permet d'accepter une demande d'ami provenant d'un utilisateur 
   * @returns 
   */
acceptRequest(friendId: number) {
  if (!friendId) return;
  this.friendService.respondToFriendRequest(friendId, "accept")
    .then(response => {
      // Retirer la demande acceptée de la liste
      this.friendRequests = this.friendRequests.filter(req => req.id !== friendId);
      this.isIncomingFriendRequest = false;
      this.isFriendRequestPending = false;
      this.isFriend = true;
      this.cdr.detectChanges();
      console.log("Demande d'ami acceptée !");
    })
    .catch(error => {
      console.error(error);
      console.log("Erreur lors de l'acceptation de la demande d'ami.");
    });
}

/**
 * Refuse une demande d'ami et met à jour la liste immédiatement
 */
refuseRequest(friendId: number) {
  if (!friendId) return;
  this.friendService.respondToFriendRequest(friendId, "refuse")
    .then(response => {
      // Retirer la demande refusée de la liste
      this.friendRequests = this.friendRequests.filter(req => req.id !== friendId);
      this.isIncomingFriendRequest = false;
      this.isFriendRequestPending = false;
      this.cdr.detectChanges();
      console.log("Demande d'ami refusée.");
    })
    .catch(error => {
      console.error(error);
      console.log("Erreur lors du refus de la demande d'ami.");
    });
}



}