import { Routes } from '@angular/router';
// import { FooterComponent } from './footer-component/footer-component';
import { HeaderComponent } from './header-component/header-component';
import { HomeComponent } from './home-component/home-component';
import { InscriptionComponent } from './inscription-component/inscription-component';
import { LoginComponent } from './login-component/login-component';
import { InformationComponent } from './information-component/information-component';

export const routes: Routes = [

    // {path :"",component:Teste}
    {path : "", component : HomeComponent},
    {path : "inscription",component : InscriptionComponent},
    {path : "information",component : InformationComponent},
    {path : "connexion",component : LoginComponent}
];
