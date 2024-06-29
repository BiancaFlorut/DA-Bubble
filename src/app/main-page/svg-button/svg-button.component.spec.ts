import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgButtonComponent } from './svg-button.component';

describe('SvgButtonComponent', () => {
  let component: SvgButtonComponent;
  let fixture: ComponentFixture<SvgButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SvgButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
