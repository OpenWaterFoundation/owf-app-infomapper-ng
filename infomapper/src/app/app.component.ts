import { DOCUMENT }         from '@angular/common';
import { Component,
          Inject,
          OnInit }          from '@angular/core';
import { Title }            from '@angular/platform-browser';
import { ActivatedRoute,
          Router,
          NavigationEnd, 
          ParamMap }        from '@angular/router';
import { OwfCommonService } from '@OpenWaterFoundation/common/services';
import * as IM              from '@OpenWaterFoundation/common/services';
import { DataUnits }        from '@OpenWaterFoundation/common/util/io';
import { first, forkJoin, map,
          Observable }      from 'rxjs';

import { AppService }       from './services/app.service';
import { SearchService }    from './services/search.service';

declare let gtag: Function;


@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  /** Whether the current type of application can be embedded. */
  isEmbedded$: Observable<boolean>;
  /**
   * 
   */
  title: string = 'InfoMapper';


  constructor(private appService: AppService, private route: ActivatedRoute,
  private router: Router, @Inject(DOCUMENT) private document: Document,
  private owfCommonService: OwfCommonService, private searchService: SearchService,
  private titleService: Title) {
      
    this.isEmbedded$ = this.appService.isEmbeddedApp;

    this.router.errorHandler = (error: any) => {
      let routerError = error.toString();
      if (routerError.indexOf('Cannot match any routes') >= 0 ) {
          this.router.navigate(['/404']);
      } else {
        throw error;
      }
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // The original way of sending the URL as the page_path property after (and
        // not including) the hash. event.urlAfterRedirects
        gtag('config', this.appService.getGoogleTrackingId(),
        {
          'page_path': location.pathname + location.search + location.hash
        });
      }
    });

    this.route.queryParamMap.subscribe((queryParamMap: ParamMap) => {

      if (queryParamMap.get('embed') !== null) {
        if (queryParamMap.get('embed') === 'true') {
          this.appService.toggleEmbeddedApp = true;
        } else {
          this.appService.toggleEmbeddedApp = false
        };
      } else this.appService.toggleEmbeddedApp = false;
    });

  }


  /**
   * Getter for the appConfig object.
   */
  get appConfig(): IM.AppConfig { return this.appService.appConfigObj; }

  /**
   * 
   * @param markdownFilesToGet 
   */
  addContentPageToSearchIndex(markdownFilesToGet: Observable<any>[]): void {

    forkJoin(markdownFilesToGet).pipe(first()).subscribe((allMarkdownFilesContent: any) => {
      console.log('All markdown files content', allMarkdownFilesContent);
    });
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit() {
    this.setAppVariables();
    this.redirectHashURLToPath();
    this.createSearchIndex();
  }

  /**
   * Create the array of Observables for every file that needs to be read.
   */
  private createSearchIndex(): void {

    var allMarkdownFiles: Observable<any>[] = [
      this.appService.getPlainText(
        this.appService.buildPath(IM.Path.hPP)
      )
    ];
    // Object used to check if a path to a markdown file
    var uniqueMarkdownFiles = {};

    for (let mainMenu of this.appConfig.mainMenu) {

      if (mainMenu.menus) {
        for (let subMenu of mainMenu.menus) {

          switch(subMenu.action) {
            case 'contentPage': {
              // Make sure the path being used as a key begins with no forward slash.
              const markdownFilePath = subMenu.markdownFile.startsWith('/') ?
              subMenu.markdownFile.substring(1) : subMenu.markdownFile;

              if (!(markdownFilePath in uniqueMarkdownFiles)) {

                uniqueMarkdownFiles[markdownFilePath] = true;

                console.log('Path being used to read in "About the Project":', this.appService.buildPath(IM.Path.mP, subMenu.markdownFile));

                allMarkdownFiles.push(
                  this.appService.getPlainText(
                    this.appService.buildPath(IM.Path.mP, subMenu.markdownFile)
                  )
                );
                break;
              }
            }
          }
        }
      }

      switch(mainMenu.action) {
        case 'contentPage': {
          // Make sure the path being used as a key begins with no forward slash.
          const markdownFilePath = mainMenu.markdownFile.startsWith('/') ?
          mainMenu.markdownFile.substring(1) : mainMenu.markdownFile;

          if (!(markdownFilePath in uniqueMarkdownFiles)) {

            uniqueMarkdownFiles[markdownFilePath] = true;

            allMarkdownFiles.push(
              this.appService.getPlainText(
                this.appService.buildPath(IM.Path.mP, mainMenu.markdownFile)
              )
            );
            break;
          }
          
        }
      }
    }

    console.log('All unique markdown files:', uniqueMarkdownFiles);
    this.addContentPageToSearchIndex(allMarkdownFiles);
  }

  /**
   * Checks the URL and removes any instances of `#/` (pound forward-slash) while
   * keeping the rest of the URL - including query parameters - intact.
   */
  private redirectHashURLToPath(): void {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (!!event.url && event.url.match(/^\/#/)) {
          this.router.navigateByUrl(event.url.replace('/#', ''));
        }
      }
    });
  }

  /**
   * Performs necessary application setup, including setting the appConfig object
   * in the OWF's npm `Common` package.
   */
  private setAppVariables(): void {
    
    // Send the app configuration data to the Common library Map Component.
    this.owfCommonService.setAppConfig(this.appConfig);

    this.title = this.appConfig.title;
    this.titleService.setTitle(this.title);
    
    this.setFavicon();
    this.setGoogleTrackingId();

    if (this.appConfig.dataUnitsPath) {
      this.setDataUnits(this.appConfig.dataUnitsPath);
    }
  }

  /**
   * Asynchronously reads the data unit file to determine what the precision is for
   * units when displaying them in a dialog table.
   * @param dataUnitsPath The path to the dataUnits file.
   */
  private setDataUnits(dataUnitsPath: string): void {
    this.appService.getPlainText(this.appService.buildPath(IM.Path.dUP, dataUnitsPath), IM.Path.dUP)
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
