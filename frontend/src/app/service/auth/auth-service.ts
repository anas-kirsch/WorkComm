import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * Envoie les données d'inscription au backend
   * @param formulaire FormGroup du formulaire d'inscription
   */
  static fetchInscription(formulaire: FormGroup): Promise<any> {
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

    return fetch("http://192.168.10.125:4900/api/user/register", requestOptions)
      .then((response) => response.json());
  }





  /**
   * Envoie les données de connexion au backend 
   * @param formulaire FormGroup du formulaire de connexion
   * @returns
   */
  static fetchConnexion(formulaire: FormGroup): Promise<any> {

    const formdata = new FormData();

    formdata.append("mail", formulaire.get("mail")?.value);
    formdata.append("password", formulaire.get("password")?.value);

    const requestOptions = {

      method: "POST",
      body: formdata
    }

    return fetch("http://192.168.10.125:4900/api/auth/login", requestOptions)
      .then((response) => response.json());

  };







  /**
   * Enregistre le token JWT, l'id utilisateur et le rôle dans un seul cookie sous forme d'objet JSON
   * @param authData Objet contenant { token, id, role }
   */
  static saveAuthToCookies(authData: { token: string, id: string, role: string }): void {
    const data = {
      token: authData.token,
      id: authData.id,
      role: authData.role
    };
    document.cookie = `auth=${encodeURIComponent(JSON.stringify(data))}; path=/;`;
  }




  /**
 * Récupère le token JWT, l'id utilisateur et le rôle depuis le cookie
 * @returns Objet contenant { token, id, role }
 */
  static getAuthFromCookies(): { token: string | null, id: string | null, role: string | null } {
    const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    if (cookies['auth']) {
      try {
        const data = JSON.parse(decodeURIComponent(cookies['auth']));
        return {
          token: data.token || null,
          id: data.id || null,
          role: data.role || null
        };
      } catch {
        return { token: null, id: null, role: null };
      }
    }
    return { token: null, id: null, role: null };
  }





}