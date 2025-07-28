import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth-service';
import { Router } from '@angular/router';
import { responseObject } from '../../interfaces/user';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class GroupeService {

  authService = inject(AuthService);
  router = inject(Router);
  apiURL = environment.apiURL

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
          // console.log("dans le service :", data)
          resolve(data)
        })
        .catch(error => reject(error))
    })

  }










}
