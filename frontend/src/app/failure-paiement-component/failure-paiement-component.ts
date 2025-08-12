import { Component, inject } from '@angular/core';
import { FooterComponent } from "../footer-component/footer-component";
import { Paiement } from '../service/paiement/paiement';

@Component({
  selector: 'app-failure-paiement-component',
  imports: [FooterComponent],
  templateUrl: './failure-paiement-component.html',
  styleUrl: './failure-paiement-component.css'
})
export class FailurePaiementComponent {


  paiementService = inject(Paiement)
  


}
