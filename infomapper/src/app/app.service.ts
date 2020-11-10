// Good source for when to use services, and the advantages of using BehaviorSubject and Subject
// https://stackoverflow.com/questions/50625913/when-we-should-use-angular-service

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError } from 'rxjs/operators';
import { Observable,
         of }         from 'rxjs';
import { MapService } from './map-components/map.service';

import { DataUnits }  from './map-components/owf/Util/IO/DataUnits';


@Injectable({ providedIn: 'root' })
export class AppService {

  /**
   * The hard-coded string of the name of the application configuration file. It is readonly, because it must be named
   * app-config.json by the user.
   */
  public readonly appConfigFile: string = 'app-config.json';
  /**
   * A string representing the path to the correct assets directory for the InfoMapper. The InfoMapper assumes a user will
   * supply their own user-defined config files under assets/app. If not, this string will be changed to 'assets/app-default'
   * and the default InfoMapper set up will be used instead.
   */
  public appPath: string = 'assets/app/';
  /**
   * An array of DataUnit objects that each contain the precision for different types of data, from degrees to mile per hour.
   * Read from the application config file top level property dataUnitsPath.
   */
  public dataUnits: DataUnits[];
  /**
   * The hard-coded string of the path to the default icon path that will be used for the website if none is given.
   */
  public readonly defaultFaviconPath = 'assets/app-default/img/OWF-Logo-Favicon-32x32.ico';
  /**
   * The boolean representing if a favicon path has been provided by the user.
   */
  public FAVICON_SET = false;
  /**
   * The path to the user-provided favicon .ico file.
   */
  public faviconPath: string;
  /**
   * The string representing a user's google tracking ID, set in the upper level application config file.
   */
  public googleAnalyticsTrackingId = '';
  /**
   * Boolean showing whether the google tracking ID has been set for the InfoMapper.
   */
  public googleAnalyticsTrackingIdSet = false;
  /**
   *  Boolean showing whether the default home content page has been initialized.
   */
  public homeInit = true;
  /**
   * The string representing the current selected markdown path's full path starting from the @var appPath
   */
  public fullMarkdownPath: string;


  /**
   * @constructor for the App Service.
   * @param http The reference to the HttpClient class for HTTP requests.
   * @param mapService The reference to the map service, for sending data between components and higher scoped map variables.
   */
  constructor(private http: HttpClient,
              private mapService: MapService) { }


  /**
   * Builds the correct path needed for an HTTP GET request for either a local file or URL, and does so whether
   * given an absolute or relative path in a configuration or template file.
   * @param pathType A PathType enum representing what kind of path that needs to be built
   * @param arg An optional array for arguments needed to build the path, e.g. a filename or geoLayerId
   */
  public buildPath(pathType: PathType, arg?: any[]): string {
    // If a URL is given as the path that needs to be built, just return it so the http GET request can be performed
    if (arg) {
      if (arg[0].startsWith('https') || arg[0].startsWith('http') || arg[0].startsWith('www')) {
        return arg[0];
      }
    }
    // Depending on the pathType, build the correct path
    switch(pathType) {
      case PathType.cPP:
        return this.getAppPath() + this.mapService.getContentPathFromId(arg[0]);
      case PathType.gLGJP:
        return this.getAppPath() + this.mapService.getGeoJSONBasePath() + arg[0];
      case PathType.hPP:
        return this.getAppPath() + this.mapService.getHomePage();
      case PathType.eCP:
        return this.getAppPath() + this.mapService.getMapConfigPath() + arg[0];
      case PathType.cP:
      case PathType.csvPath:
      case PathType.dVP:
      case PathType.dUP:
      case PathType.dP:
      case PathType.sMP:
      case PathType.sIP:
      case PathType.rP:
        if (pathType === PathType.dP) {
          this.setFullMarkdownPath(this.getAppPath() + this.mapService.formatPath(arg[0], pathType));
        }
        return this.getAppPath() + this.mapService.formatPath(arg[0], pathType);
      case PathType.bSIP:
        return this.mapService.formatPath(arg[0], pathType);
      case PathType.mP:
        if (arg[0].startsWith('/')) {
          return this.getAppPath() + this.mapService.formatPath(arg[0], pathType);
        } else {
          return this.getFullMarkdownPath() + this.mapService.formatPath(arg[0], pathType);
        }
      default:
        return '';
    }
  }

  /**
   * 
   * @param path The path represented as a string, for a URL or local path
   * @param formatType The string describing how long the formatted string can be
   */
  public formatPath(path: string, formatType?: string): string {
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
   * @returns the path to the application configuration file
   */
  public getAppConfigFile(): string {
    return this.appConfigFile;
  }

  /**
   * @returns either 'assets/app/' if a user-provided configuration file is supplied, or the default 'assets/app-default/'
   * for the upper level assets path if none is given
   */
  public getAppPath(): string {
    return this.appPath;
  }

  /**
   * @returns the array of DataUnits
   */
  public getDataUnitArray(): DataUnits[] { return this.dataUnits; }

  /**
   * @returns the application's default favicon path
   */
  public getDefaultFaviconPath(): string { return this.defaultFaviconPath; }

  /**
   * @returns the current selected markdown path's full path starting from the @var appPath
   */
  public getFullMarkdownPath(): string { return this.fullMarkdownPath }

  /**
   * @returns whether the default home content page has been initialized
   */
  public getHomeInit(): boolean { return this.homeInit; }

  /**
   * @returns the boolean representing if a user provided favicon path has been provided
   */
  public faviconSet(): boolean { return this.FAVICON_SET; }

  /**
   * @returns either the first '/' removed from an absolute path or the relative path to a favicon image
   */
  public getFaviconPath(): string {
    if (this.faviconPath.startsWith('/')) {
      return this.faviconPath.substring(1);
    } else return this.faviconPath;
  }

  /**
   * @returns the @var googleAnalyticsTrackingId to set what google analytics account will be receiving site hit information
   */
  public getGoogleTrackingId(): string { return this.googleAnalyticsTrackingId; }

  /**
   * Read data from either a file or URL and return it as JSON
   * @param path The path or URL to the file needed to be read
   * @returns The JSON retrieved from the host as an Observable
   */
  public getJSONData(path: string, type?: PathType, id?: string): Observable<any> {
    // This creates an options object with the optional headers property to add headers to the request. This could solve some
    // CORS issues, but is not completely tested yet
    // var options = {
    //   headers: new HttpHeaders({
    //     'Access-Control-Request-Method': 'GET'
    //   })
    // }
    return this.http.get<any>(path)
    .pipe(
      catchError(this.handleError<any>(path, type, id))
    );
  }

  /**
   * 
   * @param path The path to the file to be read, or the URL to send the GET request
   * @param type Optional type of request sent, e.g. PathType.cPP. Used for error handling and messaging
   * @param id Optional app-config id to help determine where exactly an error occurred
   */
  public getPlainText(path: string, type?: PathType, id?: string): Observable<any> {

    const obj: Object = { responseType: 'text' as 'text' }
    return this.http.get<any>(path, obj)
    .pipe(
      catchError(this.handleError<any>(path, type, id))
    );
  }

  /**
   * Handle Http operation that failed, and let the app continue.
   * @param path - Name of the path used that failed
   * @param type - Optional type of the property error. Was it a home page, template, etc.
   * @param result - Optional value to return as the observable result
   */
  private handleError<T> (path: string, type?: PathType, id?: string, result?: T) {
    return (error: any): Observable<T> => {

      switch(error.status) {
        case 404:
          this.mapService.setBadPath(path, id); break;
        case 400:
          this.mapService.setServerUnavailable(id); break;
      }
      // Log the error to console instead
      // If the error message includes a parsing issue, more often than not it is a badly created JSON file. Detect if .json
      // is in the path, and if it is let the user know. If not, the file is somehow incorrect
      if (error.message.includes('Http failure during parsing')) {
        console.error('[' + type + '] error. Info Mapper could not parse a file. Confirm the \'' + path +
        '\' file is %s', (path.includes('.json') ? 'valid JSON' : 'created correctly'));
        return of(result as T);
      }
      // TODO: jpkeahey delete this once all switch options are done
      if (type) {
        console.error('[' + type + '] error. There might have been a problem with the ' + type +
          ' path. Confirm the path is correct in the configuration file');
      }

      switch(type) {
        case PathType.fMCP:
          console.error('Confirm the app configuration property \'mapProject\' with id \'' + id + '\' is the correct path');
          break;
        case PathType.gLGJP:
          console.error('Confirm the map configuration property \'sourcePath\' is the correct path');
          break;
        case PathType.eCP:
          console.error('Confirm the map configuration EventHandler property \'eventConfigPath\' is the correct path');
          break;
        case PathType.aCP:
          console.error('No app-config.json detected in ' + this.appPath + '. Confirm app-config.json exists in ' + this.appPath);
          break;
        case PathType.cPage:
          console.error('Confirm the app configuration property \'markdownFilepath\' with id \'' + id + '\' is the correct path');
          break;
        case PathType.rP:
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
   * @returns if the googleAnalytics tracking id has been set so the gtag function from google doesn't need to
   * wait a full second after the initial set up of the @var googleAnalyticsTrackingId
   */
  public isTrackingIdSet(): boolean { return this.googleAnalyticsTrackingIdSet; }

  /**
   * @returns true if the given property to be displayed in the Mat Table cell is a URL.
   * @param property The Mat Table cell property to check
   */
  public isURL(property: any): boolean {
    if (typeof property === 'string') {
      if (property.startsWith('http://') || property.startsWith('https://') || property.startsWith('www.')) {
        return true;
      }
    } else return false;
  }

  /**
   * Sanitizes the markdown syntax by checking if image links are present, and replacing them with the full path to the
   * image relative to the markdown file being displayed. This eases usability so that just the name and extension of the
   * file can be used e.g. ![Waldo](waldo.png) will be converted to ![Waldo](full/path/to/markdown/file/waldo.png)
   * @param doc The documentation string retrieved from the markdown file
   */
  public sanitizeDoc(doc: string, pathType: PathType): string {
    // Needed for a smaller scope when replacing the image links
    var _this = this;
    // If anywhere in the documentation there exists  ![any amount of text](
    // then it is the syntax for an image, and the path needs to be changed
    if (/!\[(.*?)\]\(/.test(doc)) {
      // Create an array of all substrings in the documentation that match the regular expression  ](any amount of text)
      var allImages: string[] = doc.match(/\]\((.*?)\)/g);
      // Go through each one of these strings and replace each one that does not specify itself as an in-page link,
      // or external link
      for (let image of allImages) {
        if (image.startsWith('](#') || image.startsWith('](https') || image.startsWith('](http') || image.startsWith('](www')) {
          continue;
        } else {

          doc = doc.replace(image, function(word) {
            // Take off the pre pending ]( and ending )
            var innerParensContent = word.substring(2, word.length - 1);
            // Return the formatted full markdown path with the corresponding bracket and parentheses
            return '](' + _this.buildPath(pathType, [innerParensContent]) + ')';
          });

        }
      }
    }

    return doc;
  }

  /**
   * No configuration file was detected from the user, so the 'assets/app-default/' path is set
   * @param path The default assets path to set the @var appPath to
   */
  public setAppPath(path: string): void { this.appPath = path; }

  /**
   * Sets the @var dataUnits array to the passed in dataUnits from the nav-bar
   * @param dataUnits The array of DataUnits to set the service @var dataUnits to
   */
  public setDataUnits(dataUnits: DataUnits[]): void { this.dataUnits = dataUnits; }

  /**
   * Sets the FAVICON_SET boolean to true after a user-provided favicon path has been set, so it's only set once
   */
  public setFaviconTrue(): void { this.FAVICON_SET = true; }

  /**
   * Sets the app service @var faviconPath to the user-provided path given in the app configuration file
   * @param path The path to the user-provided favicon image
   */
  public setFaviconPath(path: string): void { this.faviconPath = path; }

  private setFullMarkdownPath(path: string): void {
    
    var fullMarkdownPath = '';
    let splitPath: string[] = path.split('/');
    for (let i = 0; i < splitPath.length - 1; i++) {
      fullMarkdownPath += splitPath[i] + '/';
    }
    this.fullMarkdownPath = fullMarkdownPath;
  }

  /**
   * Sets the @var homeInit to false, since the first home page has been displayed, and the @var appConfig has been set
   * @param homeInit The boolean changing the @var homeInit to false
   */
  public setHomeInit(homeInit: boolean): void { this.homeInit = homeInit; }

  /**
   * Sets the app service's @var googleAnalyticsTrackingId so it can be retrieved by the app component
   * @param id The google analytics tracking id from the app configuration file
   */
  public setGoogleTrackingId(id: string): void {
    this.googleAnalyticsTrackingIdSet = true;
    this.googleAnalyticsTrackingId = id;
  }

  /**
   * As of right now, this GETs a full file, and might be slow with large files. Its only purpose is to try to GET a URL,
   * and throw an error if unsuccessful. Determines if a user-defined app/ file is given, or if the app-default should be
   * used.
   * @param url The URL to try to GET from
   */
  public urlExists(url: string): Observable<any> {
    return this.http.get(url);
  }

}

/**
 * Enum with the supported file paths for the InfoMapper.
 */
export enum PathType {
  aCP = 'appConfigPath',
  bSIP = 'builtinSymbolImagePath',
  csvPath = 'csvPath',
  cP = 'classificationPath',
  cPP = 'contentPagePath',
  cPage = 'Content Page',
  dP = 'docPath',
  dVP = 'dateValuePath',
  dUP = 'dataUnitsPath',
  eCP = 'eventConfigPath',
  fMCP = 'fullMapConfigPath',
  gLGJP = 'geoLayerGeoJsonPath',
  hPP = 'homePagePath',
  mP = 'markdownPath',
  raP = 'rasterPath',
  rP = 'resourcePath',
  sIP = 'symbolImagePath',
  sMP = 'stateModPath',
  vP = 'versionPath'
}