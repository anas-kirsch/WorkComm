import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isConnected = false;
  // apiURL = environment.apiURL;
  static apiURL = environment.apiURL;

  /**
   * Envoie les données d'inscription au backend
   * @param formulaire FormGroup du formulaire d'inscription
   */
  static async fetchInscription(formulaire: FormGroup): Promise<any> {
    const formdata = new FormData();

    formdata.append("username", formulaire.get('username')?.value);
    formdata.append("mail", formulaire.get('email')?.value);
    formdata.append("bio", formulaire.get('bio')?.value);
    formdata.append("password", formulaire.get('password')?.value);
    formdata.append("confirmPassword", formulaire.get('confirmpassword')?.value);
    formdata.append("language", "french");

    // Récupérer le fichier image
    const pictureFile = formulaire.get('picture')?.value;
    if (pictureFile) {
      formdata.append("picture", pictureFile);
    }

    const requestOptions = {
      method: "POST",
      body: formdata
    };

    return fetch(`${AuthService.apiURL}/api/user/register`, requestOptions)
      .then((response) => response.json());
  }


  /**
   * Envoie les données de connexion au backend 
   * @param formulaire FormGroup du formulaire de connexion
   * @returns
   */
  static async fetchConnexion(formulaire: FormGroup): Promise<any> {

    const formdata = new FormData();

    formdata.append("mail", formulaire.get("mail")?.value);
    formdata.append("password", formulaire.get("password")?.value);

    const requestOptions = {
      method: "POST",
      body: formdata
        
    }

    return fetch(`${AuthService.apiURL}/api/auth/login`, requestOptions)
      .then((response) => response.json());

  };



  /**
   * Enregistre le token JWT, l'id utilisateur, le rôle et d'autres infos dans un seul cookie sous forme d'objet JSON
   * @param authData Objet contenant { token, id, role, bio, username, imagePath, mail, language }
   */
  static saveAuthToCookies(authData: {
    token: string,
    id: string,
    role: string,
    bio: string,
    username: string,
    imagePath: string,
    mail: string,
    language: string,
    premium :string
  }): void {
    const data = {
      token: authData.token,
      id: authData.id,
      role: authData.role,
      bio: authData.bio,
      username: authData.username,
      imagePath: authData.imagePath,
      mail: authData.mail,
      language: authData.language,
      premium : authData.premium
    };
    // document.cookie = `auth=${encodeURIComponent(JSON.stringify(data))}; path=/; SameSite=None; Secure`;
    document.cookie = `auth=${encodeURIComponent(JSON.stringify(data))}; path=/;`;
  }





  // a voir 

  /**
 * Récupère le token JWT, l'id utilisateur et le rôle depuis le cookie
 * @returns Objet contenant { token, id, role }
 */
  static getAuthFromCookies(): { token: string | null, id: string | null, role: string | null, username : string |null} {
    // Récupère les informations d'authentification (token, id, rôle, username) depuis le cookie 'auth'.
    const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
      // Découpe chaque cookie et l'ajoute à l'objet 'cookies'.
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    if (cookies['auth']) {
      try {
        // Décode et parse le cookie 'auth' pour récupérer les données.
        const data = JSON.parse(decodeURIComponent(cookies['auth']));
        return {
          token: data.token || null,
          id: data.id || null,
          role: data.role || null,
          username : data.username || null
        };
      } catch {
        // En cas d'erreur de parsing, retourne des valeurs nulles.
        return { token: null, id: null, role: null, username :null };
      }
    }
    // Si le cookie 'auth' n'existe pas, retourne des valeurs nulles.
    return { token: null, id: null, role: null, username : null };
  }






  static isConnected(): boolean {
    // Vérifie si l'utilisateur est connecté en testant la présence d'un token valide dans le cookie.
    const auth = this.getAuthFromCookies();
    return !!auth.token && auth.token !== 'null' && auth.token !== '';
  }



  insertTokeninHeader() {
    // Insère le token JWT dans l'en-tête Authorization pour les requêtes HTTP.
    const auth = AuthService.getAuthFromCookies();
    if (auth.token) {
      return {
        Authorization: `Bearer ${auth.token}`
      };
    }
    // Si aucun token n'est présent, retourne un objet vide.
    return {};
  }


}