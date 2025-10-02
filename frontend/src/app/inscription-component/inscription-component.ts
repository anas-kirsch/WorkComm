import { Component } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
// import { visitAll } from '@angular/compiler';
import { CommonModule } from '@angular/common'; // <-- Ajoute cette ligne
import { AuthService } from '../service/auth/auth-service';
import { Router } from '@angular/router';
import { core } from '@angular/compiler';

@Component({
  selector: 'app-inscription-component',
  imports: [FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './inscription-component.html',
  styleUrl: './inscription-component.css'
})

export class InscriptionComponent {
  /** Nettoie une chaîne pour éviter les injections simples et traversée de répertoire */
  sanitizeInput(input: string): string {
    return input.replace(/\.\./g, '')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
  }
  /**
   * Router Angular pour la navigation entre les pages
   */
  router : Router = new Router()

  /** Fichier image sélectionné pour la photo de profil */
  selectedFile: File | null = null;

  /**
   * Formulaire d'inscription avec validation des champs
   * - username : requis, min 3 caractères, lettres/chiffres/_
   * - email : requis, format email
   * - bio : facultatif
   * - password : requis, min 8 caractères, 1 maj, 1 min, 1 chiffre
   * - confirmpassword : requis
   * - picture : facultatif (image)
   * - validateur custom : mot de passe et confirmation identiques
   */
  form: FormGroup = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern('^[a-zA-Z0-9_]+$')
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    bio: new FormControl(''),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'),
    ]),
    confirmpassword: new FormControl('', [
      Validators.required
    ]),
    picture: new FormControl(''),
  }, { validators: [InscriptionComponent.validateSamePassword] });


  /**
   * Valide que le mot de passe et la confirmation sont identiques
   */
  static validateSamePassword(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmpassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }



  /** Navigue vers la page de connexion */
  goConnexion(){
    this.router.navigate(["connexion"]);
  }




  /**
   * Gère la sélection d'un fichier image pour la photo de profil
   * - Vérifie le type et la taille
   * - Met à jour le formulaire si OK
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Vérification du type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert("Format d'image non supporté. Utilisez jpg, jpeg, png ou gif.");
        this.form.get('picture')?.setValue('');
        this.selectedFile = null;
        return;
      }

      // Vérification de la taille (max 2 Mo)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("La photo est trop grande (max 2 Mo).");
        this.form.get('picture')?.setValue('');
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.form.get('picture')?.setValue(file);
    }
  }


  /**
   * Soumet le formulaire d'inscription si valide
   * - Appelle le service d'inscription
   * - Réinitialise le formulaire et le fichier sélectionné
   * - Redirige vers la page d'information en cas de succès
   */
  onSubmitInscription() {
    if (this.form.invalid) {
      return;
    }
    // Nettoyage des champs username et bio dans le formulaire
    this.form.get('username')?.setValue(this.sanitizeInput(this.form.get('username')?.value));
    this.form.get('bio')?.setValue(this.sanitizeInput(this.form.get('bio')?.value));
    AuthService.fetchInscription(this.form)
      .then(result => {
        console.log('Inscription réussie:', result);
        this.form.reset();
        this.selectedFile = null;
        this.router.navigate(["information"]);
      })
      .catch(error => {
        console.error('Erreur inscription:', error);
      });
  }
}
