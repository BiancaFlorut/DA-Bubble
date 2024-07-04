import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadBodyComponent } from './thread-body.component';

describe('ThreadBodyComponent', () => {
  let component: ThreadBodyComponent;
  let fixture: ComponentFixture<ThreadBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadBodyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
