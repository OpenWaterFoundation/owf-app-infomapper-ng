import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[side-panel-info-host]',
})
export class SidePanelInfoDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
