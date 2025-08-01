import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FooterComponent } from '../app/footer-component/footer-component';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { AuthService } from '../app/service/auth/auth-service';
import { environment } from '../environments/environment.development';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-contact-component',
  standalone: true,
  imports: [FooterComponent, FormsModule, CommonModule],
  templateUrl: './contact-component.html',
  styleUrl: './contact-component.css'
})
export class ContactComponent {
  email = '';
  subject = '';
  message = '';
  showSuccess = false;
  showError = false;
  errorMsg = '';
  private cdr: ChangeDetectorRef;
  private authService: AuthService;
  static apiURL = environment.apiURL;

  constructor() {
    this.cdr = inject(ChangeDetectorRef);
    this.authService = inject(AuthService);
  }

  async onSubmitContact() {
    // Validation JS côté client
    if (!this.email || !this.subject || !this.message) {
      this.errorMsg = 'Tous les champs sont obligatoires.';
      this.showError = true;
      setTimeout(() => { this.showError = false; }, 2000);
      return;
    }
    if (!this.isValidEmail(this.email)) {
      this.errorMsg = 'Veuillez entrer un email valide.';
      this.showError = true;
      setTimeout(() => { this.showError = false; }, 2000);
      return;
    }
    await this.fetchMailContact(this.email, this.subject, this.message);
    this.showSuccess = true;
    this.email = '';
    this.subject = '';
    this.message = '';
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  isValidEmail(email: string): boolean {
    // Regex simple pour valider un email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async fetchMailContact(email: string, subject: string, message: string) {
    
    try { 
      console.log('Envoi du mail:', { email, subject, message });
      const emailSend = await this.emailSend(email, subject, message);
      console.log(emailSend);

    } catch (error) {
      console.error(error)
    }
      
  }



  /**
   * cette fonction fetch le backend pour envoyer le contenu d'un mail
   * @param email 
   * @param subject 
   * @param message 
   * @returns 
   */
  async emailSend(email: string, subject: string, message: string) {

    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();
    // if (tokenHeader.Authorization) {
    //   myHeaders.append("Authorization", tokenHeader.Authorization);
    // }

     myHeaders.append("Content-Type", "application/json"); 

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        email,
        subject,
        message
      })
    };

    try {
      const response = await fetch(`${AuthService.apiURL}/api/user/contact`, requestOptions);
      const confirmSended = await response.json();
      if (!response.ok) throw new Error(confirmSended.error || "Erreur lors de l'envoie du contenu du formulaire de contact");
      return confirmSended;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }




}
