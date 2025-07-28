import { FriendsService } from '../service/friends/friends-service';
import { Friends } from '../interfaces/user';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupeService } from '../service/groupe/groupe-service';
import { SocketPrivateService } from '../service/socket-private/socket-private-service';
import { AuthService } from '../service/auth/auth-service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../environments/environment.development';


@Component({
  selector: 'app-chat-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})

export class ChatComponent implements OnInit {
  static apiURL = environment.apiURL;

  friendService = inject(FriendsService)
  groupService = inject(GroupeService)
  authService = inject(AuthService)

  selectedFriendUsername: string = '';
  newMessage: string = '';

  chatActivate = false;
  openSection: string | null = null;

  foundUsers: Friends[] = [];
  searchValue: string = '';
  friendRequests: any[] = [];
  myFriends: Friends[] = [];
  groups: any[] = [];
  arrayOfSentFriendRequests: any[] = [];
  isIncomingFriendRequest = false;
  isFriendRequestPending = false;
  isFriend = false;

  messages: any[] = [];
  myUserId: number = 0;
  selectedFriendId: number | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private socketPrivateService: SocketPrivateService
  ) { }



  async ngOnInit() {
    try {
      const auth = AuthService.getAuthFromCookies();
      if (auth && auth.id) {
        this.myUserId = Number(auth.id);
      }
      this.friendRequests = await this.friendService.getFriendRequests();
      await this.getMyFriend();
      await this.getGroupUser();
      await this.getPendingSentFriendRequests();
      const savedId = localStorage.getItem('selectedFriendId');
      if (savedId) {
        this.startPrivateChat(Number(savedId));
      }
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
    } else {
      this.foundUsers = [];
    }
    this.cdr.detectChanges();
  }



  acceptRequest(friendId: number) {
    if (!friendId) return;
    this.friendService.respondToFriendRequest(friendId, "accept")
      .then(() => {
        this.friendRequests = this.friendRequests.filter(req => req.id !== friendId);
        this.isIncomingFriendRequest = false;
        this.isFriendRequestPending = false;
        this.isFriend = true;
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error(error);
      });
  }



  refuseRequest(friendId: number) {
    if (!friendId) return;
    this.friendService.respondToFriendRequest(friendId, "refuse")
      .then(() => {
        this.friendRequests = this.friendRequests.filter(req => req.id !== friendId);
        this.isIncomingFriendRequest = false;
        this.isFriendRequestPending = false;
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error(error);
      });
  }



  async getMyFriend() {
    try {
      this.myFriends = await this.friendService.getMyFriend();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste des amis', error);
    }
  }



  getFriendImage(friend: any): string | null {
    if (!friend.imagePath) return null;
    if (typeof friend.imagePath === 'string') return friend.imagePath;
    if (typeof friend.imagePath === 'object' && friend.imagePath.imagePath) return friend.imagePath.imagePath;
    return null;
  }



  async getGroupUser() {
    try {
      const res = await this.groupService.fetchGetGroupUser();
      this.groups = res.groups;
    } catch (error) {
      console.error("Erreur lors de la récupération des groupes de l'utilisateur ", error);
    }
  }



  async getPendingSentFriendRequests() {
    try {
      const res = await this.friendService.fetchGetPendingSentFriendRequests();
      this.arrayOfSentFriendRequests = res.pendingRequests;
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes en attentes", error);
    }
  }



  async startPrivateChat(friendUserId: number) {
    this.selectedFriendId = friendUserId;
    localStorage.setItem('selectedFriendId', friendUserId.toString());
    // Récupère le pseudo de l'ami sélectionné
    const friend = this.myFriends.find(f => f.id === friendUserId);
    this.selectedFriendUsername = friend ? friend.username : 'Ami';
    this.messages = [];
    this.cdr.markForCheck(); // Force la détection dès le changement d'ami

    try {
      const tokenHeader = this.authService.insertTokeninHeader();
      const myHeaders = new Headers();
      if (tokenHeader.Authorization) {
        myHeaders.append("Authorization", tokenHeader.Authorization);
      }
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch(`${AuthService.apiURL}/api/chatPrivate/private-chat`, {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ friendUserId })
      });

      if (!response.ok) throw new Error('Erreur serveur');
      const data = await response.json();
      console.log(data);

      // Connecte le socket à la room
      this.socketPrivateService.connectSocket(this.myUserId, friendUserId);

      // Nettoie l'ancien listener avant d'en ajouter un nouveau
      if (this.socketPrivateService.socket) {
        this.socketPrivateService.socket.off('chat message');
        this.socketPrivateService.socket.on('chat message', (msg: any) => {
          this.messages = [...this.messages, msg]; // Nouvelle référence pour OnPush
          this.cdr.markForCheck();
          setTimeout(() => {
            const list = document.querySelector('.messages-list');
            if (list) list.scrollTop = list.scrollHeight;
          }, 0);
        });
      }
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Erreur lors de la connexion au chat privé', error);
    }
  }



  sendChatMessage(message: string) {
    if (this.selectedFriendId) {
      this.socketPrivateService.sendMessage(this.myUserId, this.selectedFriendId, message);
    }
  }



  ngOnDestroy() {
    this.socketPrivateService.disconnect();
  }



  trackByMsgId(index: number, msg: any) {
    return msg.id;
  }




}