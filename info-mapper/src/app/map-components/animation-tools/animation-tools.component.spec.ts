import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationToolsComponent } from './animation-tools.component';

describe('AnimationToolsComponent', () => {
  let component: AnimationToolsComponent;
  let fixture: ComponentFixture<AnimationToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimationToolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimationToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
