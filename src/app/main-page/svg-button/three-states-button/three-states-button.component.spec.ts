import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeStatesButtonComponent } from './three-states-button.component';

describe('ThreeStatesButtonComponent', () => {
  let component: ThreeStatesButtonComponent;
  let fixture: ComponentFixture<ThreeStatesButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeStatesButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreeStatesButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
