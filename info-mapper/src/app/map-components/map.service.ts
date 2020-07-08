import { Injectable }                   from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { Router }                       from '@angular/router';

import { catchError }                   from 'rxjs/operators';

import { Observable, of,
          BehaviorSubject }             from 'rxjs';

import { BackgroundLayerItemComponent } from './background-layer-control/background-layer-item.component';
import { MapLayerItemComponent }        from './map-layer-control/map-layer-item.component';


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
  hiddenLayers: Object[] = [];
  originalDrawOrderIndexes: Object[] = [];
  containerViews = new BehaviorSubject("a");
  data = this.containerViews.asObservable();
  graphFilePath: string;
  graphTSID: string;
  featureProperties: Object;
  chartTemplateObject: Object;

  contentPaths: string[] = [];
  mapConfigPaths: string[] = [];

  constructor(private http: HttpClient,
              private router: Router) { }


  public addContentPath(path: string): void {
    this.contentPaths.push(path);
  }

  public addInitLayerToDrawOrder(geoLayerViewGroupId: string, index: number, leafletId: number): void {
    this.layerOrder.push({[geoLayerViewGroupId] : [index, leafletId]});
  }

  public addHiddenLayerToDrawOrder(leafletId: string): void {

    var hiddenLayers: Object[] = this.getHiddenLayers();
    var originalIndex: number = -1;
    for (let indexObject of this.originalDrawOrderIndexes) {
      if (indexObject[leafletId]) {
        originalIndex = indexObject[leafletId];
      }
    }
    

    var i = 0;
    for (let hiddenLayer of hiddenLayers) {
      for (let key in hiddenLayer) {
        if (hiddenLayer[key][1] === leafletId) {          
          this.layerOrder.splice(originalIndex, 0, hiddenLayer);          
          return;
        }
      }
      i++;
    }
  }

  public addMapConfigPath(path: string): void {
    this.mapConfigPaths.push(path);
  }

  public getAppConfigFile(): string {
    return this.appConfigFile;
  }

  public getAppPath(): string {
    return this.appPath;
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

  public getChartTemplateObject(): Object {
    return this.chartTemplateObject;
  }

  getContainerViews(): any {
    return this.containerViews;
  }

  public getContentPathFromId(id: string) {
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
    if (!this.mapConfigFile.geoMaps[0].properties.extentInitial) {
      console.error("Map Configuration property '" +
      this.mapConfigFile.geoMaps[0].properties.extentInitial +
      "' is incorrectly formatted. Confirm property is extentInitial." +
      "Setting ZoomLevel to '[0, 0], 0' for world-wide view")

      return ["0", "0", "0"];
    }

    let extentInitial: string = this.mapConfigFile.geoMaps[0].properties.extentInitial;
    let splitInitial: string[] = extentInitial.split(':');
    
    if (splitInitial[0] == 'ZoomLevel' && splitInitial[1].split(',').length != 3)
      console.error("ZoomLevel inputs of " + splitInitial[1] +
      " is incorrect. Usage for a ZoomLevel property is 'ZoomLevel:Longitude, Latitude, Zoom Level'");
    
    return splitInitial[1].split(',');  
  }

  public getFeatureProperties(): Object {
    return this.featureProperties;
  }

  /**
   * Returns the full path (minus the assets/app/) to the map configuration file, and sets the path without the file name as well
   * for use of relative paths used by other files.
   * @param id The app config id assigned to each menu.
   */
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
            if (path.startsWith('/')) {
              this.setMapConfigPath(path.substring(1));
              this.setGeoJSONBasePath(this.appConfig.mainMenu[i].menus[menu].mapProject.substring(1));
              return this.appConfig.mainMenu[i].menus[menu].mapProject.substring(1);
            } else {
              this.setMapConfigPath(path);
              this.setGeoJSONBasePath(this.appConfig.mainMenu[i].menus[menu].mapProject);
              return this.appConfig.mainMenu[i].menus[menu].mapProject;
            }
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

  /**
   * Goes through each geoLayer in the GeoMapProject and if one matches with the given geoLayerId parameter,
   * returns the geometryType attribute of that geoLayer.
   * @param id The geoLayerId of the layerView to be compared with the geoLayerId of the geoLayer
   */
  public getGeometryType(id: string): string {
    for (let geoLayer of this.mapConfigFile.geoMaps[0].geoLayers) {
      if (geoLayer.geoLayerId == id) {        
        return geoLayer.geometryType;
      }
    } 
    return 'here';
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

  /**
   * 
   */
  public getGraphFilePath(): string {
    return this.graphFilePath;
  }

  /**
   * 
   */
  public getHiddenLayers() {
    return this.hiddenLayers;
  }

  /**
   * Returns the homePage property in the app-config file without the first '/' slash.
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

  // Returns variable with config data
  public getLayers() {
    return this.layerArray;
  }

  /**
   * Return an array of the list of layer view groups from the app config file.
   * NOTE: This still uses geoMaps[0] and does not take into account more geoMaps in an app config file.
   */
  public getLayerGroups(): any[] {
    return this.mapConfigFile.geoMaps[0].geoLayerViewGroups;
  }

  /**
   * Get the array of layer marker data, such as size, color, icon, etc.
   */
  public getLayerMarkerData() : void {
    return this.mapConfigFile.layerViewGroups;
  }

  /**
   * NOTE: This function is not currently being used, as it's being used by functions in map.component.ts that have
   * not been implemented yet.
   * @param id The given geoLayerId to match with
   */
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

  /**
   * Return the geoLayerView that matches the given geoLayerId
   * @param id The given geoLayerId to match with
   */
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

  /**
   * @returns an array of Objects containing
   *   Key   - The geoLayerViewGroupId of the layer
   *   Value - An array of two elements [index of geoLayerView in geoLayerViewGroup, leaflet_id]
   */
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
    if (this.mapConfigFile) return this.mapConfigFile.geoMaps[0].name;
  }

  public getPlainText(path: string, type?: string): Observable<any> {
    
    const obj: Object = {responseType: 'text' as 'text'}
    return this.http.get<any>(path, obj)
    .pipe(
      catchError(this.handleError<any>(path, type))
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

  public getTSIDLocation(): string {
    return this.graphTSID;
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
      console.error(error.message + ': "' + path + '" could not be read');
      console.error("[" + type + "] error. There was a problem with the " + type + " path. Confirm the path is correct.")
      this.router.navigateByUrl('map-error');
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /**
   * Removes a drawObject from the layerOrder array to let the app know there is one less layer on it. It determines which
   * one to remove by comparing the layer Leaflet id from the layer toggled to the Leaflet id in the map
   * @param leafletId The _leaflet_id variable in the Leaflet map.
   */
  public removeLayerFromDrawOrder(leafletId: string): void {

    var drawOrder: Object[] = this.getLayerOrder();

    var i = 0;
    for (let drawObject of drawOrder) {
      for (let key in drawObject) {
        if (drawObject[key][1] === leafletId) {
          this.hiddenLayers.push(this.layerOrder[i]);
          this.originalDrawOrderIndexes.push({ [leafletId]: i });
          this.layerOrder.splice(i, 1);
        }
      }
      i++;
    }

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

  public setChartTemplateObject(graphTemplateObject: Object): void {
    this.chartTemplateObject = graphTemplateObject;
  }

  public setContainerViews(containerViews: any): void {    
    this.containerViews.next(containerViews);
  }

  public setFeatureProperties(featureProperties: Object): void {
    this.featureProperties = featureProperties;
  }

  public setGraphFilePath(path: string): void {
    this.graphFilePath = path;
  }

  private setGeoJSONBasePath(path: string): void {
    let splitPath: string[] = path.split('/');
    var finalPath: string = '';

    for (let i = 0; i < splitPath.length - 1; i++) {
      finalPath += splitPath[i] + '/';
    }   
    this.geoJSONBasePath = finalPath;    
  }

  /**
   * Looks at what layers are being shown on the current Leaflet map and renders them in the correct order. This should
   * be in the same order as each geoLayerView in the geoLayerViewGroups from top to bottom.
   * @param mainMap A reference to the current Leaflet map that is being displayed
   * @param L The main Leaflet object to determine what layers the mainMap contains
   */
  public setLayerOrder(mainMap: any, L: any) {

    var layerGroupArray: any[] = [];
    // An array containing the reversed order of geoLayerViewGroupId's to go through and bring each one to the front of
    // the map.
    var groupOrder: string[] = this.getGeoLayerViewGroupIdOrder();
     
    var drawOrder: Object[] = this.getLayerOrder();
    // console.log('drawOrder ->', JSON.parse(JSON.stringify(drawOrder)));

    // Go through each layerGroup in the leaflet map and add it to the
    // layerGroupArray so we can see the order in which layers were drawn
    mainMap.eachLayer((layerGroup: any) => {
      if (layerGroup instanceof L.LayerGroup) {
        layerGroupArray.push(layerGroup);        
      }  
    });
    // console.log('layerGroupArray ->', layerGroupArray);
    

    // Since drawOrder will always be the same, check the layerGroupArray, which determines how many layers are currently
    // in the Leaflet map. If there's only 1, then we don't need to set the layer for anything.
    if (layerGroupArray.length === 1) return;
    // Start by going through each viewGroup
    for (let viewGroupId of groupOrder) {
      var groupSize = 0;
      // Determine how many layers there are in the viewGroup
      for (let _ of drawOrder) {
        groupSize++;
      }
      var currentMax = Number.MIN_SAFE_INTEGER;

      for (let i = 0; i < drawOrder.length; i++) {

        if (!drawOrder[i][viewGroupId]) continue;
        
        if (drawOrder[i][viewGroupId][0] > currentMax) {
          currentMax = drawOrder[i][viewGroupId][0];
        }          
      }
      
      while (currentMax >= 0) {

        for (let i = 0; i < drawOrder.length; i++) {
                  
          if (!drawOrder[i][viewGroupId]) continue;
                           
          if (drawOrder[i][viewGroupId][0] === currentMax && layerGroupArray[i] !== undefined) {
            // console.log(i);
            
            layerGroupArray[i].bringToFront();            
            break;
          }
        }
        currentMax--;
      }
    }
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

  public setTSIDLocation(tsid: string): void {
    this.graphTSID = tsid;
  }

}
