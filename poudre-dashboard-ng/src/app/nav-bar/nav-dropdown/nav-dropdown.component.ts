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
export class NavDropdownComponent {
  @Input() data: any;
  @ViewChild(DropDownDirective) dropdownHost: DropDownDirective;
  private isViewInitialized: boolean = false;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngAfterContentInit() {
    console.log(this.data);
    this.loadComponent();
  }

  loadComponent() {
    if (!this.isViewInitialized){
      return;
    }
    setTimeout(()=>{
      for (var i = 0; i < this.data.menu.length; i++) {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(DropdownOptionComponent);
        let viewContainerRef = this.dropdownHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<DropdownOptionComponent>componentRef.instance).data = this.data;
      }
    }, 1)
  }

}
