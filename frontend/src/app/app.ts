import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Teste } from "./teste/teste";
import { HeaderComponent } from './header-component/header-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
  
})
export class App {
  protected readonly title = signal('frontend');

  
}
