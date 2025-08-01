import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth-service';
import { RouterTestingHarness } from '@angular/router/testing';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (AuthService.isConnected()) {
      return true;
    } else {
      this.router.navigate([""]);
      return false;
    }
  }

}
  
  
  
@Injectable({ providedIn: 'root' })
export class ConnectedGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (AuthService.isConnected()) {
      this.router.navigate([""]);
      return false; // Accès refusé si déjà connecté
    } else {
      return true; // Accès autorisé si non connecté
    }
  }
}