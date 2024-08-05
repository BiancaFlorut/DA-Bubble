import { TestBed } from '@angular/core/testing';

import { NewMessageService } from './new-message.service';

describe('NewMessageService', () => {
  let service: NewMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
