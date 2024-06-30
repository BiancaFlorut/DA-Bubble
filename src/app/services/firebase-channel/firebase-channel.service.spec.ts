import { TestBed } from '@angular/core/testing';

import { FirebaseChannelService } from './firebase-channel.service';

describe('FirebaseChannelService', () => {
  let service: FirebaseChannelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseChannelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
