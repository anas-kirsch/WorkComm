import { inject, Injectable } from '@angular/core';
import { AuthService } from "../../service/auth/auth-service"
import { Friends, responseObject } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  authService = inject(AuthService)

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
    
    return new Promise((resolve,reject)=>{
      fetch("http://0.0.0.0:4900/api/user/getUser", requestOptions)
      .then(data=>data.json())
      .then(data=>{

        console.log("dans le service :",data)
        resolve(data)
      })
      .catch(error=>reject(error))
    })
    // const response = await fetch("http://0.0.0.0:4900/api/user/getUser", requestOptions);
    // const result = await response.json();
    // return result; // 

  }





}
