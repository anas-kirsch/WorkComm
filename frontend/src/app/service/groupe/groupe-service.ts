import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth-service';
import { Router } from '@angular/router';
import { responseObject } from '../../interfaces/user';
import { environment } from '../../../environments/environment.development';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class GroupeService {

  authService = inject(AuthService);
  router = inject(Router);
  apiURL = environment.apiURL;

  // --- Socket.io pour la gestion des groupes ---
  public socket: Socket | undefined;

  connectSocket() {
    // Mets ici l'URL de ton serveur Socket.io groupe
    this.socket = io('http://192.168.1.248:9000', {
      withCredentials: true
    });
  }

  joinGroup(groupId: string) {
    if (this.socket) {
      this.socket.emit('join group', { groupId });
    }
  }

  sendGroupMessage(groupId: string, userId: number, message: string,username : string ) {
    if (this.socket) {
      this.socket.emit('group message', { groupId, userId, message, username });
    }
  }

  leaveGroup(groupId: string) {
    if (this.socket) {
      this.socket.emit('leave group', { groupId });
    }
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }
  // --- Fin Socket.io ---

  /**
   * recupere les groupes d'un utilisateur 
   * @returns 
   */
  fetchGetGroupUser(): Promise<any> {
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.apiURL}/api/chatGroup/get-all-group-user`, requestOptions)
        .then(data => data.json())
        .then(data => {
          resolve(data)
        })
        .catch(error => reject(error))
    })
  }

  /**
   * Crée un groupe avec les utilisateurs sélectionnés et le nom du groupe
   * @param usersArray tableau d'IDs utilisateurs
   * @param newGroupName nom du groupe
   * @returns Promise<any>
   */
  fetchCreateGroup(usersArray: number[], newGroupName: string): Promise<any> {
    const tokenHeader = this.authService.insertTokeninHeader();
    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ usersArray, newGroupName })
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.apiURL}/api/chatGroup/group-chat`, requestOptions)
        .then(data => data.json())
        .then(data => {
          resolve(data);
        })
        .catch(error => reject(error));
    });
  }




  /**
   * ce fetch recupere les membres d'un groupe
   * @param groupId 
   * @returns 
   */
  fetchGetAllGroupMember(groupId: number) {
    const tokenHeader = this.authService.insertTokeninHeader();
    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ groupId })
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.apiURL}/api/chatGroup/getGroupMember`, requestOptions)
        .then(data => data.json())
        .then(data => {
          resolve(data);
        })
        .catch(error => reject(error));
    });

  }


  /**
   * cette fonction permet de requeter le backend pour ajouter les messages de groupes dans l'historique 
   */
  fetchSaveGroupMessage(messageContent: string, groupId: number) {

    const tokenHeader = this.authService.insertTokeninHeader();
    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ messageContent, groupId })
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.apiURL}/api/chatGroup/send-group-message`, requestOptions)
        .then(data => data.json())
        .then(data => {
          resolve(data);
        })
        .catch(error => reject(error));
    });

  }






  /**
   * Cette fonction permet de supprimer un message de groupe 
   * @param messageId 
   * @param groupId 
   * @returns 
   */
  fetchDeleteGroupMessage(messageId: number, groupId: number) {
    const tokenHeader = this.authService.insertTokeninHeader();
    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    // Pas besoin de Content-Type car pas de body

    const requestOptions: RequestInit = {
      method: "DELETE",
      headers: myHeaders
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.apiURL}/api/chatGroup/delete-group-message/${messageId}/${groupId}`, requestOptions)
        .then(data => data.json())
        .then(data => {
          resolve(data);
        })
        .catch(error => reject(error));
    });
  }



  fetchGetGroupMessages(groupId: number) {

    const tokenHeader = this.authService.insertTokeninHeader();
    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ groupId })
    };

    return new Promise((resolve, reject) => {
      fetch(`${this.apiURL}/api/chatGroup/getAll-group-message`, requestOptions)
        .then(data => data.json())
        .then(data => {
          resolve(data);
        })
        .catch(error => reject(error));
    });



  }






}