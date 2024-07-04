import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadChatHeaderComponent } from './thread-chat-header.component';

describe('ThreadChatHeaderComponent', () => {
  let component: ThreadChatHeaderComponent;
  let fixture: ComponentFixture<ThreadChatHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadChatHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadChatHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
