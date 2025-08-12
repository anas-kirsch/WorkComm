import { Routes } from '@angular/router';
// import { FooterComponent } from './footer-component/footer-component';
import { HeaderComponent } from './header-component/header-component';
import { HomeComponent } from './home-component/home-component';
import { InscriptionComponent } from './inscription-component/inscription-component';
import { LoginComponent } from './login-component/login-component';
import { InformationComponent } from './information-component/information-component';
import { HeaderConnectedComponent } from './header-connected-component/header-connected-component';
import { AuthGuard } from './service/auth/authGuard';
import { ConnectedGuard } from './service/auth/authGuard';
import { Component } from '@angular/core';
import { ProfilComponent } from './profil-component/profil-component';
import { ChatComponent } from './chat-component/chat-component';
import { ProfilUsersComponent } from './profil-users-component/profil-users-component';
import { TarifsComponent } from './tarifs-component/tarifs-component';
import { ContactComponent } from './contact-component/contact-component';
import { SuccessPaiementComponent } from './success-paiement-component/success-paiement-component';
import { FailurePaiementComponent } from './failure-paiement-component/failure-paiement-component';
import { PrivacyPolicyAndTermsComponent } from './privacy-policy-and-terms-component/privacy-policy-and-terms-component';



export const routes: Routes = [
  // Page d'accueil
  { path: "", component: HomeComponent },
  // Page d'inscription, accessible uniquement si non connecté
  { path: "inscription", component: InscriptionComponent, canActivate: [ConnectedGuard] },
  // Page d'informations générales
  { path: "information", component: InformationComponent },
  // Page de connexion, accessible uniquement si non connecté
  { path: "connexion", component: LoginComponent, canActivate: [ConnectedGuard] },
  // Header connecté, affiché uniquement si authentifié
  { path: "connected", component: HeaderConnectedComponent, canActivate: [AuthGuard] },
  // Profil utilisateur connecté
  { path: "profil", component: ProfilComponent, canActivate: [AuthGuard] },
  // Page de chat, accessible uniquement si authentifié
  { path: "chat", component: ChatComponent, canActivate: [AuthGuard] },
  // Profil d'un autre utilisateur, accessible uniquement si authentifié
  { path: "user/:username", component: ProfilUsersComponent, canActivate: [AuthGuard] },
  // Page des tarifs premium
  { path: "tarifs", component: TarifsComponent},
  // Page de contact
  { path: "contact", component: ContactComponent},
  // Page de succès de paiement, accessible uniquement si authentifié
  { path : "success-paiement", component : SuccessPaiementComponent, canActivate: [AuthGuard]},
  // Page d'échec de paiement, accessible uniquement si authentifié
  { path : "failure-paiement", component : FailurePaiementComponent, canActivate: [AuthGuard]},
  // Page de politique de confidentialité et conditions
  { path : "goPrivacyPolicyAndTerms", component : PrivacyPolicyAndTermsComponent}

]