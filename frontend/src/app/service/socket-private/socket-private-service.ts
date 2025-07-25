import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketPrivateService {

  public socket: Socket | undefined;

  constructor() {}

  connectSocket(myUserId: number, friendUserId: number) {
    this.socket = io('http://localhost:10000');
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
}