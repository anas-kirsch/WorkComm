// import { Component, inject } from '@angular/core';
import { FriendsService } from '../service/friends/friends-service';
import { Friends } from '../interfaces/user';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { GroupeService } from '../service/groupe/groupe-service';


@Component({
  selector: 'app-chat-component',
  imports: [CommonModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css'
})
export class ChatComponent implements OnInit {

  openSection: string | null = null;
  friendService = inject(FriendsService)
  groupService = inject(GroupeService)
  foundUsers: Friends[] = [];

  constructor(private cdr: ChangeDetectorRef) { }
  searchValue: string = '';
  friendRequests: any[] = [];
  myFriends: Friends[] = [];
  groups: any[] = [];
  arrayOfSentFriendRequests:  any[] =[];

  isIncomingFriendRequest = false;
  isFriendRequestPending = false;
  isFriend = false;

  async ngOnInit() {
    try {
      // recupere les demandes d'amis recu 
      this.friendRequests = await this.friendService.getFriendRequests();
      // recupere les amis
      await this.getMyFriend();
      // recupere les groupes dans lesquels l'utilisateur se trouver
      await this.getGroupUser();
      // recupere les demandes d'amis que l'utilisateur a envoyé et qui sont encore en attente 
      await this.getPendingSentFriendRequests();
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


  /**
   * Cette fonction récupère la liste des amis de l'utilisateur
   * et met à jour le front.
   */
  async getMyFriend() {
    try {
      this.myFriends = await this.friendService.getMyFriend();
      this.cdr.detectChanges();
      // console.log('Liste de mes amis :', this.myFriends);
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste des amis', error);
    }
  }



  /**
   * // commentaire
   */
  getFriendImage(friend: any): string | null {
    if (!friend.imagePath) return null;
    if (typeof friend.imagePath === 'string') return friend.imagePath;
    if (typeof friend.imagePath === 'object' && friend.imagePath.imagePath) return friend.imagePath.imagePath;
    return null;
  }


  /**
   * recupere les groupes d'un utilisateur
   */
  async getGroupUser() {
    try {
      const res = await this.groupService.fetchGetGroupUser();
      this.groups = res.groups; // Assure-toi que la réponse a bien la forme { groups: [...] }
      // console.log("success : ", this.groups);
    } catch (error) {
      console.error("Erreur lors de la récupération des groupes de l'utilisateur ", error);
    }
  }



  async getPendingSentFriendRequests() {
    try {
      const res = await this.friendService.fetchGetPendingSentFriendRequests();
      this.arrayOfSentFriendRequests = res.pendingRequests;
      // console.log("succes : getPendingSentFriendRequests : ",this.arrayOfSentFriendRequests)
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes en attentes", error);
    }
  }


}

// const result: {
//     id: any;
//     username: any;
//     profilePicture: any;
// }[]