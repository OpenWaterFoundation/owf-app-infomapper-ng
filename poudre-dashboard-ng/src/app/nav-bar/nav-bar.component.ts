import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, Inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { NavService }         from './nav-bar.service';
import { NavDirective } from './nav.directive';
import { NavItem }      from './nav-item';

import { NavLinkComponent } from './nav-link/nav-link.component';
import { NavDropdownComponent } from './nav-dropdown/nav-dropdown.component';

@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {
  
  @Input() navs: NavItem[];
  @ViewChild(NavDirective) navHost: NavDirective;

  active: String;

  constructor(private http: HttpClient, private componentFactoryResolver: ComponentFactoryResolver, private navService: NavService) {  }

  getMyJSONData(path_to_json): Observable<any> {
    return this.http.get(path_to_json)
  }

  ngOnInit() {
    //loads data from config file and calls loadComponent when tsfile is defined
    this.getMyJSONData("assets/menuConfig/testConfig1.json").subscribe (
      tsfile => {
        this.navService.saveConfiguration(tsfile);
        this.navs = this.navService.getNavigation();
        this.loadComponent(tsfile);
      }
    );
  }

  loadComponent(tsfile) {
    //creates new button component in navBar for each map specified in configFile, sets data based on ad service
    for (var i = 0; i < tsfile.mainMenu.length; i++) {
      //if there is not a 'menu' attribute, load static link component
      if (tsfile.mainMenu[i].menus == undefined) {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(NavLinkComponent);
        let viewContainerRef = this.navHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<NavLinkComponent>componentRef.instance).data = this.navs[i].data;
      }
      //if there is a 'menu' attribute, load dropdown component
      else {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(NavDropdownComponent);
        let viewContainerRef = this.navHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<NavDropdownComponent>componentRef.instance).data = this.navs[i].data;
      }
    }
  }

  pageSelect(page: String) :void {
    this.active = page
  }


}
