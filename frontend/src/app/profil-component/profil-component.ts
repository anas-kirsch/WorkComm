import { Component, inject, Injector, ChangeDetectorRef } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { Router } from '@angular/router';
import { UserService } from '../service/user/user-service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth/auth-service';

@Component({
  selector: 'app-profil-component',
  imports: [FooterComponent, CommonModule],
  templateUrl: './profil-component.html',
  styleUrl: './profil-component.css'
})
export class ProfilComponent {


  // Affiche la modale de suppression de compte
  showDeleteModal = false;
  // Router Angular pour la navigation
  router: Router = new Router();
  // Service utilisateur
  userService = inject(UserService)
  // Permet de forcer la mise à jour de l'UI
  cdr = inject(ChangeDetectorRef);

  // Confirme la suppression du compte utilisateur
  async confirmDeleteAccount() {
    this.showDeleteModal = false;

    try {
      const suppression = await this.fetchDeleteAccount();
      console.log(suppression);

      // Supprime le cookie d'authentification
      document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Supprime les éléments du localStorage
      localStorage.removeItem('conversation_name');
      localStorage.removeItem('selectedFriendId');

      this.authService.isConnected =false;

      // Rafraîchit l'affichage
      this.cdr.detectChanges();

      // Redirige l'utilisateur
      this.router.navigate([""]);
    } catch (error) {
      console.error(error)
    }
  }

  // Service d'authentification
  authService = inject(AuthService);


  // Appelle l'API backend pour supprimer le compte utilisateur
  fetchDeleteAccount() {

    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    if (tokenHeader.Authorization) {
      myHeaders.append("Authorization", tokenHeader.Authorization);
    }
    myHeaders.append("Content-Type", "application/json");


    const requestOptions = {
      method: "DELETE",
      headers: myHeaders,
    };

    return new Promise((resolve, reject) => {
      fetch(`${AuthService.apiURL}/api/user/delete/user`, requestOptions)
        .then(data => data.json())
        .then(data => {
          resolve(data)
        })
        .catch(error => reject(error))
    })

  }


}


