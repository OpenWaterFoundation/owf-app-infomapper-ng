import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarBottomComponent } from './sidebar-bottom.component';

describe('SidebarBottomComponent', () => {
  let component: SidebarBottomComponent;
  let fixture: ComponentFixture<SidebarBottomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarBottomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
