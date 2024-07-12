import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateChannelComponent } from './update-channel.component';

describe('UpdateChannelComponent', () => {
  let component: UpdateChannelComponent;
  let fixture: ComponentFixture<UpdateChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateChannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
