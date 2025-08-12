import { TestBed } from '@angular/core/testing';

import { PremiumAccess } from './premium-access';

describe('PremiumAccess', () => {
  let service: PremiumAccess;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PremiumAccess);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
