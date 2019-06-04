import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[layer-host]',
})
export class LayerDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
