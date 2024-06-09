import { TestBed } from '@angular/core/testing';

import { HandleCreateAccountService } from './handle-create-account.service';

describe('HandleCreateAccountService', () => {
  let service: HandleCreateAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandleCreateAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
