import { Component } from '@angular/core';
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

  router: Router = new Router();

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


    onSubmitConnexion() {
      if (this.form.invalid) {
        return;
      }
      AuthService.fetchConnexion(this.form)
        .then(result => {
          console.log('connexion réussie:', result);
          // Créer l'objet authData
          const authData = {
            token: result.body.token,
            id: result.body.id.toString(),
            role: result.body.role
          };
          // Stocker dans le cookie
          AuthService.saveAuthToCookies(authData);
          this.form.reset();
          this.router.navigate([""]);
        })
        .catch(error => {
          console.error("Erreur dans la connexion: ", error);
        });
    }


  }
