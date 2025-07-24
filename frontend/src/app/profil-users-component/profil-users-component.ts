import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FriendsService } from '../service/friends/friends-service';
import { CommonModule } from '@angular/common';
import { Friends } from '../interfaces/user';
import { AuthService } from '../service/auth/auth-service';

@Component({
  selector: 'app-profil-users-component',
  imports: [CommonModule],
  templateUrl: './profil-users-component.html',
  styleUrl: './profil-users-component.css'
})
export class ProfilUsersComponent implements OnInit {

  isFriend = false;
  authService = inject(AuthService);
  friendService = inject(FriendsService);
  username: string | null = null;
  foundUsers: Friends[] = [];
  searchValue: string = '';
  isFriendRequestPending = false;
  isIncomingFriendRequest = false;
  dataOfUser: Friends | null = null;
  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) { }



  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.username = params.get('username');
      if (this.username) {
        const data = await this.friendService.fetchDataByUsername(this.username);
        this.dataOfUser = data;
        this.cdr.detectChanges();

        const userId = Number(AuthService.getAuthFromCookies().id);
        const friendId = this.dataOfUser?.id;
        this.isFriendRequestPending = false;
        this.isIncomingFriendRequest = false;
        this.isFriend = false; // reset
        if (userId && friendId) {
          try {
            const statusObj = await this.friendService.checkFriendRequestStatus(friendId);
            console.log(statusObj);
            if (statusObj) {
              if (statusObj.status === 'pending') {
                if (statusObj.UserId === userId) {
                  this.isFriendRequestPending = true;
                } else if (statusObj.UserId === friendId) {
                  this.isIncomingFriendRequest = true;
                }
              } else if (statusObj.status === 'accepted') {
                this.isFriend = true;
              }
            }
            this.cdr.detectChanges();
          } catch (error) {
            console.error(error);
          }
        }
      }
    });
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


  async vide() {

    this.searchValue = '';
    this.foundUsers = [];

  }


  /**
   * cette fonction permet d'envoyer une demande d'ami à un utilisateur 
   * @returns 
   */
  async sendFriendRequest() {
    const userId = Number(AuthService.getAuthFromCookies().id);
    const friendId = this.dataOfUser?.id;
    if (!userId || !friendId) return;
    this.isFriendRequestPending = true;
    this.cdr.markForCheck(); // Utilise markForCheck pour forcer la vue à se mettre à jour si OnPush
    try {
      const responseObj = await this.friendService.sendFriendRequest(userId, friendId);
      console.log(responseObj);
    } catch (error) {
      console.error(error);
      this.isFriendRequestPending = false;
      this.cdr.markForCheck();
    }
  }


  /**
   * cette fonction permet d'accepter une demande d'ami provenant d'un utilisateur 
   * @returns 
   */
  acceptRequest() {
    const friendId = this.dataOfUser?.id;
    if (!friendId) return;
    this.friendService.respondToFriendRequest(friendId, "accept")
      .then(response => {
        this.isIncomingFriendRequest = false;
        this.isFriendRequestPending = false;
        this.isFriend = true; // Ajoute cette ligne
        this.cdr.detectChanges();
        console.log("Demande d'ami acceptée !");
      })
      .catch(error => {
        console.error(error);
        console.log("Erreur lors de l'acceptation de la demande d'ami.");
      });
  }


  /**
   * cette fonction permet de refuser une demande d'ami provenant d'un utilisateur 
   * @returns 
   */
  refuseRequest() {
    const friendId = this.dataOfUser?.id;
    if (!friendId) return;
    this.friendService.respondToFriendRequest(friendId, "refuse")
      .then(response => {
        this.isIncomingFriendRequest = false;
        this.isFriendRequestPending = false;
        this.cdr.detectChanges();
        // Afficher un message de refus dans la console
        console.log("Demande d'ami refusée.");
      })
      .catch(error => {
        console.error(error);
        // Afficher un message d'erreur dans la console
        console.log("Erreur lors du refus de la demande d'ami.");
      });
  }


  /**
 * Cette fonction permet de supprimer un ami
 */
  async deleteFriend() {
    const friendId = this.dataOfUser?.id;
    if (!friendId) return;
    try {
      await this.friendService.deleteFriend(friendId);
      this.isFriend = false;
      this.cdr.detectChanges();
      console.log("Ami supprimé avec succès.");
    } catch (error) {
      console.error(error);
      console.log("Erreur lors de la suppression de l'ami.");
    }
  }








}







