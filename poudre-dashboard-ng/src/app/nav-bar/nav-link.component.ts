import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

@Component({
  template: `
  <li class="nav-item activate .ml-auto">
    <a class="nav-link" routerLink="/map/1">{{data.name}}</a>
  </li>
  `
})
export class navLinkComponent {
  @Input() data: any;

}
