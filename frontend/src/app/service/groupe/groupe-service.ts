import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth-service';
import { Router } from '@angular/router';
import { responseObject } from '../../interfaces/user';


@Injectable({
  providedIn: 'root'
})
export class GroupeService {

  authService = inject(AuthService);
  router = inject(Router);


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
      fetch("http://0.0.0.0:4900/api/chatGroup/get-all-group-user", requestOptions)
        .then(data => data.json())
        .then(data => {
          // console.log("dans le service :", data)
          resolve(data)
        })
        .catch(error => reject(error))

    })

  }










}
