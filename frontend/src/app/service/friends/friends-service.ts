import { inject, Injectable, NgZone, ApplicationRef } from '@angular/core';
import { AuthService } from "../../service/auth/auth-service"
import { Friends, responseObject } from '../../interfaces/user';
import { Route, Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';



@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  // Service d'authentification pour récupérer le token et autres infos utilisateur
  authService = inject(AuthService);
  // Permet d'exécuter du code dans la zone Angular (utile pour les callbacks asynchrones)
  ngZone = inject(NgZone);
  // Permet de forcer la détection de changements dans l'application
  appRef = inject(ApplicationRef);
  // Permet la navigation entre les routes Angular
  router = inject(Router);
  // URL de l'API backend
  static apiURL = environment.apiURL;

  // Liste des utilisateurs trouvés lors d'une recherche
  foundUsers: Friends[] = [];
  // Valeur courante du champ de recherche
  searchValue: string = '';
  // Référence à l'input de recherche
  searchInput: any;

  // URL de l'API (non statique)
  apiURL = environment.apiURL;
  /**
   * fetch qui cherche des utilisateurs selon les caractères tapés dans la barre 
   * @param search 
   */
  fetchInputSearch(search: string): Promise<responseObject> {
    // Recherche des utilisateurs selon la valeur tapée dans la barre de recherche
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "search": search
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    // Effectue la requête POST pour récupérer les utilisateurs correspondant à la recherche
    return new Promise((resolve, reject) => {
      fetch(`${AuthService.apiURL}/api/user/getUser`, requestOptions)
        .then(data => data.json())
        .then(data => {
          // console.log("dans le service :", data)
          resolve(data)
        })
        .catch(error => reject(error))
    })
  }


  /**
   * fetch qui cherche un user par son username 
   * @param search 
   */
  async fetchDataByUsername(search: string): Promise<Friends> {
    // Recherche un utilisateur par son username
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "search": search
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    // Effectue la requête POST pour récupérer l'utilisateur par username
    return fetch(`${AuthService.apiURL}/api/user/getByUsername`, requestOptions)
      .then(response => response.json())
      .then(data => data as Friends);
  }



  /**
   * cette fonction permet de naviguer vers le component qui affiche le profil d'un utlisateur 
   * @param dataOfUser 
   */
  showUserProfil(dataOfUser: Friends) {
    // Navigue vers la page de profil de l'utilisateur sélectionné
    console.log(dataOfUser);
    this.router.navigate(["user", dataOfUser.username]);

  }



  /**
   * cette fonction requete le backend pour envoyer une demande d'ami
   * @param userId 
   * @param friendId 
   * @returns 
   */
  async sendFriendRequest(userId: number, friendId: number): Promise<object> {
    // Envoie une demande d'ami au backend
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      userId,
      friendId
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw
    };

    // Effectue la requête POST pour envoyer la demande d'ami
    try {
      const response = await fetch(`${AuthService.apiURL}/api/user/send-friend-requests`, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'envoi de la demande d'ami");
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  /**
   * verifie l'etat d'une demande d'amis
   * @param friendId 
   * @returns 
   */
  async checkFriendRequestStatus(friendId: number): Promise<any> {
    // Vérifie le statut d'une demande d'ami pour un utilisateur donné
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ friendId });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw
    };

    // Effectue la requête POST pour vérifier le statut de la demande d'ami
    try {
      const response = await fetch(`${AuthService.apiURL}/api/user/checkFriendRequestStatus`, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de la vérification du statut d'ami");
      return data; // data peut être null ou un objet relation
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  /**
   * recupere des demande d'amis .// a voir
   * @returns 
   */
  async getFriendRequests(): Promise<any[]> {
    // Récupère la liste des demandes d'amis reçues par l'utilisateur
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }

    const requestOptions = {
      method: "GET",
      headers: myHeaders
    };

    // Effectue la requête GET pour récupérer les demandes d'amis
    try {
      const response = await fetch(`${AuthService.apiURL}/api/user/friend-requests`, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de la récupération des demandes d'amis");
      return data; // Tableau d'utilisateurs ayant envoyé une demande d'ami
    } catch (error) {
      console.error(error);
      throw error;
    }
  }




  /**
   * Répond à une demande d'ami (accepter ou refuser)
   * @param friendId ID de l'utilisateur ayant envoyé la demande
   * @param action "accept" ou "refuse"
   */
  async respondToFriendRequest(friendId: number, action: "accept" | "refuse"): Promise<any> {
    // Répond à une demande d'ami (accepter ou refuser)
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ friendId, action });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw
    };

    // Effectue la requête POST pour répondre à la demande d'ami
    try {
      const response = await fetch(`${AuthService.apiURL}/api/user/confirm-friend-requests`, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de la réponse à la demande d'ami");
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }




  /**
 * Supprime un ami (relation d'amitié)
 * @param friendId ID de l'ami à supprimer
 */
  async deleteFriend(friendId: number): Promise<any> {
    // Supprime un ami (relation d'amitié) pour l'utilisateur courant
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ friendId });

    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      body: raw
    };

    // Effectue la requête DELETE pour supprimer l'ami
    try {
      const response = await fetch(`${AuthService.apiURL}/api/user/delete-friend`, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de la suppression de l'ami");
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }




  /**
   * cette fonction requete le backend pour qu'un utilisateur recupere ses amis 
   * @returns 
   */
  async getMyFriend(): Promise<any> {

    // Récupère la liste des amis de l'utilisateur courant
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
    // Effectue la requête GET pour récupérer les amis
    try {
      const response = await fetch(`${AuthService.apiURL}/api/user/myfriend`, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de la recuperation des amis");
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }




async fetchGetPendingSentFriendRequests(): Promise<any> {
  // Récupère la liste des demandes d'amis envoyées et en attente de réponse
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

  // Effectue la requête GET pour récupérer les demandes d'amis envoyées en attente
  try {
    const response = await fetch(`${AuthService.apiURL}/api/user/getPendingSentFriendRequests`, requestOptions);
    const data = await response.json();
    // console.log("test de reponse",data)
    if (!response.ok) throw new Error(data.error || "Erreur lors de la récupération des demandes");
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}





}
