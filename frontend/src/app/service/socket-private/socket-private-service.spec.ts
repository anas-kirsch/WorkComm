import { TestBed } from '@angular/core/testing';

import { SocketPrivateService } from './socket-private-service';

describe('SocketPrivateService', () => {
  let service: SocketPrivateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
