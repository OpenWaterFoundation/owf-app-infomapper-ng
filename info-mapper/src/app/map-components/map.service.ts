import { Injectable }                   from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { Router }                       from '@angular/router';

import { catchError }                   from 'rxjs/operators';

import { Observable, forkJoin, of }     from 'rxjs';

import { BackgroundLayerComponent }     from './background-layer-control/background-layer.component';
import { BackgroundLayerItemComponent } from './background-layer-control/background-layer-item.component';
import { MapLayerComponent }            from './map-layer-control/map-layer.component';
import { MapLayerItemComponent }        from './map-layer-control/map-layer-item.component';

import { map }                          from "rxjs/operators"; 

@Injectable({ providedIn: 'root' })
export class MapService {

  layerArray: MapLayerItemComponent[] = [];
  backgroundLayerArray: BackgroundLayerItemComponent[] = [];
  // Global variables to be used throughout the application
  appConfig: any;
  appConfigFile: string = 'app-config.json';
  appPath: string = 'assets/app/';
  mapConfigFile: any;
  mapConfigPath: string = '';
  geoJSONBasePath: string = '';
  homePage: string = '';
  title: string = '';
  layerOrder: Object[] = [];

  contentPaths: string[] = [];
  mapConfigPaths: string[] = [];

  constructor(private http: HttpClient,
              private router: Router) { }


  public addContentPath(path: string): void {
    this.contentPaths.push(path);
  }

  public addMapConfigPath(path: string): void {
    this.mapConfigPaths.push(path);
  }

  public getAppPath(): string {
    return this.appPath;
  }

  public getAppConfigFile(): string {
    return this.appConfigFile;
  }

  public getBackgroundGeoLayerViewNameFromId(id: string) {    
    for (let geoMap of this.mapConfigFile.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {        
        if (geoLayerViewGroup.properties.isBackground == 'true') {
          for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {            
            if (geoLayerView.geoLayerId == id) {
              return geoLayerView.name;
            }
          }
        }
      }
    }
  }

  // Get the background layers for the map
  public getBackgroundLayers(): any[] {
    let backgroundLayers: any[] = [];
    this.mapConfigFile.geoMaps[0].geoLayers.forEach((geoLayer: any) => {
      if (geoLayer.properties.isBackground == 'true')
        backgroundLayers.push(geoLayer);
    });
    return backgroundLayers;
  }
  

  // Return the boolean to add a leaflet background layers control or not
  public getBackgroundLayersMapControl(): boolean {
    return true;
  }

  // public getBackgroundViewGroupName(): string {
  //   return this.mapConfigFile.
  // }

  public getContentPath(id: string) {
    for (let i = 0; i < this.appConfig.mainMenu.length; i++) {
      if (this.appConfig.mainMenu[i].menus) {  
        for (let menu = 0; menu < this.appConfig.mainMenu[i].menus.length; menu++) {    
          if (this.appConfig.mainMenu[i].menus[menu].id == id)
            return this.appConfig.mainMenu[i].menus[menu].markdownFile;
        }
      } else {
        if (this.appConfig.mainMenu[i].id == id)
          return this.appConfig.mainMenu[i].markdownFile;
      }
    }
  }

  // Read data from a file
  public getData(path: string): Observable<any> {
    return this.http.get<any>(path)
    .pipe(
      catchError(this.handleError<any>(path))
    );
  }

  public getGeometryType(id: string): string {
    for (let geoLayer of this.mapConfigFile.geoMaps[0].geoLayers) {
      if (geoLayer.geoLayerId == id) {        
        return geoLayer.geometryType;
      }
    } 
    return 'here';
  }

  // Get default background layer
  public getDefaultBackgroundLayer(): string {
    for (let geoMap of this.mapConfigFile.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (geoLayerViewGroup.properties.isBackground == 'true') {
          for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
            if (geoLayerView.properties.selectedInitial == 'true') {
              return geoLayerView.name;
            }
          }
        }
      }
    }
    return '';
  }

  public getExtentInitial(): string[] {
    // Make sure to do some error handling for incorrect input
    let extentInitial: string = this.mapConfigFile.geoMaps[0].properties.extentInitial;
    let splitInitial: string[] = extentInitial.split(':');
    
    return splitInitial[1].split(',');  
  }

  public getFullMapConfigPath(id: string): string {

    for (let i = 0; i < this.appConfig.mainMenu.length; i++) {
      if (this.appConfig.mainMenu[i].menus) {  
        for (let menu = 0; menu < this.appConfig.mainMenu[i].menus.length; menu++) {    
          if (this.appConfig.mainMenu[i].menus[menu].id == id) {
            var path: string = '';
            let splitPath = this.appConfig.mainMenu[i].menus[menu].mapProject.split('/');
            for (let i = 0; i < splitPath.length - 1; i++) {
              path += splitPath[i] + '/';
            }
            this.setMapConfigPath(path);
            this.setGeoJSONBasePath(this.appConfig.mainMenu[i].menus[menu].mapProject);
            return this.appConfig.mainMenu[i].menus[menu].mapProject;
          }
        }
      } else {
        if (this.appConfig.mainMenu[i].id == id) {
          var path: string = '';
          let splitPath = this.appConfig.mainMenu[i].split('/');
          for (let i = 0; i < splitPath.length - 1; i++) {
            path += splitPath[i] + '/';
          }
          this.setMapConfigPath(path);
          this.setGeoJSONBasePath(this.appConfig.mainMenu[i].mapProject);
          return this.appConfig.mainMenu[i].mapProject;
        }
      }
    }
    return '';
  }

  public getGeoJSONBasePath(): string {
    return this.geoJSONBasePath;
  }

  public getGeoLayerFromId(id: string): any {
    for (let geoMap of this.mapConfigFile.geoMaps) {
      for (let geoLayer of geoMap.geoLayers) {
        if (geoLayer.geoLayerId == id) {
          return geoLayer;
        }
      }
    }
    return '';
  }

  // Return the geoLayerView that matches the given geoLayerId
  public getBackgroundGeoLayerViewFromId(id: string) {
    
    var geoLayerViewGroups: any = this.mapConfigFile.geoMaps[0].geoLayerViewGroups;

    for (let geoLayerViewGroup of geoLayerViewGroups) {
      if (geoLayerViewGroup.properties.isBackground == 'true') {
        for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {    
          if (geoLayerView.geoLayerId == id) {
            return geoLayerView;
          }
        }
      }
    }
    return '';
  }

  // Returns an array of layer file names from the json config file.
  public getGeoLayers(): any[] {
    let geoLayers: any[] = [];
    this.mapConfigFile.geoMaps.forEach((geoMap: any) => {
      geoMap.geoLayers.forEach((geoLayer: any) => {
        if (!geoLayer.properties.isBackground || geoLayer.properties.isBackground == 'false') {
          geoLayers.push(geoLayer);
        }
      });
    });    
    return geoLayers.reverse();
  }

  public getGeoLayerViewGroupIdOrder(): string[] {
    var allGeoLayerViewGroups: string[] = [];
    for (let geoMap of this.mapConfigFile.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (!geoLayerViewGroup.properties.isBackground || geoLayerViewGroup.properties.isBackground == 'false') {
          allGeoLayerViewGroups.push(geoLayerViewGroup.geoLayerViewGroupId);
        }
      }
    }
    return allGeoLayerViewGroups.reverse();
  }
  
  public getGeoLayerViewEventHandler(geoLayerId: string): any[] {

    var geoLayerViewGroups: any = this.mapConfigFile.geoMaps[0].geoLayerViewGroups;

    for (let geoLayerViewGroup of geoLayerViewGroups) {
      if (!geoLayerViewGroup.properties.isBackground || geoLayerViewGroup.properties.isBackground == 'false') {
        for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
          if (geoLayerView.geoLayerId == geoLayerId) {
            return geoLayerView.eventHandlers;
          }
        }
      }
    }
    return [];
  }

  // TODO: jpkeahey 2020.05.18 - This has not yet been used. It's for getting
  // the home page from the app-config.json file, but this property has not
  // been used in the config file.
  public getHomePage(): string {
    return this.homePage;
  }

  // Returns variable with config data
  public getLayers() {
    return this.layerArray;
  }

  // Return an array of the list of layer view groups from config file.
  public getLayerGroups(): any[] {
    return this.mapConfigFile.geoMaps[0].geoLayerViewGroups
  }

  // Get the array of layer marker data, such as size, color, icon, etc.
  public getLayerMarkerData() : void {
    return this.mapConfigFile.layerViewGroups;
  }

  // This uses the old configuration file and has not been updated yet.
  public getLayerFromId(id: string) {
    let dataLayers: any = this.mapConfigFile.dataLayers;
    let layer: any = null;
    dataLayers.forEach((l: any) => {
      if (l.geolayerId == id) {
        layer = l;
      }
    })
    return layer;
  }

  // Return the geoLayerView that matches the given geoLayerId
  public getLayerViewFromId(id: string) {
    
    var geoLayerViewGroups: any = this.mapConfigFile.geoMaps[0].geoLayerViewGroups;
    var layerView: any = null;

    for (let geoLayerViewGroup of geoLayerViewGroups) {
      if (!geoLayerViewGroup.properties.isBackground || geoLayerViewGroup.properties.isBackground == 'false') {
        for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {    
          if (geoLayerView.geoLayerId == id) {
            layerView = geoLayerView;
            break;
          }
        }
      }
    }
    return layerView;
  }

  public getLayerViewGroupOrder(): any[] {

    var geoLayerViewGroups: any = this.mapConfigFile.geoMaps[0].geoLayerViewGroups;
    var layerViewGroupsArray: any[] = [];
    // var layerViewGroupOrder: any[] = [];

    for (let geoLayerViewGroup of geoLayerViewGroups) {
      if (!geoLayerViewGroup.properties.isBackground || geoLayerViewGroup.properties.isBackground == 'false') {
        layerViewGroupsArray.push(geoLayerViewGroup);
      }
    }

    // let backgroundLayers: Object[] = [];
    // this.mapConfigFile.geoMaps[0].geoLayerViewGroups.forEach((geoLayerViewGroup: any) => {
    //   if (geoLayerViewGroup.properties.isBackground == 'true') {
    //     geoLayerViewGroup.geoLayerViews.forEach((geoLayerView: Object) => {
    //       backgroundLayers.push(geoLayerView);
    //     });
    //   }
    // });
    // return backgroundLayers;
    return layerViewGroupsArray;
  }

  public getLayerViewUIEventHandlersFromId(id: string) {
    let layerViewUIEventHandlers: any = this.mapConfigFile.layerViewUIEventHandlers;
    let returnHandlers: any[] = [];
    if (layerViewUIEventHandlers) {
      layerViewUIEventHandlers.forEach((handler: any) => {
        if (handler.layerViewId == id) {
          returnHandlers.push(handler);
        }
      })
    }
    return returnHandlers;
  }

  public getLayerOrder(): Object[] {
    return this.layerOrder;
  }

  public getMapConfigFile() {
    return this.mapConfigFile;
  }

  public getMapConfigPath(): string {
    return this.mapConfigPath;
  }

  public getMouseoverFromId(id: string): {} {
    let mouseover: any;
    let layerView: any = this.getLayerViewFromId(id)
    if (layerView.onMouseover != null) {
      mouseover = layerView.onMouseover;
    } else {
      mouseover = {
        "action": "",
        "properties": ""
      }
    }
    return mouseover;
  }

  public getName(): string {
    if (this.mapConfigFile.name) return this.mapConfigFile.name;
  }

  public getOnClickFromId(id: string): {} {
    let onClick: any;
    let layerView: any = this.getLayerViewFromId(id);
    if (layerView.onClick != null) {
      onClick = layerView.onClick;
    } else {
      onClick = {
        "action": "",
        "properties": ""
      }
    }
    return onClick;
  }

  public getPlainText(path: string): Observable<any> {
    
    const obj: Object = {responseType: 'text' as 'text'}
    return this.http.get<any>(path, obj)
    .pipe(
      catchError(this.handleError<any>(path))
    );
  }

  public getProperties(): {} {
    return this.mapConfigFile.properties;
  }

  public getRefreshTime(id: string): string[] {
    return this.getLayerViewFromId(id).properties.refreshInterval.split(" ");
  }

  public getSymbolDataFromID(id: string): any {
    var geoLayerViewGroups: any = this.mapConfigFile.geoMaps[0].geoLayerViewGroups;
    var layerviewRet: any;
    
    for (let geoLayerViewGroup of geoLayerViewGroups) {
      for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
        if (geoLayerView.geoLayerId == id) {
          layerviewRet = geoLayerView.geoLayerSymbol;
        }
      }
    }
    return layerviewRet;
  }

  public getTitle(): string {
    return this.title;
  }

  /**
   * Handle Http operation that failed, and let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (path: string, result?: T) {
    return (error: any): Observable<T> => {
      // Log the error to console instead
      console.error(error.message + ': "' + path + '" could not be read');
      this.router.navigateByUrl('map-error');
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  public resetLayerOrder(): void {
    this.layerOrder = [];
  }

  public setAppConfig(appConfigFile: {}): void {
    this.appConfig = appConfigFile;
  }

  public setAppPath(path: string): void {
    this.appPath = path;
  }

  private setGeoJSONBasePath(path: string): void {
    let splitPath: string[] = path.split('/');
    var finalPath: string = '';

    for (let i = 0; i < splitPath.length - 1; i++) {
      finalPath += splitPath[i] + '/';
    }   
    this.geoJSONBasePath = finalPath;    
  }

  // NOT YET USED
  public setHomePage(homePage: string): void {
    this.homePage = homePage;
  }

  public setLayerToOrder(geoLayerViewGroupId: string, index: number): void {
    this.layerOrder.push({[geoLayerViewGroupId] : index});
  }

  // Set the .json configuration file
  public setMapConfigFile(mapConfigFile: any): void {
    this.mapConfigFile = mapConfigFile;
  }

  public setMapConfigPath(path: string): void {
    this.mapConfigPath = path;
  }

  public setTitle(title: string): void {
    this.title = title;
  }
  
  // As of right now, this GETs a full file, and might be slow with large files
  public urlExists(url: string): Observable<any> {
    return this.http.get(url);
  }
}
