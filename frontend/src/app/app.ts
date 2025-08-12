import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header-component/header-component';
import { FooterComponent } from './footer-component/footer-component';
import { AuthService } from './service/auth/auth-service';
import { HeaderConnectedComponent } from './header-connected-component/header-connected-component';
import { CommonModule } from '@angular/common'; // <-- Ajoute cette ligne


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, HeaderConnectedComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'

})

export class App {
  authService = inject(AuthService)
  protected readonly title = signal('frontend');

  isAuthenticated = AuthService.isConnected();

   constructor() {
    if (this.isAuthenticated) {
      this.authService.isConnected = true;
    }

  }

}
