import { Component, inject } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { Router } from '@angular/router';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth/auth-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login-component',
  imports: [FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})

export class LoginComponent {
  /**
   * Service d'authentification pour gérer la connexion
   */
  authService = inject(AuthService)

  /** Router Angular pour la navigation entre les pages */
  router: Router = new Router();

  /**
   * Formulaire de connexion avec validation des champs
   * - mail : requis, format email
   * - password : requis, min 8 caractères, 1 maj, 1 min, 1 chiffre
   */
  form: FormGroup = new FormGroup({
    mail: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'),
    ])
  })

  /** Navigue vers la page d'inscription */
  goInscription(){
    this.router.navigate(["inscription"])
  }

  /**
   * Soumet le formulaire de connexion si valide
   * - Appelle le service de connexion
   * - Stocke les infos dans le cookie
   * - Réinitialise le formulaire et redirige vers l'accueil en cas de succès
   */
  onSubmitConnexion() {
    if (this.form.invalid) {
      return;
    }
    AuthService.fetchConnexion(this.form)
      .then(result => {
        console.log('connexion réussie:', result);
        // Créer l'objet authData avec les champs supplémentaires
        const authData = {
          token: result.body.token,
          id: result.body.id.toString(),
          role: result.body.role,
          bio: result.body.bio,
          username: result.body.username,
          imagePath: result.body.imagePath?.imagePath || '', // si imagePath est un objet
          mail: result.body.mail,
          language: result.body.language,
          premium : result.body.premium
        };
        // Stocker dans le cookie
        AuthService.saveAuthToCookies(authData);
        
        this.form.reset();
        this.authService.isConnected = true;
        this.router.navigate([""]);
        
      })
      .catch(error => {
        console.error("Erreur dans la connexion: ", error);
      });
  }

  


}
