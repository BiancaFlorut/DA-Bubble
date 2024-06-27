import { TestBed } from '@angular/core/testing';

import { ShowProfileService } from './show-profile.service';

describe('ShowProfileService', () => {
  let service: ShowProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShowProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
