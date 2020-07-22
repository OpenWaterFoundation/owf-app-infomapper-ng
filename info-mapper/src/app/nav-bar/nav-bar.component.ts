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

  @ViewChild(NavDirective, { static: true }) navHost: NavDirective;
  public title: string;
  appError: boolean = false;

  active: string;

  constructor(private appService: AppService,
              private mapService: MapService,
              private componentFactoryResolver: ComponentFactoryResolver,
              public titleService: Title,
              @Inject(DOCUMENT) private document: HTMLDocument) { }

  ngOnInit() {
      this.appService.urlExists(this.appService.getAppPath() +
                                this.appService.getAppConfigFile()).subscribe(
                                  () => {
        this.appService.getJSONData(this.appService.getAppPath() +
                                this.appService.getAppConfigFile()).subscribe(
                                  (appConfig: any) => {
                                    this.mapService.setAppConfig(appConfig);
                                    this.title = appConfig.title;
                                    this.appService.setTitle(this.title);
                                    this.titleService.setTitle(this.title);
                                    this.loadComponent(appConfig);
                                });
      }, (err: any) => {  
        this.appService.setAppPath('assets/app-default/');
        console.log("Using the 'assets/app-default/' configuration");

        if (err.message.includes('Http failure during parsing')) {
          this.appError = true;
        }
        
        this.appService.getJSONData(this.appService.getAppPath() +
                                this.appService.getAppConfigFile()).subscribe(
                                  (appConfig: any) => {
                                    this.mapService.setAppConfig(appConfig);
                                    this.title = appConfig.title;
                                    this.appService.setTitle(this.title);
                                    this.titleService.setTitle(this.title);
                                    this.loadComponent(appConfig);
                                });
      });
  }

  loadComponent(appConfig: any) {

    this.setFavicon(appConfig);

    // Creates new button (tab) component in navBar for each map specified in configFile, sets data based on ad service
    // loop through the mainMenu selections (there are a total of 8 at the moment 'Basin Entities' - 'MapLink')
    for (let i = 0; i < appConfig.mainMenu.length; i++) {
      // Check to see if the menu should be displayed yet
            
      if (appConfig.mainMenu[i].visible != 'false') {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(TabComponent);
        let viewContainerRef = this.navHost.viewContainerRef;
        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<TabComponent>componentRef.instance).data = appConfig.mainMenu[i];
      }

      if (appConfig.mainMenu[i].action == 'contentPage' && appConfig.mainMenu[i].markdownFile.includes('/')) {

      } else if (appConfig.mainMenu[i].action == 'displayMap' &&
      appConfig.mainMenu[i].mapProject.includes('/')) {
      }
      if (appConfig.mainMenu[i].menus) {  
        for (let menu = 0; menu < appConfig.mainMenu[i].menus.length; menu++) {    
          if (appConfig.mainMenu[i].menus[menu].action == 'contentPage' &&
          appConfig.mainMenu[i].menus[menu].markdownFile &&
          appConfig.mainMenu[i].menus[menu].markdownFile.includes('/')) {
          } 
        }
      }
      if (appConfig.mainMenu[i].menus) {              
        for (let menu = 0; menu < appConfig.mainMenu[i].menus.length; menu++) {
          if (appConfig.mainMenu[i].menus[menu].action == 'displayMap' &&
          appConfig.mainMenu[i].menus[menu].mapProject &&
          appConfig.mainMenu[i].menus[menu].mapProject.includes('/')) {
          } 
        }
      }
    }
  }

  setFavicon(appConfig: any): void {

    if (appConfig.favicon)
      this.appService.setFaviconPath(appConfig.favicon);
    else {
      // Favicon app configuration property not given. Use a default.
      this.document.getElementById('appFavicon').setAttribute('href', this.appService.getAppPath() +
                                                                      this.appService.getDefaultFaviconPath());
      return;
    }
    
    if (!this.appService.faviconSet()) {
      this.document.getElementById('appFavicon').setAttribute('href', this.appService.getAppPath() +
                                                                      this.appService.getFaviconPath());
      this.appService.setFaviconTrue();
    }

  }

}