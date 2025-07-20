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



export const routes: Routes = [

    // {path :"",component:Teste}
    { path: "", component: HomeComponent },
    { path: "inscription", component: InscriptionComponent, canActivate: [ConnectedGuard] },
    { path: "information", component: InformationComponent },
    { path: "connexion", component: LoginComponent, canActivate: [ConnectedGuard] },
    { path: "connected", component: HeaderConnectedComponent, canActivate: [AuthGuard] },
    { path: "profil", component: ProfilComponent}


]