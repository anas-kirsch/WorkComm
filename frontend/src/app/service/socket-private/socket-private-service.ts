import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth/auth-service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocketPrivateService {

  // Service d'authentification pour récupérer le token utilisateur
  authService = inject(AuthService);
  // URL de l'API backend
  static apiURL = environment.apiURL;

  // Instance du socket pour la communication en temps réel avec le serveur privé
  public socket: Socket | undefined;

  // Constructeur vide (peut être utilisé pour initialiser des propriétés si besoin)
  constructor() { }


  connectSocket(myUserId: number, friendUserId: number) {
    // Initialise la connexion au serveur Socket.io pour le chat privé
    this.socket = io('http://192.168.1.248:10100');
    // this.socket = io('http://localhost:10000');
    // Émet un événement pour rejoindre la conversation privée
    this.socket.emit('join chat', { myUserId, friendUserId });
  }

  sendMessage(myUserId: number, friendUserId: number, message: string) {
    // Envoie un message privé via le socket
    if (this.socket) {
      this.socket.emit('chat message', { myUserId, friendUserId, message });
    }
  }

  disconnect() {
    // Déconnecte le socket du serveur privé
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }





  /**
   * fonction qui fetch vers le backend afin de save en bdd le message envoyer, permettant d'avoir un historique à chaque arrivée sur un chat
   * @param messageContent 
   * @param friendId 
   * @param conversationName 
   * @returns 
   */
  async saveMessageInBdd(messageContent: string, friendId: number, conversationName: string) {
    // Sauvegarde le message envoyé dans la base de données via le backend
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    const body = JSON.stringify({ messageContent, friendId, conversationName })

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: body
    };

    // Effectue la requête POST pour sauvegarder le message privé
    try {

      const response = await fetch(`${AuthService.apiURL}/api/chatPrivate/send-private-message`, requestOptions);
      const saveMessage = await response.json()
      if (!response.ok) throw new Error(saveMessage.error || "Erreur lors de la récupération des messages");
      return saveMessage;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }



  /**
   * cette fonction recupere l'historique de conversation entre deux utilisateurs 
   * @param conversationName 
   */
  async getPrivateHistoriqueOfMessage(conversationName: string) {
    // Récupère l'historique des messages privés entre deux utilisateurs
    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    // const body = JSON.stringify(conversationName)
    const body = JSON.stringify({ conversationName })
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: body
    };

    // Effectue la requête POST pour récupérer l'historique des messages privés
    try {

      const response = await fetch(`${AuthService.apiURL}/api/chatPrivate/getAll-private-message`, requestOptions);
      const historiqueMessage = await response.json()
      if (!response.ok) throw new Error(historiqueMessage.error || "Erreur lors de la récupération des messages");
      return historiqueMessage;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteMessage(messageId: number, conversationName: string) {
  // Supprime un message privé de la base de données via le backend
  const tokenHeader = this.authService.insertTokeninHeader();

  const myHeaders = new Headers();
  if (tokenHeader.Authorization) {
    myHeaders.append("Authorization", tokenHeader.Authorization);
  }
  // Pas besoin de Content-Type ni de body pour un DELETE avec params

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders
  };

  // Effectue la requête DELETE pour supprimer le message privé
  try {
    const response = await fetch(
      `${AuthService.apiURL}/api/chatPrivate/delete-private-message/${messageId}/${conversationName}`,
      requestOptions
    );
    const confirmDelete = await response.json();
    if (!response.ok) throw new Error(confirmDelete.error || "Erreur lors de la suppression du message");
    return confirmDelete;
  } catch (error) {
    console.error(error);
    throw error;
  }
}



}