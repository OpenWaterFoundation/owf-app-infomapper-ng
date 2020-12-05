import { Component,
          OnInit,
          Inject,
          ViewChild,
          ComponentFactoryResolver } from '@angular/core';
          
import { Title }                     from '@angular/platform-browser';
import { DOCUMENT }                  from '@angular/common';

import { map }                       from 'rxjs/operators';
 
import { NavDirective }              from './nav.directive';

import { TabComponent }              from './tab/tab.component';

import { AppService }                from '../app.service';
import { MapService }                from '../map-components/map.service';

import { DataUnits }                 from 'src/app/map-components/owf/Util/IO/DataUnits';
import * as IM                       from '../../infomapper-types';


@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {

  @ViewChild(NavDirective, { static: true }) navHost: NavDirective;
  public title: string;
  public appError: boolean = false;

  public active: string;

  constructor(private appService: AppService,
              private mapService: MapService,
              private componentFactoryResolver: ComponentFactoryResolver,
              public titleService: Title,
              @Inject(DOCUMENT) private document: HTMLDocument) { }


  /**
   * Dynamically cretes a Tab Component for each MainMenu object at the top of the InfoMapper site.
   * @param mainMenu The AppConfig MainMenu object from the application configuration file.
   */
  private createTabComponent(mainMenu: IM.MainMenu): void {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(TabComponent);
    let viewContainerRef = this.navHost.viewContainerRef;
    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<TabComponent>componentRef.instance).mainMenu = mainMenu;
  }

  ngOnInit() {    
    this.appService.urlExists(this.appService.getAppPath() + this.appService.getAppConfigFile()).subscribe(() => {
      this.appService.getJSONData(this.appService.getAppPath() + this.appService.getAppConfigFile(), IM.Path.aCP)
      .subscribe((appConfig: IM.AppConfig) => {
        this.mapService.setAppConfig(appConfig);
        this.title = appConfig.title;
        this.titleService.setTitle(this.title);
        this.loadComponent(appConfig);
      });
    }, (err: any) => {  
      this.appService.setAppPath('assets/app-default/');
      console.log("Using the default 'assets/app-default/' configuration");

      if (err.message.includes('Http failure during parsing')) {
        this.appError = true;
      }
      
      this.appService.getJSONData(this.appService.getAppPath() + this.appService.getAppConfigFile(), IM.Path.aCP)
      .subscribe((appConfig: IM.AppConfig) => {
        this.mapService.setAppConfig(appConfig);
        this.title = appConfig.title;
        this.titleService.setTitle(this.title);
        this.loadComponent(appConfig);
      });
    });
  }

  /**
   * Creates the necessary Tab Components for each menu option in the nav-bar.
   * @param appConfig The app-config.json object.
   */
  private loadComponent(appConfig: IM.AppConfig) {

    this.setFavicon(appConfig);
    this.setGoogleTrackingId(appConfig);

    if (appConfig.dataUnitsPath) this.setDataUnits(appConfig.dataUnitsPath);

    // Creates new button (tab) component in navBar for each map specified in configFile, sets data based on ad service
    // loop through the mainMenu selections
    for (let i = 0; i < appConfig.mainMenu.length; i++) {
      // Check to see if the visible property in each mainMenu in the appConfig object is either a 'false' string or boolean.
      // If it's anything else, including undefined if not given at all, show the MainMenu.
      if (typeof appConfig.mainMenu[i].visible === 'string') {
        if (appConfig.mainMenu[i].visible.toUpperCase() !== 'FALSE') {
          this.createTabComponent(appConfig.mainMenu[i]);
        }
      } else if (typeof appConfig.mainMenu[i].visible === 'boolean') {
        if (appConfig.mainMenu[i].visible !== false) {
          this.createTabComponent(appConfig.mainMenu[i]);
        }
      } else if (typeof appConfig.mainMenu[i].visible === 'undefined') {
        this.createTabComponent(appConfig.mainMenu[i]);
      }
    }
  }

/**
 * Asynchronously reads the data unit file to determine what the precision is for units when displaying them in a dialog table.
 * @param dataUnitsPath The path to the dataUnits file.
 */
  private setDataUnits(dataUnitsPath: string): void {
    this.appService.getPlainText(this.appService.buildPath(IM.Path.dUP, [dataUnitsPath]), IM.Path.dUP).pipe(map((dfile: any) => {
      let dfileArray = dfile.split('\n');
      // Convert the returned string above into an array of strings as an argument
      DataUnits.readUnitsFileBool ( dfileArray, true );

      return DataUnits.getUnitsData();
    })).subscribe((results: DataUnits[]) => {
      this.appService.setDataUnits(results);
    });
  }

  /**
   * Dynamically uses the path to a user given favicon, or uses the default if no property in the app-config is detected.
   * @param appConfig The app-config.json object.
   */
  private setFavicon(appConfig: any): void {

    if (appConfig.favicon)
      this.appService.setFaviconPath(appConfig.favicon);
    else {
      // Favicon app configuration property not given. Use a default.
      this.document.getElementById('appFavicon')
                    .setAttribute('href', this.appService.getAppPath() + this.appService.getDefaultFaviconPath());
      return;
    }
    
    if (!this.appService.faviconSet()) {
      this.document.getElementById('appFavicon')
                    .setAttribute('href', this.appService.getAppPath() + this.appService.getFaviconPath());
      this.appService.setFaviconTrue();
    }

  }

  /**
   * Dynamically sets the Google tracking ID so a user's Google Analytics account can be used
   * @param appConfig The app-config.json object
   */
  private setGoogleTrackingId(appConfig: any): void {

    if (appConfig.googleAnalyticsTrackingId) {
      this.appService.setGoogleTrackingId(appConfig.googleAnalyticsTrackingId);
      // this.document.getElementById('googleAnalytics')
      //               .setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=' + appConfig.googleAnalyticsTrackingId);
    } else {
      this.appService.setGoogleTrackingId('${Google_Analytics_Tracking_Id}');
    }

  }

}