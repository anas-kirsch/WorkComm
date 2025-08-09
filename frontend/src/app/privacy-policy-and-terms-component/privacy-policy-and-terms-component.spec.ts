import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPolicyAndTermsComponent } from './privacy-policy-and-terms-component';

describe('PrivacyPolicyAndTermsComponent', () => {
  let component: PrivacyPolicyAndTermsComponent;
  let fixture: ComponentFixture<PrivacyPolicyAndTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicyAndTermsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyAndTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
