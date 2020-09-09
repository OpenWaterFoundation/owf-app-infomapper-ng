import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Router }     from '@angular/router';

import { catchError } from 'rxjs/operators';
import { Observable,
         of }         from 'rxjs';
import { MapService } from './map-components/map.service';


@Injectable({ providedIn: 'root' })
export class AppService {

  public appConfigFile: string = 'app-config.json';
  public appPath: string = 'assets/app/';
  public defaultFaviconPath = 'assets/app-default/img/OWF-Logo-Favicon-32x32.ico';
  public FAVICON_SET = false;
  public faviconPath: string;
  public googleAnalyticsTrackingId = '';
  public googleAnalyticsTrackingIdSet = false;
  public homeInit = true;
  public fullMarkdownPath: string;
  public title: string = '';


  /**
   * @constructor for the App Service
   * @param http A reference to the HttpClient class for HTTP requests
   * @param mapService A reference to the map service, for sending data between components and global variables
   */
  constructor(private http: HttpClient,
              private mapService: MapService) { }


  /**
   * Builds the correct path needed for an HTTP GET request for either a local file or URL, and does so whether
   * given an absolute or relative path in a configuration or template file.
   * @param pathType A string representing what kind of path that needs to be built
   * @param arg An optional array for arguments needed to build the path, e.g. a filename or geoLayerId
   */
  public buildPath(pathType: string, arg?: any[]): string {
    // If a URL is given as the path that needs to be built, just return it so the http GET request can be performed
    if (arg) {
      if (arg[0].startsWith('https') || arg[0].startsWith('http') || arg[0].startsWith('www')) {
        return arg[0];
      }
    }
    
    // Depending on the pathType, build the corresponding correct path
    switch(pathType) {
      case 'contentPagePath':
        return this.getAppPath() + this.mapService.getContentPathFromId(arg[0]);
      case 'geoLayerGeoJsonPath':
        return this.getAppPath() + this.mapService.getGeoJSONBasePath() + arg[0];
      case 'homePagePath':
        return this.getAppPath() + this.mapService.getHomePage();
      case 'popupConfigPath':
        return this.getAppPath() + this.mapService.getMapConfigPath() + arg[0];
      case 'classificationPath':
      case 'csvPath':
      case 'dateValuePath':
      case 'docPath':
      case 'stateModPath':
      case 'symbolImage':
      case 'resourcePath':
        if (pathType === 'docPath') {
          this.setFullMarkdownPath(this.getAppPath() + this.mapService.formatPath(arg[0], pathType));
        }
        return this.getAppPath() + this.mapService.formatPath(arg[0], pathType);
      case 'builtinSymbolImage':
        return this.mapService.formatPath(arg[0], pathType);
      case 'markdownPath':
        return this.getFullMarkdownPath() + this.mapService.formatPath(arg[0], pathType);
      default:
        return '';
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
  public getJSONData(path: string, type?: string, id?: string): Observable<any> {
    return this.http.get<any>(path)
    .pipe(
      catchError(this.handleError<any>(path, type, id))
    );
  }

  /**
   * 
   * @param path The path to the file to be read, or the URL to send the GET request
   * @param type Optional type of request sent, e.g. ContentPagePath. Used for error handling and messaging
   * @param id Optional app-config id to help determine where exactly an error occurred
   */
  public getPlainText(path: string, type?: string, id?: string): Observable<any> {

    const obj: Object = {responseType: 'text' as 'text'}
    return this.http.get<any>(path, obj)
    .pipe(
      catchError(this.handleError<any>(path, type, id))
    );
  }

  public getTitle(): string {
    return this.title;
  }

  /**
   * Handle Http operation that failed, and let the app continue.
   * @param path - Name of the path used that failed
   * @param type - Optional type of the property error. Was it a home page, template, etc.
   * @param result - Optional value to return as the observable result
   */
  private handleError<T> (path: string, type?: string, id?: string, result?: T) {
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
        case 'fullMapConfigPath':
          console.error('Confirm the app configuration property \'mapProject\' with id \'' + id + '\' is the correct path');
          break;
        case 'geoLayerGeoJsonPath':
          console.error('Confirm the map configuration property \'sourcePath\' is the correct path');
          break;
        case 'popupConfigPath':
          console.error('Confirm the map configuration EventHandler property \'popupConfigPath\' is the correct path');
          break;
        case 'appConfigPath':
          console.error('No app-config.json detected in ' + this.appPath + '. Confirm app-config.json exists in ' + this.appPath);
          break;
        case 'Content Page':
          console.error('Confirm the app configuration property \'markdownFilepath\' with id \'' + id + '\' is the correct path');
          break;
        case 'resourcePath':
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
   * No configuration file was detected from the user, so the 'assets/app-default/' path is set
   * @param path The default assets path to set the @var appPath to
   */
  public setAppPath(path: string): void {
    this.appPath = path;
  }

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

  public setTitle(title: string): void {
    this.title = title;
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
