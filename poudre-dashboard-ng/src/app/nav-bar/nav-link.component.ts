import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

@Component({
  template: `
  <li class="nav-item activate .ml-auto">
    <a class="nav-link" routerLink="/map">{{data.name}}</a>
  </li>
  `
})
export class navLinkComponent {
  @Input() data: any;

  //constructor(public component: Type<any>, public data: any) {}

}

//<button class="navbar-toggler">Testing</button>
//  <button type="button" data-target="#navbarNav" aria-controls="navbarNav"  aria-label={data.name} routerLink="/map">
//    {{data.name}}
//  </button>
