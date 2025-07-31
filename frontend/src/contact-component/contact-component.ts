import { Component } from '@angular/core';
import { FooterComponent } from '../app/footer-component/footer-component';
import { FormsModule, NgForm, NgModel } from '@angular/forms';

@Component({
  selector: 'app-contact-component',
  standalone: true,
  imports: [FooterComponent, FormsModule],
  templateUrl: './contact-component.html',
  styleUrl: './contact-component.css'
})
export class ContactComponent {
  email = '';
  subject = '';
  message = '';

  onSubmitContact() {
    // Ici tu peux appeler un service pour envoyer l'email côté serveur
    // Exemple : this.contactService.sendMail(this.email, this.subject, this.message)
    alert('Votre message a bien été envoyé !');
    this.email = '';
    this.subject = '';
    this.message = '';
  }
}
