import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessPaiementComponent } from './success-paiement-component';

describe('SuccessPaiementComponent', () => {
  let component: SuccessPaiementComponent;
  let fixture: ComponentFixture<SuccessPaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessPaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessPaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
