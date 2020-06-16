import {  Component, OnInit,
          Inject, ViewChild,
          ComponentFactoryResolver } from '@angular/core';
          
import { Title }                     from '@angular/platform-browser';
import { DOCUMENT }                  from '@angular/common';
 
import { NavDirective }              from './nav.directive';

import { MapService }                from '../map-components/map.service';

import { TabComponent }              from './tab/tab.component';
import { AppService }                from '../app.service';


@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {

  @ViewChild(NavDirective) navHost: NavDirective;
  public title: string;
  appError: boolean = false;

  active: string;

  constructor(private appService: AppService,
              private mapService: MapService,
              private componentFactoryResolver: ComponentFactoryResolver,
              public titleService: Title,
              @Inject(DOCUMENT) private document: HTMLDocument) { }

  ngOnInit() {
      this.mapService.urlExists(this.mapService.getAppPath() +
                                this.mapService.getAppConfigFile()).subscribe(
                                  () => {
        this.mapService.getData(this.mapService.getAppPath() +
                                this.mapService.getAppConfigFile()).subscribe(
                                  (appConfigFile: any) => {
                                    this.mapService.setAppConfig(appConfigFile);
                                    this.title = appConfigFile.title;
                                    this.mapService.setTitle(this.title);
                                    this.titleService.setTitle(this.title);
                                    this.loadComponent(appConfigFile);
                                });
      }, (err: any) => {  
        this.mapService.setAppPath('assets/app-default/');
        console.log("Using the 'assets/app-default/' configuration");

        if (err.message.includes('Http failure during parsing')) {
          this.appError = true;
        }
        
        this.mapService.getData(this.mapService.getAppPath() +
                                this.mapService.getAppConfigFile()).subscribe(
                                  (appConfigFile: any) => {
                                    this.mapService.setAppConfig(appConfigFile);
                                    this.title = appConfigFile.title;
                                    this.mapService.setTitle(this.title);
                                    this.titleService.setTitle(this.title);
                                    this.loadComponent(appConfigFile);
                                });
      });
  }

  loadComponent(appConfigFile: any) {

    this.setFavicon(appConfigFile);

    // Creates new button (tab) component in navBar for each map specified in configFile, sets data based on ad service
    // loop through the mainMenu selections (there are a total of 8 at the moment 'Basin Entities' - 'MapLink')
    for (let i = 0; i < appConfigFile.mainMenu.length; i++) {
      // Check to see if the menu should be displayed yet
            
      if (appConfigFile.mainMenu[i].visible != 'false') {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(TabComponent);
        let viewContainerRef = this.navHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<TabComponent>componentRef.instance).data = appConfigFile.mainMenu[i];
      }

      if (appConfigFile.mainMenu[i].action == 'contentPage' &&
          appConfigFile.mainMenu[i].markdownFile.includes('/')) {

        this.mapService.addContentPath(appConfigFile.mainMenu[i].markdownFile);
      } else if (appConfigFile.mainMenu[i].action == 'displayMap' &&
                  appConfigFile.mainMenu[i].mapProject.includes('/')) { 

        this.mapService.addMapConfigPath(appConfigFile.mainMenu[i].mapProject);
      }
      if (appConfigFile.mainMenu[i].menus) {  
        for (let menu = 0; menu < appConfigFile.mainMenu[i].menus.length; menu++) {    
          if (appConfigFile.mainMenu[i].menus[menu].action == 'contentPage' &&
          appConfigFile.mainMenu[i].menus[menu].markdownFile &&
          appConfigFile.mainMenu[i].menus[menu].markdownFile.includes('/')) {
            this.mapService.addContentPath(appConfigFile.mainMenu[i].menus[menu].markdownFile);
          } 
        }
      }
      if (appConfigFile.mainMenu[i].menus) {              
        for (let menu = 0; menu < appConfigFile.mainMenu[i].menus.length; menu++) {
          if (appConfigFile.mainMenu[i].menus[menu].action == 'displayMap' &&
              appConfigFile.mainMenu[i].menus[menu].mapProject &&
              appConfigFile.mainMenu[i].menus[menu].mapProject.includes('/')) {
            
            this.mapService.addMapConfigPath(appConfigFile.mainMenu[i].menus[menu].mapProject);
          } 
        }
      }
    }
  }

  setFavicon(appConfigFile: any): void {

    if (appConfigFile.favicon)
      this.appService.setFaviconPath(appConfigFile.favicon);
    else {
      // Favicon app configuration property not given. Use a default.
      this.document.getElementById('appFavicon').setAttribute('href', this.mapService.getAppPath() +
                                                                      this.appService.getDefaultFaviconPath());
      return;
    }
    
    if (!this.appService.FAVICON_SET) {
      this.document.getElementById('appFavicon').setAttribute('href', this.mapService.getAppPath() +
                                                                      this.appService.getFaviconPath());
      this.appService.setFaviconTrue();
    }

  }

}