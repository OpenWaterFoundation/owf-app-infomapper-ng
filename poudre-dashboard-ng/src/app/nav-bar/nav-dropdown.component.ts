import { Directive, ViewContainerRef, Component, OnInit, Input }  from '@angular/core';
import { ViewChild, ComponentFactoryResolver} from '@angular/core';

import { DropDownDirective } from './dropdown.directive';

import { dropdownOptionComponent } from './nav-dropdownOption.component';
import { dropdownLinkComponent } from './nav-dropdownLink.component';


@Component({
  selector: 'app-nav-dropdown',
  //templateUrl: './nav-bar.component.html',
  //styleUrls: ['./nav-bar.component.css'],

//style="z-index:9999 !important; position:relative !important;"

  template: `

  <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" href="/map" id="navbarDropdown" role="button" data-toggle="dropdown">
      {{data.name}}
    </a>
    <div class="dropdown-menu" aria-labelledby="navbarDropdown">

      <ng-template dropdown-host></ng-template>

    </div>
  </li>

  `
})
export class navDropdownComponent implements OnInit {
  @Input() data: any;

  @ViewChild(DropDownDirective) dropdownHost: DropDownDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}


  ngOnInit() {
    this.loadComponent();
  }

  loadComponent() {

    for (var i = 0; i < this.data.menu.length; i++) {

      //if action is 'displayMap', create link to map component
      if (this.data.menu[i].action == 'displayMap') {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(dropdownOptionComponent);
        let viewContainerRef = this.dropdownHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<dropdownOptionComponent>componentRef.instance).data = this.data.menu[i];
      }
      //if action is externalLink, create a link component
      else {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(dropdownLinkComponent);
        let viewContainerRef = this.dropdownHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<dropdownLinkComponent>componentRef.instance).data = this.data.menu[i];
      }

    }
  }

}
