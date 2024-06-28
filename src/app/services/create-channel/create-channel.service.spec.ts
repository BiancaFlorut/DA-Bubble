import { TestBed } from '@angular/core/testing';

import { CreateChannelService } from './create-channel.service';

describe('CreateChannelService', () => {
  let service: CreateChannelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateChannelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
