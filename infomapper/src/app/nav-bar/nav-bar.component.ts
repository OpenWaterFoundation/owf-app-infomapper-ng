import { Component,
          EventEmitter,
          OnInit,
          Inject, 
          Output}          from '@angular/core';
          
import { Title }            from '@angular/platform-browser';
import { DOCUMENT }         from '@angular/common';

import { map }              from 'rxjs/operators';
 
import { AppService }       from '../app.service';
import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import { DataUnits }        from '@OpenWaterFoundation/common/util/io';
import * as IM              from '../../infomapper-types';


@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {

  /** Emits an event when the sidenav button is clicked in the nav bar and toggles
   * the sidenav itself. */
  @Output('sidenavToggle') sidenavToggle = new EventEmitter<any>();
  /** The top application title property from the app-config file. */
  title: string;


  /**
   * The NavBarComponent constructor.
   * @param appService The overarching application service.
   * @param owfCommonService The OwfCommonService from the Common library.
   * @param titleService Service that can be used to get and set the title of the
   * current HTML document.
   * @param document An injectable for manipulating the DOM.
   */
  constructor(private appService: AppService,
              private owfCommonService: OwfCommonService,
              public titleService: Title,
              @Inject(DOCUMENT) private document: Document) { }


  get appConfig(): any { return this.appService.appConfigObj; }

  ngOnInit() {

    //
    if (this.appService.userApp) {
      // Send the app configuration data to the Common library Map Component.
      this.owfCommonService.setAppConfig(this.appConfig);
      this.title = this.appService.appConfigObj.title;
      this.titleService.setTitle(this.title);
      this.loadComponent();
    }
    //
    else if (this.appService.defaultApp) {
      this.appService.setAppConfig(this.appService.appConfigObj);

      this.owfCommonService.setAppConfig(this.appService.appConfigObj);
      this.title = this.appService.appConfigObj.title;
      this.titleService.setTitle(this.title);
      this.loadComponent();
    }
    //
    else if (this.appService.defaultMinApp) {
      this.appService.setAppConfig(this.appService.appConfigObj);

      this.owfCommonService.setAppConfig(this.appService.appConfigObj);
      this.title = this.appService.appConfigObj.title;
      this.titleService.setTitle(this.title);
      this.loadComponent();
    }
  }

  /**
   * Creates the necessary Tab Components for each menu option in the nav-bar.
   */
  private loadComponent() {

    this.setFavicon();
    this.setGoogleTrackingId();

    if (this.appConfig.dataUnitsPath) {
      this.setDataUnits(this.appConfig.dataUnitsPath);
    }
  }

  onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  /**
   * Asynchronously reads the data unit file to determine what the precision is for
   * units when displaying them in a dialog table.
   * @param dataUnitsPath The path to the dataUnits file.
   */
  private setDataUnits(dataUnitsPath: string): void {
    this.appService.getPlainText(this.appService.buildPath(IM.Path.dUP, [dataUnitsPath]), IM.Path.dUP)
    .pipe(
      map((dfile: any) => {
        let dfileArray = dfile.split('\n');
        // Convert the returned string above into an array of strings as an argument.
        DataUnits.readUnitsFileBool (dfileArray, true);

        return DataUnits.getUnitsData();
      })
    ).subscribe((results: DataUnits[]) => {
      this.appService.setDataUnits(results);
    });
  }

  /**
   * Dynamically uses the path to a user given favicon, or uses the default if no
   * property in the app-config is detected.
   */
  private setFavicon(): void {

    if (this.appConfig.favicon)
      this.appService.setFaviconPath(this.appConfig.favicon);
    else {
      // Favicon app configuration property not given. Use a default.
      this.document.getElementById('appFavicon')
                    .setAttribute('href', this.appService.getDefaultFaviconPath());
      return;
    }
    
    // Set the favicon the first time, but not on subsequent page loads.
    if (!this.appService.faviconSet()) {
      this.document.getElementById('appFavicon')
      .setAttribute('href', this.appService.getAppPath() + this.appService.getFaviconPath());
      this.appService.setFaviconTrue();
    }

  }

  /**
   * Dynamically sets the Google tracking ID so a user's Google Analytics account
   * can be used.
   */
  private setGoogleTrackingId(): void {

    if (this.appConfig.googleAnalyticsTrackingId) {
      this.appService.setGoogleTrackingId(this.appConfig.googleAnalyticsTrackingId);
      // this.document.getElementById('googleAnalytics')
      // .setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=' +
      // appConfig.googleAnalyticsTrackingId);
    } else {
      this.appService.setGoogleTrackingId('${Google_Analytics_Tracking_Id}');
    }

  }

}