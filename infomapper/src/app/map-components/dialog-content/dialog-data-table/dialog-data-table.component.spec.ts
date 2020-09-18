import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDataTableComponent } from './dialog-data-table.component';

describe('DialogDataTableComponent', () => {
  let component: DialogDataTableComponent;
  let fixture: ComponentFixture<DialogDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDataTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
