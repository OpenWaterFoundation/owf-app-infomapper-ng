import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[nav-host]',
})
export class NavDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
