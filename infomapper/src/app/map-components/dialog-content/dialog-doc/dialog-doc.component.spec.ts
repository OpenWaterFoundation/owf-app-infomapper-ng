import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDocComponent } from './dialog-doc.component';

describe('DialogDocComponent', () => {
  let component: DialogDocComponent;
  let fixture: ComponentFixture<DialogDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
