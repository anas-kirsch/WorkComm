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

  router: Router = new Router();

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
          console.log("dans le service :", data)
          resolve(data)
        })
        .catch(error => reject(error))
    })
  }

  // async onInput() {
  //   const value = this.searchInput?.value ?? '';
  //   this.searchValue = value;

  //   if (value !== "") {
  //     const data = await this.fetchInputSearch(value);
  //     this.ngZone.run(() => {
  //       if (Array.isArray(data)) {
  //         this.foundUsers = [...data];
  //       } else if (data && Array.isArray(data.users)) {
  //         this.foundUsers = [...data.users];
  //       } else {
  //         this.foundUsers = [];
  //       }
  //       this.appRef.tick();
  //     });
  //   } else {
  //     this.ngZone.run(() => {
  //       this.foundUsers = [];
  //       this.appRef.tick();
  //     });
  //   }
  // }

  /**
   * cette fonction permet de naviguer vers le component qui affiche le profil d'un utlisateur 
   * @param dataOfUser 
   */
  showUserProfil(dataOfUser: Friends) {
    console.log(dataOfUser);
    this.router.navigate(["user", dataOfUser.username]);
  }



}
