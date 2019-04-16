import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

@Component({
  template: `
  <li class="nav-item activate .ml-auto">
    <div class="dropdown-divider"></div>
    <a class="dropdown-item" routerLink="{{data.url}}" target="_blank"><img src="assets/img/baseline-open_in_new-24px.svg"/>{{data.name}}</a>
  </li>
  `
})
export class dropdownLinkComponent {
  @Input() data: any;

  //constructor(public component: Type<any>, public data: any) {}

}
