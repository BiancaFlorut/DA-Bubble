import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadInputComponent } from './thread-input.component';

describe('ThreadInputComponent', () => {
  let component: ThreadInputComponent;
  let fixture: ComponentFixture<ThreadInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
