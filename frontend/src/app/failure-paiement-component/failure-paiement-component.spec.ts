import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailurePaiementComponent } from './failure-paiement-component';

describe('FailurePaiementComponent', () => {
  let component: FailurePaiementComponent;
  let fixture: ComponentFixture<FailurePaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FailurePaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FailurePaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
