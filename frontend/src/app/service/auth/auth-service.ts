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
  static fetchInscription(formulaire: FormGroup): Promise<string> {
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
      // redirect: "follow" // supprimé
    };

    return fetch("http://192.168.10.125:4900/api/user/register", requestOptions)
      .then((response) => response.text());
  }
}