import { Injectable } from '@angular/core';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Récupère les données utilisateur stockées dans le cookie 'auth'
  getUserData(): User | null {
    // Récupère tous les cookies du navigateur
    const cookies = document.cookie.split('; ');
    // Recherche le cookie nommé 'auth'
    const authCookie = cookies.find(row => row.startsWith('auth='));
    if (!authCookie) return null;

    // Extrait la valeur du cookie et la décode (pour obtenir le JSON)
    const authValue = authCookie.split('=')[1];
    const decoded = decodeURIComponent(authValue);

    // Parse la chaîne JSON en objet JavaScript
    try {
      const authData = JSON.parse(decoded);
      // Exemple d'accès à l'image : authData.imagePath
      // console.log(authData.imagePath)
      return authData;
    } catch (e) {
      // En cas d'erreur de parsing, affiche l'erreur et retourne null
      console.error('Erreur de parsing du cookie auth', e);
      return null;
    }
  }
}
