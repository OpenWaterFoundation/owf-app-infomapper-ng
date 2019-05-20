import { Component, OnInit, Input }            from '@angular/core';
import { ViewChild, ComponentFactoryResolver}  from '@angular/core';

import { DropDownDirective }                   from './dropdown.directive';

import { DropdownOptionComponent }             from './nav-dropdown-option/nav-dropdown-option.component';
import { DropdownLinkComponent }               from './nav-dropdown-link/nav-dropdown-link.component';


@Component({
  selector: 'app-nav-dropdown',
  styleUrls: ['./nav-dropdown.component.css'],
  templateUrl: `./nav-dropdown.component.html`
})
export class NavDropdownComponent implements OnInit {
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
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(DropdownOptionComponent);
        let viewContainerRef = this.dropdownHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<DropdownOptionComponent>componentRef.instance).data = this.data.menu[i];
      }
      //if action is externalLink, create a link component
      else {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(DropdownLinkComponent);
        let viewContainerRef = this.dropdownHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<DropdownLinkComponent>componentRef.instance).data = this.data.menu[i];
      }
    }
  }

}
