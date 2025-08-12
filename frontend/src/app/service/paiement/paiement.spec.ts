import { TestBed } from '@angular/core/testing';

import { Paiement } from './paiement';

describe('Paiement', () => {
  let service: Paiement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Paiement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
