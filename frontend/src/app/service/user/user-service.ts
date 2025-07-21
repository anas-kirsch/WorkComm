import { Injectable } from '@angular/core';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {



  getUserData(): User | null {
    // Récupère tous les cookies
    const cookies = document.cookie.split('; ');
    // Trouve le cookie 'auth'
    const authCookie = cookies.find(row => row.startsWith('auth='));
    if (!authCookie) return null;

    // Extrait la valeur et la décode
    const authValue = authCookie.split('=')[1];
    const decoded = decodeURIComponent(authValue);

    // Parse en objet JS
    try {
      const authData = JSON.parse(decoded);
      // Exemple d'accès à l'image
      // console.log(authData.imagePath)
      return authData;
    } catch (e) {
      console.error('Erreur de parsing du cookie auth', e);
      return null;
    }
  }

  
}
