import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

@Component({

  styleUrls: ['./nav-bar.component.css'],

  template: `
  <li class="nav-item activate .ml-auto">
    <a class="dropdown-item" routerLink="/map"><img src="assets/img/baseline-map-24px.svg"/>{{data.name}}</a>
  </li>
  `
})
export class dropdownOptionComponent {
  @Input() data: any;

  //constructor(public component: Type<any>, public data: any) {}

}
