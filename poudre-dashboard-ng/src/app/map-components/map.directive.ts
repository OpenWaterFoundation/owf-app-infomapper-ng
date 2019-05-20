import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[layer-host]',
})
export class MapDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
