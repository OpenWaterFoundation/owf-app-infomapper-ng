import { Component,
          EventEmitter,
          OnInit,
          Inject, 
          Output}                    from '@angular/core';
          
import { Title }                     from '@angular/platform-browser';
import { DOCUMENT }                  from '@angular/common';

import { MatDialog,
          MatDialogConfig,
          MatDialogRef }             from '@angular/material/dialog';

import { faBars,
          faEllipsis,
          faMagnifyingGlass }        from '@fortawesome/free-solid-svg-icons';

import { map }                       from 'rxjs/operators';
 
import { AppService }                from '../services/app.service';
import { CommonLoggerService,
          OwfCommonService }         from '@OpenWaterFoundation/common/services';
import { DataUnits }                 from '@OpenWaterFoundation/common/util/io';

import { BreakpointObserverService } from '../services/breakpoint-observer.service';
import { GlobalSearchComponent }     from '../global-search/global-search.component';
import * as IM                       from '../../infomapper-types';


@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {

  /** All used FontAwesome icons in the AppConfigComponent. */
  faBars = faBars;
  faEllipsis = faEllipsis;
  faMagnifyingGlass = faMagnifyingGlass;
  /**
   * 
   */
  readonly searchButtonTooltip = 'Search InfoMapper content';
  /** Emits an event when the sidenav button is clicked in the nav bar and toggles
   * the sidenav itself. */
  @Output('sidenavToggle') sidenavToggle = new EventEmitter<any>();
  /** The top application title property from the app-config file. */
  title: string;


  /**
   * The NavBarComponent constructor.
   * @param appService The overarching application service.
   * @param logger Logger from the Common package for debugging and testing.
   * @param owfCommonService The OwfCommonService from the Common library.
   * @param titleService Service that can be used to get and set the title of the
   * current HTML document.
   * @param document An injectable for manipulating the DOM.
   */
  constructor(private appService: AppService, private dialog: MatDialog,
  @Inject(DOCUMENT) private document: Document, private logger: CommonLoggerService,
  private owfCommonService: OwfCommonService, private screenSizeService: BreakpointObserverService,
  public titleService: Title, ) { }


  get appConfig(): any { return this.appService.appConfigObj; }

  /**
  * Creates a dialog config object and sets its width & height properties based
  * on the current screen size.
  * @returns An object to be used for creating a dialog with its initial, min, and max
  * height and width conditionally.
  */
  private createDialogConfig(dialogData?: any): MatDialogConfig {

    var isMobile = this.screenSizeService.isMobile;

    return {
      data: dialogData ? dialogData : null,
      panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
      height: isMobile ? "90vh" : "850px",
      width: isMobile ? "100vw" : "875px",
      minHeight: isMobile ? "90vh" : "850px",
      minWidth: isMobile ? "100vw" : "875px",
      maxHeight: isMobile ? "90vh" : "850px",
      maxWidth: isMobile ? "100vw" : "875px"
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

    this.logger.print('info', 'NavBarComponent.loadComponent - Navbar initialization.');
  }

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
   * Emits an event to the SideNav component 
   */
  onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  openSearchDialog(): void {

    var dialogConfigData = {
      test: 'test'
    }

    var dialogRef: MatDialogRef<GlobalSearchComponent, any> = this.dialog.open(
      GlobalSearchComponent, this.createDialogConfig(dialogConfigData)
    );
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