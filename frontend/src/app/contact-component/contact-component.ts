import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment.development';
import { AuthService } from '../service/auth/auth-service';
import { FooterComponent } from '../footer-component/footer-component';


@Component({
  selector: 'app-contact-component',
  standalone: true,
  imports: [FooterComponent, FormsModule, CommonModule],
  templateUrl: './contact-component.html',
  styleUrl: './contact-component.css'
})

export class ContactComponent {
  /** Champ honeypot pour détection de bots */
  honeypot = '';
  /** Adresse email saisie par l'utilisateur */
  email = '';
  /** Sujet du message */
  subject = '';
  /** Contenu du message */
  message = '';
    /** Sujet nettoyé */
    get sanitizedSubject() {
      return this.sanitizeInput(this.subject);
    }
    /** Message nettoyé */
    get sanitizedMessage() {
      return this.sanitizeInput(this.message);
    }
  /** Affiche le message de succès après envoi */
  showSuccess = false;
  /** Nettoie une chaîne pour éviter les injections simples et traversée de répertoire */
  sanitizeInput(input: string): string {
    // Supprime ../ et encode < >
    return input.replace(/\.\./g, '')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
  }
  /** Affiche le message d'erreur en cas de problème */
  showError = false;
  /** Message d'erreur à afficher */
  errorMsg = '';
  /** ChangeDetectorRef pour forcer la mise à jour de l'UI */
  private cdr: ChangeDetectorRef;
  /** Service d'authentification pour récupérer le token */
  private authService: AuthService;
  /** URL de l'API backend */
  static apiURL = environment.apiURL;

  /**
   * Constructeur : injection des services nécessaires
   */
  constructor() {
    this.cdr = inject(ChangeDetectorRef);
    this.authService = inject(AuthService);
  }

  /**
   * Soumet le formulaire de contact après validation côté client
   */
  async onSubmitContact() {
    // Vérification anti-bot : si le champ honeypot est rempli, on bloque l'envoi
    if (this.honeypot && this.honeypot.trim() !== '') {
      this.errorMsg = "Erreur : comportement suspect détecté.";
      this.showError = true;
      setTimeout(() => { this.showError = false; }, 2000);
      return;
    }
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
  // Utilise les champs nettoyés
  await this.fetchMailContact(this.email, this.sanitizedSubject, this.sanitizedMessage);
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

  /**
   * Vérifie la validité d'une adresse email avec une regex simple
   */
  isValidEmail(email: string): boolean {
    // Regex simple pour valider un email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Envoie le mail de contact au backend
   */
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
  /**
   * Fait l'appel HTTP POST au backend pour envoyer le contenu du mail
   * @param email Adresse email du destinataire
   * @param subject Sujet du mail
   * @param message Contenu du mail
   * @returns Réponse du backend
   */
  async emailSend(email: string, subject: string, message: string) {

    const tokenHeader = this.authService.insertTokeninHeader();

    const myHeaders = new Headers();

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
