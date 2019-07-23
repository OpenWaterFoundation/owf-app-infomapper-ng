import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegendSymbolsComponent } from './legend-symbols.component';

describe('LegendSymbolsComponent', () => {
  let component: LegendSymbolsComponent;
  let fixture: ComponentFixture<LegendSymbolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegendSymbolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendSymbolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
