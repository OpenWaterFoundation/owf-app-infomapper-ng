// Good source for when to use services, and the advantages of using BehaviorSubject and Subject
// https://stackoverflow.com/questions/50625913/when-we-should-use-angular-service

import { Injectable }       from '@angular/core';
import { HttpClient }       from '@angular/common/http';

import { catchError }       from 'rxjs/operators';
import { BehaviorSubject,
          Observable,
          of, 
          Subscriber}       from 'rxjs';

import { DataUnits }        from '@OpenWaterFoundation/common/util/io';
import { DatastoreManager } from '@OpenWaterFoundation/common/util/datastore';
import * as IM              from '@OpenWaterFoundation/common/services';


@Injectable({ providedIn: 'root' })
export class AppService {

  /** Object that holds the application configuration contents from the app-config.json file. */
  public appConfig: any;
  /** The hard-coded string of the name of the application config file. It is readonly,
   * because it must be named app-config.json by the user. */
  public readonly appConfigFile: string = 'app-config.json';
  /** The hard-coded name of a deployed application configuration file. Similar to
   * app-config.json, it must be named app-config-minimal.json by the user in the
   * assets/app-default folder. */
  public readonly appMinFile: string = 'app-config-minimal.json';
  /** A string representing the path to the correct assets directory for the InfoMapper.
   * The InfoMapper assumes a user will supply their own user-defined config file
   * under assets/app. If not, this string will be changed to 'assets/app-default'
   * and the default InfoMapper set up will be used instead. */
  public appPath: string = 'assets/app/';
  /** Object containing a geoLayerId as the key and a boolean representing whether
   * the given geoLayer has been given a bad path as the value. */
   public badPath: {} = {};
  /** An array of DataUnit objects that each contain the precision for different
   * types of data, from degrees to mile per hour. Read from the application config
   * file top level property dataUnitsPath. */
  public dataUnits: DataUnits[];
  /** The hard-coded string of the path to the default icon path that will be used
   * for the website if none is given. */
  public readonly defaultFaviconPath = 'assets/app-default/img/OWF-Logo-Favicon-32x32.ico';
  /**
   * 
   */
   private embeddedApp$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** Boolean representing if a favicon path has been provided by the user. */
  public FAVICON_SET = false;
  /** The path to the user-provided favicon .ico file. */
  public faviconPath: string;
  /** A string representing the path leading up to the geoJson file that was read in. */
  public geoJSONBasePath: string = '';
  /** The string representing a user's google tracking ID, set in the upper level
   * application config file. */
  public googleAnalyticsTrackingId = '';
  /** Boolean showing whether the google tracking ID has been set for the InfoMapper. */
  public googleAnalyticsTrackingIdSet = false;
  /** Boolean showing whether the default home content page has been initialized. */
  public homeInit = true;
  /** Set to true if the user-provided `app-config.json` file is not provided. */
  private isDefaultApp: boolean;
  /** Set to true if the `app-config.json` file is not given to either `assets/app/`
   * or `assets/app-default/`. */
  private isDefaultMinApp: boolean;
  /**
   * 
   */
   get isEmbeddedApp(): Observable<boolean> {
    return this.embeddedApp$.asObservable();
  }
  /**
   * 
   */
  set toggleEmbeddedApp(error: boolean) {
    this.embeddedApp$.next(error);
  }
  /** Set to true if the user-provided `app-config.json` is provided in `assets/app/`. */
  public isUserApp: boolean;
  /** The string representing the current selected markdown path's full path starting
   * from the @var appPath. */
  public fullMarkdownPath: string;
  /** The object that holds the map configuration contents from the map configuration
   * file for a Leaflet map. */
  public mapConfig: any;
  /** Array of geoLayerId's in the correct geoLayerView order, retrieved from the geoMap.
   * The order in which each layer should be displayed in on the map and side bar legend. */
  public mapConfigLayerOrder: string[] = [];
   /** A string representing the path to the map configuration file. */
  public mapConfigPath: string = '';
   /** Object containing a layer's geoLayerId as the key, and a boolean showing whether
    * the URL for the layer is not currently working or does not exist. */
  public serverUnavailable: {} = {};


  /**
   * @constructor for the App Service.
   * @param http The reference to the HttpClient class for HTTP requests.
   * components and higher scoped map variables.
   */
  constructor(private http: HttpClient) { }


  /**
   * Builds the path needed for an HTTP GET request for either a local file or URL,
   * and does so whether given an absolute or relative path in a configuration or
   * template file.
   * @param pathType A Path enum representing what kind of path that needs to be
   * built.
   * @param arg An optional array for arguments needed to build the path, e.g. a
   * filename or geoLayerId.
   */
  public buildPath(pathType: IM.Path, arg?: any[]): string {
    // If a URL is given as the path that needs to be built, just return it so the
    // http GET request can be performed.
    if (arg) {
      if (arg[0].startsWith('https') || arg[0].startsWith('http') || arg[0].startsWith('www')) {
        return arg[0];
      }
    }
    // Depending on the pathType, build the correct path.
    switch(pathType) {
      case IM.Path.cPP:
        return this.getAppPath() + this.getContentPathFromId(arg[0]);
      case IM.Path.gLGJP:
        return this.getAppPath() + this.getGeoJSONBasePath() + arg[0];
      case IM.Path.hPP:
        return this.getAppPath() + this.getHomePage();
      case IM.Path.eCP:
        return this.getAppPath() + this.getMapConfigPath() + arg[0];
      case IM.Path.cP:
      case IM.Path.csvPath:
      case IM.Path.dVP:
      case IM.Path.dUP:
      case IM.Path.dP:
      case IM.Path.iGP:
      case IM.Path.sMP:
      case IM.Path.sIP:
      case IM.Path.raP:
      case IM.Path.rP:
        if (pathType === IM.Path.dP) {
          this.setFullMarkdownPath(this.getAppPath() + this.formatPath(arg[0], pathType));
        }
        return this.getAppPath() + this.formatPath(arg[0], pathType);
      case IM.Path.bSIP:
        return this.formatPath(arg[0], pathType);
      case IM.Path.mP:
        if (arg[0].startsWith('/')) {
          return this.getAppPath() + this.formatPath(arg[0], pathType);
        } else {
          return this.getFullMarkdownPath() + this.formatPath(arg[0], pathType);
        }
      default:
        return '';
    }
  }

  /**
   * @returns The condensed path, changing `a/path/to/../../file.ext` to `a/file.ext`
   * for a more human readable format.
   * @param path The path represented as a string, for a URL or local path.
   * @param formatType The string describing how long the formatted string can be.
   */
  public condensePath(path: string, formatType?: string): string {
    if (path.startsWith('https') || path.startsWith('http') || path.startsWith('www')) {
      switch (formatType) {
        case 'table':
          return path.substring(0, 80) + '...';
        case 'link':
          return path.substring(0, 60) + '...';
      }
    } else {
      var tempSplit: string[] = path.split('/');
      var finalPath: string[] = [];

      for (let str of tempSplit) {
        if (str === '..') {
          finalPath.pop();
        } else {
          finalPath.push(str);
        }
      }
      return finalPath.join('/');
    }
  }

  /**
   * @returns The path to the application configuration file.
   */
  public getAppConfigFile(): string {
    return this.appConfigFile;
  }

  /**
   * @returns The path to the deployed minimal application configuration file.
   */
  public getAppMinFile(): string {
    return this.appMinFile;
  }

  /**
   * @returns Either `assets/app/` if a user-provided configuration file is given,
   * or the default `assets/app-default/` for the upper level assets path.
   */
  public getAppPath(): string {
    return this.appPath;
  }

  /**
   * @returns The array of DataUnits.
   */
  public getDataUnitArray(): DataUnits[] { return this.dataUnits; }

  /**
   * @returns The application's default favicon path.
   */
  public getDefaultFaviconPath(): string { return this.defaultFaviconPath; }

  /**
   * @returns The current selected markdown path's full path starting from the @var appPath.
   */
  public getFullMarkdownPath(): string { return this.fullMarkdownPath }

  /**
   * @returns Whether the default home content page has been initialized.
   */
  public getHomeInit(): boolean { return this.homeInit; }

  get appConfigObj(): any {
    return this.appConfig;
  }

  /**
   * 
   */
  get defaultApp(): boolean {
    return this.isDefaultApp;
  }

  /**
   * 
   */
  get defaultMinApp(): boolean {
    return this.isDefaultMinApp;
  }

  /**
   * 
   */
  get userApp(): boolean {
    return this.isUserApp;
  }

  /**
   * @returns The boolean representing if a user provided favicon path has been provided.
   */
  public faviconSet(): boolean { return this.FAVICON_SET; }

  /**
   * @returns Either the first '/' removed from an absolute path or the relative 
   * path to a favicon image.
   */
  public getFaviconPath(): string {
    if (this.faviconPath.startsWith('/')) {
      return this.faviconPath.substring(1);
    } else return this.faviconPath;
  }

  /**
   * @returns Sets what google analytics account will be receiving site hit information.
   */
  public getGoogleTrackingId(): string { return this.googleAnalyticsTrackingId; }

  /**
   * Read data asynchronously from a file or URL and return it as a JSON object.
   * @param path The path or URL to the file needed to be read
   * @returns The JSON retrieved from the host as an Observable
   */
  public getJSONData(path: string, type?: IM.Path, id?: string): Observable<any> {
    // This creates an options object with the optional headers property to add headers
    // to the request. This could solve some CORS issues, but is not completely tested yet.
    // var options = {
    //   headers: new HttpHeaders({
    //     'Access-Control-Request-Method': 'GET'
    //   })
    // }
    return this.http.get<any>(path)
    .pipe(catchError(this.handleError<any>(path, type, id)));
  }

  /**
   * Read data asynchronously from a file or URL and return it as plain text.
   * @param path The path to the file to be read, or the URL to send the GET request
   * @param type Optional type of request sent, e.g. IM.Path.cPP. Used for error handling and messaging
   * @param id Optional app-config id to help determine where exactly an error occurred
   */
  public getPlainText(path: string, type?: IM.Path, id?: string): Observable<any> {
    // This next line is important, as it tells our response that it needs to return
    // plain text, not a default JSON object.
    const obj: Object = { responseType: 'text' as 'text' };
    return this.http.get<any>(path, obj)
    .pipe(catchError(this.handleError<any>(path, type, id)));
  }

  /**
   * Handles the HTTP operation that failed, and lets the app continue by returning 
   * @param path - Name of the path used that failed.
   * @param type - Optional type of the property error. Was it a home page, template, etc.
   * @param result - Optional value to return as the observable result.
   */
  private handleError<T> (path: string, type?: IM.Path, id?: string, result?: T) {
    return (error: any): Observable<T> => {

      switch(error.status) {
        case 404:
          this.setBadPath(path, id); break;
        case 400:
          this.setServerUnavailable(id); break;
      }
      // If the error message includes a parsing issue, more often than not it is a badly created JSON file. Detect if .json
      // is in the path, and if it is let the user know. If not, the file is somehow incorrect.
      if (error.message.includes('Http failure during parsing')) {
        // If the path contains a geoTIFF file, then it is a raster, so just return; The raster will be read later.
        if (path.toUpperCase().includes('.TIF') || path.toUpperCase().includes('.TIFF')) {
          return of(result as T);
        }
        console.error('[' + type + '] error. InfoMapper could not parse a file. Confirm the \'' + this.condensePath(path) +
        '\' file is %s', (path.includes('.json') ? 'valid JSON.' : 'created correctly.'));
        return of(result as T);
      }

      if (type) {
        console.error('[' + type + '] error. There might have been a problem with the ' + type +
          ' path. Confirm the path is correct in the configuration file.');
      }

      switch(type) {
        case IM.Path.fMCP:
          console.error('Confirm the app configuration property \'mapProject\' with id \'' + id + '\' is the correct path');
          break;
        case IM.Path.gLGJP:
          console.error('Confirm the map configuration property \'sourcePath\' is the correct path');
          break;
        case IM.Path.eCP:
          console.error('Confirm the map configuration EventHandler property \'eventConfigPath\' is the correct path');
          break;
        case IM.Path.aCP:
          console.error('No app-config.json detected in ' + this.appPath + '. Confirm app-config.json exists in ' + this.appPath);
          break;
        case IM.Path.cPage:
          console.error('Confirm the app configuration property \'markdownFilepath\' with id \'' + id + '\' is the correct path');
          break;
        case IM.Path.rP:
          console.error('Confirm the popup configuration file property \'resourcePath\' is the correct path');
          break;
      }
      // TODO: jpkeahey 2020.07.22 - Don't show a map error no matter what. I'll probably want to in some cases.
      // this.router.navigateByUrl('map-error');
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /**
   * @returns if the googleAnalytics tracking id has been set so the gtag function
   * from google doesn't need to wait a full second after the initial set up of the
   * @var googleAnalyticsTrackingId.
   */
  public isTrackingIdSet(): boolean { return this.googleAnalyticsTrackingIdSet; }

  /**
   * @returns true if the given property to be displayed in the Mat Table cell is a URL.
   * @param property The Mat Table cell property to check.
   */
  public isURL(property: any): boolean {
    if (typeof property === 'string') {
      if (property.startsWith('http://') || property.startsWith('https://') || property.startsWith('www.')) {
        return true;
      }
    } else return false;
  }

  /**
   * Asynchronously loads the application configuration file and sets the necessary
   * variables that describes what kind of application is being created:
   *   A user-provided app.
   *   The default app.
   *   The minimal default app.
   */
  public loadConfigFiles(): Observable<any> {

    var dsManager = DatastoreManager.getInstance();

    return new Observable((subscriber: Subscriber<any>) => {

      this.urlExists(this.getAppPath() + this.getAppConfigFile()).subscribe({
        next: () => {
          // If it exists, asynchronously retrieve its JSON contents into a JavaScript
          // object and assign it as the appConfig.
          this.getJSONData(this.getAppPath() + this.getAppConfigFile(), IM.Path.aCP)
          .subscribe((appConfig: IM.AppConfig) => {
            this.setAppConfig(appConfig);
            // Only add user added datastores in a user provided app.
            dsManager.setUserDatastores(appConfig.datastores);
            this.isUserApp = true;
            subscriber.complete();
          });
        },
        error: (error: any) => {
          // Override the AppService appPath variable, since it is no longer assets/app.
          this.setAppPath('assets/app-default/');
          console.warn("Using the default 'assets/app-default/' configuration.");

          this.urlExists(this.getAppPath() + this.getAppConfigFile()).subscribe({
            next: () => {
              this.getJSONData(this.getAppPath() + this.getAppConfigFile(), IM.Path.aCP)
              .subscribe((appConfig: IM.AppConfig) => {
                this.setAppConfig(appConfig);
                this.isDefaultApp = true;
                subscriber.complete();
              });
            },
            error: (error: any) => {
              console.warn("Using the deployed default 'assets/app-default/app-config-minimal.json");
    
              this.getJSONData(this.getAppPath() + this.getAppMinFile(), IM.Path.aCP)
              .subscribe((appConfig: IM.AppConfig) => {
                this.setAppConfig(appConfig);
                this.isDefaultMinApp = true;
                subscriber.complete();
              });
            }
          });
        }
      });
    });


    // const appData = firstValueFrom(this.http.get('assets/app/app-config.json'));
    // this.setAppConfig(appData);

    // Dashboard Configuration

  }

  /**
   * Sanitizes the markdown syntax by checking if image links are present, and replacing
   * them with the full path to the image relative to the markdown file being displayed.
   * This eases usability so that just the name and extension of the file can be used
   * e.g. ![Waldo](waldo.png) will be converted to ![Waldo](full/path/to/markdown/file/waldo.png).
   * @param doc The documentation string retrieved from the markdown file.
   */
  public sanitizeDoc(doc: string, pathType: IM.Path): string {
    // Needed for a smaller scope when replacing the image links
    var _this = this;
    // If anywhere in the documentation there exists  ![any amount of text](
    // then it is the syntax for an image, and the path needs to be changed
    if (/!\[(.*?)\]\(/.test(doc)) {
      // Create an array of all substrings in the documentation that match the regular
      // expression  ](any amount of text)
      var allImages: string[] = doc.match(/\]\((.*?)\)/g);
      // Go through each one of these strings and replace each one that does not
      // specify itself as an in-page link, or external link.
      for (let image of allImages) {
        if (image.startsWith('](#') || image.startsWith('](https') || image.startsWith('](http') || image.startsWith('](www')) {
          continue;
        } else {

          doc = doc.replace(image, function(word) {
            // Take off the pre pending ]( and ending ).
            var innerParensContent = word.substring(2, word.length - 1);
            // Return the formatted full markdown path with the corresponding bracket and parentheses.
            return '](' + _this.buildPath(pathType, [innerParensContent]) + ')';
          });

        }
      }
    }

    return doc;
  }

  /**
   * No configuration file was detected from the user, so the 'assets/app-default/'
   * path is set @param path The default assets path to set the @var appPath to.
   */
  public setAppPath(path: string): void { this.appPath = path; }

  /**
   * Sets the @var dataUnits array to the passed in dataUnits from the nav-bar
   * @param dataUnits The array of DataUnits to set the service @var dataUnits to
   */
  public setDataUnits(dataUnits: DataUnits[]): void { this.dataUnits = dataUnits; }

  /**
   * Sets the FAVICON_SET boolean to true after a user-provided favicon path has
   * been set, so it's only set once.
   */
  public setFaviconTrue(): void { this.FAVICON_SET = true; }

  /**
   * Sets the app service @var faviconPath to the user-provided path given in the
   * app configuration file @param path The path to the user-provided favicon image.
   */
  public setFaviconPath(path: string): void { this.faviconPath = path; }

  /**
   * 
   * @param path 
   */
  private setFullMarkdownPath(path: string): void {
    
    var fullMarkdownPath = '';
    let splitPath: string[] = path.split('/');
    for (let i = 0; i < splitPath.length - 1; i++) {
      fullMarkdownPath += splitPath[i] + '/';
    }
    this.fullMarkdownPath = fullMarkdownPath;
  }

  /**
   * Sets the @var homeInit to false, since the first home page has been displayed,
   * and the @var appConfig has been set @param homeInit The boolean changing the
   * @var homeInit to false.
   */
  public setHomeInit(homeInit: boolean): void { this.homeInit = homeInit; }

  /**
   * Sets the app service's @var googleAnalyticsTrackingId so it can be retrieved
   * by the app component @param id The google analytics tracking id from the app
   * configuration file.
   */
  public setGoogleTrackingId(id: string): void {
    this.googleAnalyticsTrackingIdSet = true;
    this.googleAnalyticsTrackingId = id;
  }

  /**
   * As of right now, this GETs a full file, and might be slow with large files.
   * Its only purpose is to try to GET a URL, and throw an error if unsuccessful.
   * Determines if a user-defined app/ file is given, or if the app-default should
   * be used.
   * @param url The URL to try to GET from
   */
  public urlExists(url: string): Observable<any> {
    return this.http.get(url);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Formats the path with either the correct relative path prepended to the destination file, or the removal of the beginning
   * '/' forward slash or an absolute path.
   * @param path The given path to format
   * @param pathType A string representing the type of path being formatted, so the correct handling can be used.
   */
   public formatPath(path: string, pathType: string): string {

    switch (pathType) {
      case IM.Path.cP:
      case IM.Path.csvPath:
      case IM.Path.dVP:
      case IM.Path.dP:
      case IM.Path.iGP:
      case IM.Path.sMP:
      case IM.Path.raP:
      case IM.Path.rP:
        // If any of the pathType's above are given, they will be 
        if (path.startsWith('/')) {
          return path.substring(1);
        } else {
          return this.getMapConfigPath() + path;
        }
      case IM.Path.bSIP:
        if (path.startsWith('/')) {
          return 'assets/app-default/' + path.substring(1);
        } else {
          return 'assets/app-default/' + path;
        }
      case IM.Path.dUP:
      case IM.Path.mP:
      case IM.Path.sIP:
        if (path.startsWith('/')) {
          return path.substring(1);
        } else {
          return path;
        }
    }

  }

  /**
   * @returns The relative path to the map configuration file for the application.
   */
   public getMapConfigPath(): string {
    return this.mapConfigPath;
  }

  /**
   * Sets the globally used @var appConfig for access to the app's configuration
   * settings.
   * @param appConfig The entire application configuration read in from the app-config
   * file as an object.
   */
   public setAppConfig(appConfig: {}): void { this.appConfig = appConfig; }

   /**
   * Iterates through all menus and sub-menus in the `app-config.json` file and
   * determines 
   * @param id The geoLayerId to compare with each menu id property.
   * @returns The markdownFile (contentPage) path found that matches the given geoLayerId.
   */
  public getContentPathFromId(id: string) {

    for (let i = 0; i < this.appConfig.mainMenu.length; i++) {
      if (this.appConfig.mainMenu[i].menus) {
        for (let menu = 0; menu < this.appConfig.mainMenu[i].menus.length; menu++) {
          if (this.appConfig.mainMenu[i].menus[menu].id === id)
            return this.appConfig.mainMenu[i].menus[menu].markdownFile;
        }
      } else {
        if (this.appConfig.mainMenu[i].id === id)
          return this.appConfig.mainMenu[i].markdownFile;
      }
    }
    // Return the homePage path by default. Check to see if it's an absolute path first.
    if (id.startsWith('/')) {
      return id.substring(1);
    }
    // If it doesn't, use the path relative to the home page.
    else {
      var arr: string[] = this.appConfig.homePage.split('/');
      return arr.splice(0, arr.length - 1).join('/').substring(1) + '/' + (id.startsWith('/') ? id.substring(1) : id);
    }
  }

  /**
   * @returns the base path to the GeoJson files being used in the application. When prepended with the @var appPath,
   * shows the full path the application needs to find any GeoJson file
   */
   public getGeoJSONBasePath(): string {
    return this.geoJSONBasePath;
  }

  /**
   * @returns the homePage property in the app-config file without the first '/' slash.
   */
   public getHomePage(): string {
    if (this.appConfig.homePage) {
      if (this.appConfig.homePage[0] === '/')
        return this.appConfig.homePage.substring(1);
      else
        return this.appConfig.homePage;
    }
    else throw new Error("The 'homePage' property in the app configuration file not set. Please set the path to the home page.")
  }

  /**
   * Sets, or possibly creates the badPath object with the geo
   * @param geoLayerId The geoLayerId from the geoLayer where the bad path was set
   */
   public setBadPath(path: string, geoLayerId: string): void { this.badPath[geoLayerId] = [true, path]; }

   /**
   * Sets the @var serverUnavailable with a key of @var geoLayerId to true.
   * @param geoLayerId The geoLayerId to compare to while creating the side bar.
   */
  public setServerUnavailable(geoLayerId: string): void { this.serverUnavailable[geoLayerId] = true; }

  /**
   * 
   * @param mapID 
   * @returns 
   */
  validMapConfigMapID(mapID: string): boolean {

    if (mapID === 'home') {
      return true;
    }

    for (let mainMenu of this.appConfig.mainMenu) {
      // If subMenus exist.
      if (mainMenu.menus) {
        for (let subMenu of mainMenu.menus) {
          if (subMenu.id === mapID) {
            return true;
          }
        }
      }
      // If no subMenus exist.
      else {
        if (mainMenu.id === mapID) {
          return true;
        }
      }
      
    }
    return false;
  }

}