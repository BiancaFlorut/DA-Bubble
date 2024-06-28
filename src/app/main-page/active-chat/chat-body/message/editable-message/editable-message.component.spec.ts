import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableMessageComponent } from './editable-message.component';

describe('EditableMessageComponent', () => {
  let component: EditableMessageComponent;
  let fixture: ComponentFixture<EditableMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditableMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
