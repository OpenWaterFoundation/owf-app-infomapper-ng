import { Component, OnInit,
          ViewChild,
          ComponentFactoryResolver } from '@angular/core';
 
import { NavDirective }         from './nav.directive';

import { MapService }           from '../map-components/map.service';

import { TabComponent }         from './tab/tab.component';

import { Globals }              from '../globals';

@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],
  templateUrl: './nav-bar.component.html',
  providers: [ Globals ]
})
export class NavBarComponent implements OnInit {

  @ViewChild(NavDirective) navHost: NavDirective;
  public title: string;

  active: String;

  constructor(private mapService: MapService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private globals: Globals) { }

  ngOnInit() {
    let configurationFile = this.globals.configurationFile;

    if (!this.mapService.urlExists(configurationFile)) {
      configurationFile = 'assets/app-config-default.json';
      if (!this.mapService.urlExists(configurationFile)) {
        console.error('app-config.json or app-config-default must be used for app configuration')
      } else {
        this.globals.configurationFilePath = 'assets/data-maps-default/';
      }
    } else {
      this.globals.configurationFilePath = 'assets/data-maps/';
    }
    
    // Loads data from config file and calls loadComponent when tsfile is defined
    this.mapService.getJSONdata(configurationFile).subscribe(
      (tsfile: any) => {
        this.title = tsfile.title;        
        this.loadComponent(tsfile);
      }
    );
  }

  loadComponent(tsfile: any) {
    // Creates new button (tab) component in navBar for each map specified in configFile, sets data based on ad service
    // loop through the mainMenu selections (there are a total of 8 at the moment 'Basin Entities' - 'MapLink')
    for (let i = 0; i < tsfile.mainMenu.length; i++) {
      // Check to see if the menu should be displayed yet
      if (tsfile.mainMenu[i].enabled == 'true') {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(TabComponent);
        let viewContainerRef = this.navHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<TabComponent>componentRef.instance).data = tsfile.mainMenu[i];
      }
    }
  }

  pageSelect(page: String) :void {
    this.active = page
  }
}
