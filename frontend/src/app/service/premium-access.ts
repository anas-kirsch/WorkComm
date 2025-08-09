import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { AuthService } from './auth/auth-service';

@Injectable({
  providedIn: 'root'
})
export class PremiumAccess {
  static apiURL = environment.apiURL;
  authService = inject(AuthService);


  /**
   * cette fonction verifie l'etat de l'abonnement d'un utilisateur, TRUE or FALSE
   */
  fetchPremiumStatus() {

    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    return new Promise((resolve, reject) => {
      fetch(`${AuthService.apiURL}/api/premium/status`,requestOptions)
      .then(response => response.json())
      .then(response =>{
        resolve(response)
      })
      .catch(error => reject(error))
    })
  }
  




}
