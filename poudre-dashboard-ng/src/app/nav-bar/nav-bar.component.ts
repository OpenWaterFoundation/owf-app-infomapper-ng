import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, Inject} from '@angular/core';
import {  Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { navService }         from './nav-bar.service';
import { NavDirective } from './nav.directive';
import { navItem }      from './nav-item';

import { navLinkComponent } from './nav-link.component';
import { navDropdownComponent } from './nav-dropdown.component';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],

  //define navBar template
  //Valid insertion point is defined by the '<ng-templace>' tag (a reference to nav-bar.directive) and the selector 'menu-host'
  template: `
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <a class="navbar-brand" href="#"> Poudre Basin Information</a>

                <!-- Hamburger Icon -->
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarNav">
                  <ul class="navbar-nav mr-auto">
                    <ng-template nav-host></ng-template>
                    <li class="nav-item activate .ml-auto">
                    </li>
                  </ul>
                  <ul class="navbar-nav m1-auto">
                    <li class="nav-item activate .ml-auto">
                      <a class="nav-link" routerLink="/about">About the Project</a>
                    </li>
                    <li class="nav-item activate .ml-auto">
                      <a class="nav-link" href="http://openwaterfoundation.org" title="OWF home page" target="_blank"><img src="assets/img/OWF-Logo-Favicon-32x32.png"/></a>
                    </li>
                  </ul>
                </div>

            </nav>
            `
})
export class NavBarComponent implements OnInit {
  @Input() navs: navItem[];

  @ViewChild(NavDirective) navHost: NavDirective;



  active: String;

  constructor(private http: HttpClient, private componentFactoryResolver: ComponentFactoryResolver, private navService: navService) {  }

  getMyJSONData(path_to_json): Observable<any> {
    return this.http.get(path_to_json)
  }

  ngOnInit() {

    //determines configUrl based on which environment is running
    //var configUrl = environment.assetsRoot + "assets/menuConfig/testConfig1.json";
    //if (environment.production == true) {
    //  console.log("Production URL: " + configUrl);
    //}
    //else {
    //  console.log("Development URL: " + configUrl);
    //}

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
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(navLinkComponent);
        let viewContainerRef = this.navHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<navLinkComponent>componentRef.instance).data = this.navs[i].data;
      }
      //if there is a 'menu' attribute, load dropdown component
      else {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(navDropdownComponent);
        let viewContainerRef = this.navHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<navDropdownComponent>componentRef.instance).data = this.navs[i].data;
      }

    }
  }

  pageSelect(page: String) :void {
    this.active = page
  }


}
