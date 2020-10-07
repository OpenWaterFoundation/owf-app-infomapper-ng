import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPropertiesComponent } from './dialog-properties.component';

describe('DialogPropertiesComponent', () => {
  let component: DialogPropertiesComponent;
  let fixture: ComponentFixture<DialogPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
