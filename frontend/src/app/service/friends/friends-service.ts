import { inject, Injectable, NgZone, ApplicationRef } from '@angular/core';
import { AuthService } from "../../service/auth/auth-service"
import { Friends, responseObject } from '../../interfaces/user';
import { Route, Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  authService = inject(AuthService);
  ngZone = inject(NgZone);
  appRef = inject(ApplicationRef);

  // router: Router = new Router();
  router = inject(Router);

  foundUsers: Friends[] = [];
  searchValue: string = '';
  searchInput: any;

  /**
   * fetch qui cherche des utilisateurs selon les caractères tapés dans la barre 
   * @param search 
   */
  fetchInputSearch(search: string): Promise<responseObject> {
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
      // redirect: "follow"
    };

    return new Promise((resolve, reject) => {
      fetch("http://0.0.0.0:4900/api/user/getUser", requestOptions)
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
      // redirect: "follow"
    };

    return fetch("http://0.0.0.0:4900/api/user/getByUsername", requestOptions)
      .then(response => response.json())
      .then(data => data as Friends);
  }



  /**
   * cette fonction permet de naviguer vers le component qui affiche le profil d'un utlisateur 
   * @param dataOfUser 
   */
  showUserProfil(dataOfUser: Friends) {
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

    try {
      const response = await fetch("http://0.0.0.0:4900/api/user/send-friend-requests", requestOptions);
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

    try {
      const response = await fetch("http://0.0.0.0:4900/api/user/checkFriendRequestStatus", requestOptions);
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
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }

    const requestOptions = {
      method: "GET",
      headers: myHeaders
    };

    try {
      const response = await fetch("http://0.0.0.0:4900/api/user/friend-requests", requestOptions);
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

    try {
      const response = await fetch("http://0.0.0.0:4900/api/user/confirm-friend-requests", requestOptions);
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

    try {
      const response = await fetch("http://0.0.0.0:4900/api/user/delete-friend", requestOptions);
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
    try {
      const response = await fetch("http://0.0.0.0:4900/api/user/myfriend", requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de la recuperation des amis");
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }




async fetchGetPendingSentFriendRequests(): Promise<any> {
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

  try {
    const response = await fetch("http://0.0.0.0:4900/api/user/getPendingSentFriendRequests", requestOptions);
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
