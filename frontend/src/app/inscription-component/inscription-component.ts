import { Component } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
// import { visitAll } from '@angular/compiler';
import { CommonModule } from '@angular/common'; // <-- Ajoute cette ligne
import { AuthService } from '../service/auth/auth-service';


@Component({
  selector: 'app-inscription-component',
  imports: [FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './inscription-component.html',
  styleUrl: './inscription-component.css'
})
export class InscriptionComponent {

  selectedFile: File | null = null;

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

  static validateSamePassword(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmpassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }



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

  onSubmitInscription() {
    if (this.form.invalid) {
      return;
    }
    AuthService.fetchInscription(this.form)
      .then(result => {
        console.log('Inscription réussie:', result);
        // Ajoute ici le traitement en cas de succès (affichage, navigation, etc.)
      })
      .catch(error => {
        console.error('Erreur inscription:', error);
        // Ajoute ici le traitement en cas d'erreur (affichage, etc.)
      });
  }
}
