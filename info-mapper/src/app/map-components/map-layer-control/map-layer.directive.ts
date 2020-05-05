import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[map-layer-hook]',
})
export class MapLayerDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
