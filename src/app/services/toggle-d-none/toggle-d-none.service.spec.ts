import { TestBed } from '@angular/core/testing';

import { ToggleDNoneService } from './toggle-d-none.service';

describe('ToggleDNoneService', () => {
  let service: ToggleDNoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleDNoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
