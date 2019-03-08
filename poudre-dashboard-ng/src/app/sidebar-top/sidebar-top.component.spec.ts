import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarTopComponent } from './sidebar-top.component';

describe('SidebarTopComponent', () => {
  let component: SidebarTopComponent;
  let fixture: ComponentFixture<SidebarTopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarTopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
