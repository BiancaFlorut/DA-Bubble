import { TestBed } from '@angular/core/testing';

import { ChannelModalService } from './channel-modal.service';

describe('ChannelModalService', () => {
  let service: ChannelModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
