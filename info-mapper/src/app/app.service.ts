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
  public homeInit = true;
  public fullMarkdownPath: string;
  public title: string = '';


  /**
   * @constructor for the App Service
   * @param http A reference to the HttpClient class for HTTP requests
   * @param router A reference to the router service that provides navigation and URL manipulation capabilities
   */
  constructor(private mapService: MapService,
              private http: HttpClient,
              private router: Router) { }


  /**
   * Builds the correct path needed for an HTTP GET request for either a local file or URL, and does so whether
   * given an absolute or relative path in a configuration or template file.
   * @param pathType A string representing what kind of path that needs to be built
   * @param arg An optional array for arguments needed to build the path, e.g. a filename or geoLayerId
   */
  public buildPath(pathType: string, arg?: any[]): string {

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
   * Read data from either a file or URL and return it as JSON
   * @param path The path or URL to the file needed to be read
   * @returns The JSON retrieved from the host as an Observable
   */
  public getJSONData(path: string): Observable<any> {    
    return this.http.get<any>(path)
    .pipe(
      catchError(this.handleError<any>(path))
    );
  }

  public getPlainText(path: string, type?: string): Observable<any> {
    
    const obj: Object = {responseType: 'text' as 'text'}
    return this.http.get<any>(path, obj)
    .pipe(
      catchError(this.handleError<any>(path, type))
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
  private handleError<T> (path: string, type?: string, result?: T) {
    return (error: any): Observable<T> => {
      // Log the error to console instead
      console.error(error.message + ": '"+ path + "' could not be read");
      console.error('[' + type + '] error. There was a problem with the ' + type + ' path. Confirm the path is correct in the configuration file');

      // TODO: jpkeahey 2020.07.22 - Don't show a map error no matter what. I'll probably want to in some cases.
      // if (type === '')
      // this.router.navigateByUrl('map-error');
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

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

  /**
   * Sets the @var homeInit to false, since the first home page has been displayed, and the @var appConfig has been set
   * @param homeInit The boolean changing the @var homeInit to false
   */
  public setHomeInit(homeInit: boolean): void { this.homeInit = homeInit; }

  private setFullMarkdownPath(path: string): void {
    
    var fullMarkdownPath = '';
    let splitPath: string[] = path.split('/');
    for (let i = 0; i < splitPath.length - 1; i++) {
      fullMarkdownPath += splitPath[i] + '/';
    }
    this.fullMarkdownPath = fullMarkdownPath;
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
