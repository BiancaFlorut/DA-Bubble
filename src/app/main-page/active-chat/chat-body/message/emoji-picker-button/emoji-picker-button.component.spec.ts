import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiPickerButtonComponent } from './emoji-picker-button.component';

describe('EmojiPickerButtonComponent', () => {
  let component: EmojiPickerButtonComponent;
  let fixture: ComponentFixture<EmojiPickerButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojiPickerButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmojiPickerButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
