import { Component } from '@angular/core';
import { FooterComponent } from '../footer-component/footer-component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
// import { visitAll } from '@angular/compiler';
import { CommonModule } from '@angular/common'; // <-- Ajoute cette ligne


@Component({
  selector: 'app-inscription-component',
  imports: [FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './inscription-component.html',
  styleUrl: './inscription-component.css'
})
export class InscriptionComponent {

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


  onSubmitInscription() {

    if (this.form.invalid) {
      return;
    }
    const formData = this.form.value;
    console.log(formData);

  }
}
