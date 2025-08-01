import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderConnectedComponent } from './header-connected-component';

describe('HeaderConnectedComponent', () => {
  let component: HeaderConnectedComponent;
  let fixture: ComponentFixture<HeaderConnectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderConnectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderConnectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
