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



export const routes: Routes = [

    // {path :"",component:Teste}
    { path: "", component: HomeComponent },
    { path: "inscription", component: InscriptionComponent, canActivate: [ConnectedGuard] },
    { path: "information", component: InformationComponent },
    { path: "connexion", component: LoginComponent, canActivate: [ConnectedGuard] },
    { path: "connected", component: HeaderConnectedComponent, canActivate: [AuthGuard] },
    { path: "profil", component: ProfilComponent, canActivate: [AuthGuard] },
    { path: "chat", component: ChatComponent, canActivate: [AuthGuard] },
    // { path: "user", component: ProfilUsersComponent, canActivate: [AuthGuard]  }
    { path: "user/:username", component: ProfilUsersComponent, canActivate: [AuthGuard] },
    { path: "tarifs", component: TarifsComponent},
    { path: "contact", component: ContactComponent},
    { path : "success-paiement", component : SuccessPaiementComponent, canActivate: [AuthGuard]},
    { path : "failure-paiement", component : FailurePaiementComponent, canActivate: [AuthGuard]},


]