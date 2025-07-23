import { inject, Injectable } from '@angular/core';
import { AuthService } from "../../service/auth/auth-service"
import { Friends, responseObject } from '../../interfaces/user';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  authService = inject(AuthService)

  router: Router = new Router();

  /**
   * fetch qui cherche des utilisateurs selon les caractères tapés dans la barre 
   * @param search 
   */
  fetchInputSearch(search: string): Promise<Friends> {
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
    // const response = await fetch("http://0.0.0.0:4900/api/user/getUser", requestOptions);
    // const result = await response.json();
    // return result; // 

  }


  foundUsers: Friends[] = []; 
  searchValue: string = '';
  searchInput = new FormControl("");

  async onInput() {
  console.log(this.searchInput.value);
  const value = this.searchInput.value ?? '';
  this.searchValue = value;

  if (value != "") {
    // Attendre la promesse pour obtenir le tableau d'utilisateurs
    const data = await this.fetchInputSearch(value);
    // Si la réponse est un tableau, on l'assigne directement
    if (Array.isArray(data)) {
      this.foundUsers = data;
    } else {
      this.foundUsers = [];
    }
  } else {
    this.foundUsers = [];
  }
}





  showUserProfil(dataOfUser: Friends) {

    console.log(dataOfUser)

    this.router.navigate(["profil-users"]);

  }


}

















// async onInput() {
  //   console.log(this.searchInput.value);
  //   const value = this.searchInput.value ?? '';
  //   this.searchValue = value;
  //   if (value != "") {
  //     const data = this.fetchInputSearch(value);
  //     this.foundUsers = data.users;

  //   }else{
  //     this.foundUsers = [];
  //   }

  // }