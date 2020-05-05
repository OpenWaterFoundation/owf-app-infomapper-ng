import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[legend-symbol-hook]',
})
export class LegendSymbolsDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
