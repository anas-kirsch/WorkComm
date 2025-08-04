import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonnementComponent } from './abonnement-component';

describe('AbonnementComponent', () => {
  let component: AbonnementComponent;
  let fixture: ComponentFixture<AbonnementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbonnementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbonnementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
