import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

import { navComponent } from './nav.component';

@Component({
  template: `

  <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" href="/map" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{data.name}}
    </a>


    <div class="dropdown-menu" aria-labelledby="navbarDropdown">
      <a class="dropdown-item"><img src="{{mapIcon}}"/>{{data.menu[0].name}}</a>
      <a class="dropdown-item" routerLink="/map"><img src="{{mapIcon}}"/>Fishing</a>
      <a class="dropdown-item" routerLink="/map"><img src="{{mapIcon}}"/>Environmental Flows</a>
      <div class="dropdown-divider"></div>
      <a class="dropdown-item" routerLink="http://snodas.cdss.state.co.us/app/index.html" target="_blank"><img src="{{externalLinkIcon}}"/>External Link - SNODAS</a>
    </div>


  </li>

  `
})
export class navDropdownComponent implements navComponent{
  @Input() data: any;

  //constructor(public component: Type<any>, public data: any) {}

}
