import { TestBed } from '@angular/core/testing';

import { ThreadChatService } from './thread-chat.service';

describe('ThreadChatService', () => {
  let service: ThreadChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThreadChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
