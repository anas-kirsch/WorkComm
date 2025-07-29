import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth/auth-service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocketPrivateService {

  authService = inject(AuthService);
  static apiURL = environment.apiURL;

  public socket: Socket | undefined;

  constructor() { }


  connectSocket(myUserId: number, friendUserId: number) {
    this.socket = io('http://192.168.10.125:10000');
    // this.socket = io('http://localhost:10000');
    this.socket.emit('join chat', { myUserId, friendUserId });
  }

  sendMessage(myUserId: number, friendUserId: number, message: string) {
    if (this.socket) {
      this.socket.emit('chat message', { myUserId, friendUserId, message });
    }
  }

  disconnect() {
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



  async deleteMessage() {

    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");

    // const body = JSON.stringify({  })
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      // body: 
    };

    try {

      const response = await fetch(`${AuthService.apiURL}/api/chatPrivate/getAll-private-message`, requestOptions);
      const historiqueMessage = await response.json()
      if (!response.ok) throw new Error(historiqueMessage.error || "Erreur lors de la suppression des messages");
      return historiqueMessage;

    } catch (error) {
      console.error(error);
      throw error;
    }


  }







}