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

  // Service d'authentification pour récupérer le token et autres infos utilisateur
  authService = inject(AuthService);
  // Permet la navigation entre les routes Angular
  router = inject(Router);
  // URL de l'API backend
  apiURL = environment.apiURL;

  // --- Socket.io pour la gestion des groupes ---
  // Instance du socket pour la communication en temps réel avec le serveur de groupes
  public socket: Socket | undefined;

  connectSocket() {
    // Initialise la connexion au serveur Socket.io pour les groupes
    // Mets ici l'URL de ton serveur Socket.io groupe
    this.socket = io(`${environment.groupSocketURL}`, {
      withCredentials: true
    });
  }

  joinGroup(groupId: string) {
    // Permet à l'utilisateur de rejoindre un groupe via le socket
    if (this.socket) {
      this.socket.emit('join group', { groupId });
    }
  }

  sendGroupMessage(groupId: string, userId: number, message: string,username : string ) {
    // Envoie un message dans le groupe via le socket
    if (this.socket) {
      this.socket.emit('group message', { groupId, userId, message, username });
    }
  }

  leaveGroup(groupId: string) {
    // Permet à l'utilisateur de quitter le groupe via le socket
    if (this.socket) {
      this.socket.emit('leave group', { groupId });
    }
  }

  disconnectSocket() {
    // Déconnecte le socket du serveur de groupes
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
    // Récupère la liste des groupes auxquels l'utilisateur appartient
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

    // Effectue la requête GET pour récupérer les groupes de l'utilisateur
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
    // Crée un nouveau groupe avec les utilisateurs sélectionnés et le nom du groupe
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

    // Effectue la requête POST pour créer le groupe
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
    // Récupère la liste des membres d'un groupe donné
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

    // Effectue la requête POST pour récupérer les membres du groupe
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

    // Sauvegarde un message de groupe dans l'historique côté backend
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

    // Effectue la requête POST pour sauvegarder le message de groupe
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
    // Supprime un message de groupe côté backend
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

    // Effectue la requête DELETE pour supprimer le message du groupe
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

    // Récupère tous les messages d'un groupe donné
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

    // Effectue la requête POST pour récupérer tous les messages du groupe
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