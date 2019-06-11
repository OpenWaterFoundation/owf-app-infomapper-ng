import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[background-layer-hook]',
})
export class BackgroundLayerDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
