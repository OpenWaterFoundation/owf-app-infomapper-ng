import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dropdown-host]',
})
export class DropDownDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
