import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTSTableComponent } from './dialog-tstable.component';

describe('DialogTSTableComponent', () => {
  let component: DialogTSTableComponent;
  let fixture: ComponentFixture<DialogTSTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTSTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTSTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
