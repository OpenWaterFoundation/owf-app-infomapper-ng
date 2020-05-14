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

  active: string;

  constructor(private mapService: MapService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private globals: Globals) { }

  ngOnInit() {
      this.mapService.urlExists(this.mapService.getAppPath() + this.mapService.getAppConfigFile()).subscribe(() => {
        this.mapService.getData(this.mapService.getAppPath() + this.mapService.getAppConfigFile()).subscribe(
          (tsfile: any) => {
            this.title = tsfile.title;        
            this.loadComponent(tsfile);
        });
      }, (err: any) => {        
        this.mapService.setAppPath('assets/app-default/');      
        this.mapService.getData(this.mapService.getAppPath() + this.mapService.getAppConfigFile()).subscribe(
          (tsfile: any) => {
            this.title = tsfile.title;        
            this.loadComponent(tsfile);
        });
      });
  }

  loadComponent(tsfile: any) {
    var contentPageFound: boolean = false;
    var mapConfigPageFound: boolean = false;
    // Creates new button (tab) component in navBar for each map specified in configFile, sets data based on ad service
    // loop through the mainMenu selections (there are a total of 8 at the moment 'Basin Entities' - 'MapLink')
    for (let i = 0; i < tsfile.mainMenu.length; i++) {
      // Check to see if the menu should be displayed yet
      if (tsfile.mainMenu[i].enabled != 'false') {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(TabComponent);
        let viewContainerRef = this.navHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<TabComponent>componentRef.instance).data = tsfile.mainMenu[i];
      }

      if (tsfile.mainMenu[i].action == 'contentPage' && !contentPageFound) {
        contentPageFound = true;
        this.setContentPath(tsfile.mainMenu[i]);
      } else if (tsfile.mainMenu[i].action == 'displayMap' && !mapConfigPageFound) {            
        mapConfigPageFound = true;
        this.setMapConfigPath(tsfile.mainMenu[i]);
      }
      if (tsfile.mainMenu[i].menus && !contentPageFound) {        
        for (let menu = 0; menu < tsfile.mainMenu[i].menus.length; menu++) {          
          if (tsfile.mainMenu[i].menus[menu].action == 'contentPage') {
            contentPageFound = true;
            this.setContentPath(tsfile.mainMenu[i].menus[menu])
          } 
        }
      }
      if (tsfile.mainMenu[i].menus && !mapConfigPageFound) {        
        for (let menu = 0; menu < tsfile.mainMenu[i].menus.length; menu++) {
          if (tsfile.mainMenu[i].menus[menu].action == 'displayMap') {
            mapConfigPageFound = true;
            this.setMapConfigPath(tsfile.mainMenu[i].menus[menu])
          } 
        }
      }
    }
  }

  setMapConfigPath(menu: any) {
    let path: string = menu.mapProject;
    let pathArray: string[] = path.split('/');
    var mapConfigPath: string = '';

    pathArray.forEach((item: string) => {
      if (item.includes('.json')) {
      } else {
        mapConfigPath += item + '/';
      }
    });
      
    this.mapService.setMapConfigPath(mapConfigPath);
  }

  setContentPath(menu: any) {
    let path: string = menu.markdownFile;
    let pathArray: string[] = path.split('/');
    var contentPath: string = '';

    pathArray.forEach((item: string) => {
      if (item.includes('.md')) {
      } else {
        contentPath += item + '/';
      }
    });    
    this.mapService.setContentPath(contentPath);
  }

  pageSelect(page: string) :void {
    this.active = page
  }
}
