import { Injectable }      from '@angular/core';

import { MapUtil }         from './map.util';

import { MapLayerManager } from './map-layer-manager';

@Injectable({ providedIn: 'root' })
export class MapService {

  public attributeTableFeatures: {} = {};
  // The object that holds the application configuration contents from the app-config.json file
  public appConfig: any;
  public badPath: {} = {};
  public clicked = false;
  public chartTemplateObject: Object;
  public graphFilePath: string;
  public geoJSONBasePath: string = '';
  public graphTSID: string;
  // Pre-emptive creation of an array to hold maps that have already been created by the user so that they don't have to be
  // created from scratch every time
  public leafletMapArray: any[] = [];
  // The object that holds the map configuration contents from the map configuration file for a Leaflet map
  public mapConfig: any;
  public mapConfigLayerOrder: string[] = [];
  public mapConfigPath: string = '';
  public mapLayerObjectTest: {} = {};
  public originalFeatureStyle: any;
  public serverUnavailable: {} = {};


  /**
   * @constructor for the Map Service
   */
  constructor() { }


  /**
   * Formats the path with either the correct relative path prepended to the destination file, or the removal of the beginning
   * '/' forward slash or an absolute path.
   * @param path The given path to format
   * @param pathType A string representing the type of path being formatted, so the correct handling can be used.
   */
  public formatPath(path: string, pathType: string): string {

    switch (pathType) {
      case 'csvPath':
      case 'dateValuePath':
      case 'docPath':
      case 'stateModPath':
      case 'resourcePath':
      case 'classificationPath':
        if (path.startsWith('/')) {
          return path.substring(1);
        } else {
          return this.getMapConfigPath() + path;
        }
      case 'builtinSymbolImagePath':
        if (path.startsWith('/')) {
          return 'assets/app-default/' + path.substring(1);
        } else {
          return 'assets/app-default/' + path;
        }
      case 'dataUnitsPath':
      case 'markdownPath':
      case 'rasterPath':
      case 'symbolImagePath':
        if (path.startsWith('/')) {
          return path.substring(1);
        } else {
          return path;
        }
    }

  }

  /**
   * 
   * @param saveFileName 
   * @param saveFileType 
   * @param featureProperties 
   */
  public formatSaveFileName(saveFileName: string, saveFileType: SaveFileType, featureProperties?: any): string {
    var warning = 'Undefined detected in the save file name. Confirm "saveFile" property and/or property notation ${ } is correct';

    switch (saveFileType) {
      case SaveFileType.tstable:
      // The filename is undefined OR the filename has undefined somewhere in it's name
      if (!saveFileName) {
        return 'timeseries.csv';
      }
      // Sometimes undefined can be added to the file name string earlier on if there's an issue
      else if (saveFileName.toUpperCase().includes('UNDEFINED')) {
        console.warn(warning);
        console.warn('Defaulting to file name and extension "timeseries.csv"')
        return 'timeseries.csv';
      } else {
        // At this point the saveFileName is the value of the saveFile property from the popup config file. None of its ${property}
        // notation has been converted, so the obtainPropertiesFromLine function is called to do so.
        saveFileName = MapUtil.obtainPropertiesFromLine(saveFileName, featureProperties);
        return saveFileName;
      }

      case SaveFileType.text:
        if (saveFileName.toUpperCase().includes('UNDEFINED')) {
          console.warn(warning);
          console.warn('Defaulting to file name "report"');
          return saveFileName.split('undefined').join('');
        } else {
          return saveFileName;
        }

      case SaveFileType.dataTable:
        if (!saveFileName) {
          console.warn(warning);
          console.warn('Defaulting to file name and extension "geoLayerId.csv"');
          return 'geoLayerId.csv';
        } else {
          return saveFileName + '.csv';
        }
    } 
  }

  /**
   * Check the background geoLayerViewGroup to see if the expandedInitial property exists and is set to true or false.
   * Show or hide the background layers depending which one is present, and false by default (hiding the layers)
   */
  public getBackgroundExpandedInitial(): boolean {
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (geoLayerViewGroup.properties.isBackground === 'true') {
          if (geoLayerViewGroup.properties.expandedInitial &&
              geoLayerViewGroup.properties.expandedInitial === 'true')
            return true;
          else return false;
        }
      }
    }
    return false;
  }

  /**
   * @returns the geoLayerView that matches the given geoLayerId
   * @param id 
   */
  public getBackgroundGeoLayerViewFromId(id: string) {

    var geoLayerViewGroups: any = this.mapConfig.geoMaps[0].geoLayerViewGroups;

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

  /**
   * @returns the name of the geoLayerView name
   * @param id The geoLayerId that needs to be matched
   */
  public getBackgroundGeoLayerViewNameFromId(id: string) {
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (geoLayerViewGroup.properties.isBackground === 'true') {
          for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
            if (geoLayerView.geoLayerId == id) {
              return geoLayerView.name;
            }
          }
        }
      }
    }
  }

  /**
   * @returns an array of geoLayers containing each background layer as an object
   */
  public getBackgroundLayers(): any[] {
    let backgroundLayers: any[] = [];
    this.mapConfig.geoMaps[0].geoLayers.forEach((geoLayer: any) => {
      if (geoLayer.properties.isBackground === 'true')
        backgroundLayers.push(geoLayer);
    });
    return backgroundLayers;
  }

  /**
   * @returns true no matter what for some reason...
   */
  public getBackgroundLayersMapControl(): boolean {
    return true;
  }

  /**
   * Retrieves the bad path from the @var badPath object, and formats it if needed to show in the warning tooltip
   * @param geoLayerId The geoLayerId used as the key in the @var badPath to find the correct layer's path
   */
  public getBadPath(geoLayerId: string): string {
    var splitPath = this.badPath[geoLayerId][1].split('/');
    for (let i in splitPath) {
      if (splitPath[i] === '..') {
        splitPath.splice(Number(i) - 1, 2);
      }
    }
    var formattedPath = '';

    for (let subPath of splitPath) {
      formattedPath += subPath + '/';
  }

    return formattedPath.substring(0, formattedPath.length - 1);
  }

  /**
   * @returns the chart template JSON file read earlier as an object
   */
  public getChartTemplateObject(): Object {
    return this.chartTemplateObject;
  }

  /**
   * Iterates through all menus and sub-menus in the application configuration file and
   * @returns the markdownFile (contentPage) path found there that matches the given geoLayerId
   * @param id The geoLayerId to compare with
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
  }

  /**
   * Goes through each geoMap, geoLayerViewGroup, and geoLayerView in a geoMapProject and returns the FIRST occurrence of a
   * background layer that has the selectedInitial property set to true, effectively getting the default background layer
   */
  public getDefaultBackgroundLayer(): string {
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (geoLayerViewGroup.properties.isBackground === 'true') {
          for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
            if (geoLayerView.properties.selectedInitial === 'true') {
              return geoLayerView.name;
            }
          }
        }
      }
    }
    return '';
  }

  /**
   * @returns an array of the three provided ExtentInitial numbers to be used for initial map creation.
   */
  public getExtentInitial(): number[] {
    // Make sure to do some error handling for incorrect input
    if (!this.mapConfig.geoMaps[0].properties.extentInitial) {
      console.error("Map Configuration property '" +
        this.mapConfig.geoMaps[0].properties.extentInitial +
        "' is incorrectly formatted. Confirm property is extentInitial." +
        "Setting ZoomLevel to '[0, 0], 0' for world-wide view")
      // Return a default array with all 0's so it's quite obvious the map created is not intended
      return [0, 0, 0];
    }
    var finalExtent: number[];
    let extentInitial: string = this.mapConfig.geoMaps[0].properties.extentInitial;
    let splitInitial: string[] = extentInitial.split(':');

    if (splitInitial[0] === 'ZoomLevel' && splitInitial[1].split(',').length !== 3)
      console.error("ZoomLevel inputs of " + splitInitial[1] +
      " is incorrect. Usage for a ZoomLevel property is 'ZoomLevel:Longitude, Latitude, Zoom Level'");

    try {
      // Try to convert all strings in the split array to numbers to return as a number array for the initial extent
      finalExtent = splitInitial[1].split(',').map(x => +x);
    } catch (e) {
      console.error(e.message);
      console.error('Latitude, Longitude and Zoom Level must all be integer or decimal numbers');
      console.error('Setting ZoomLevel to \'[0, 0], 0\' for world-wide view');
      return [0, 0, 0];
    }
    return finalExtent;
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
    for (let geoLayer of this.mapConfig.geoMaps[0].geoLayers) {
      if (geoLayer.geoLayerId == id) {
        return geoLayer.geometryType;
      }
    }
    return 'here';
  }

  /**
   * @returns the base path to the GeoJson files being used in the application. When prepended with the @var appPath,
   * shows the full path the application needs to find any GeoJson file
   */
  public getGeoJSONBasePath(): string {
    return this.geoJSONBasePath;
  }

  /**
   * @returns a geoLayer object in the geoMapProject whose geoLayerId matches the @param id
   * @param id The geoLayerId to be matched with
   */
  public getGeoLayerFromId(id: string): any {
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayer of geoMap.geoLayers) {
        if (geoLayer.geoLayerId === id) {
          return geoLayer;
        }
      }
    }
    return '';
  }

  /**
   * @returns a reversed array of all geoLayer objects in the geoMapProject
   */
  public getGeoLayers(): any[] {
    let geoLayers: any[] = [];
    this.mapConfig.geoMaps.forEach((geoMap: any) => {
      geoMap.geoLayers.forEach((geoLayer: any) => {
        if (!geoLayer.properties.isBackground || geoLayer.properties.isBackground === 'false') {
          geoLayers.push(geoLayer);
        }
      });
    });
    return geoLayers;
  }

  /**
   * @returns a reversed array of all geoLayerViewGroupId's in the geoMapProject. The array is reversed so when it's iterated
   * over, it will bring each one representing a map layer to the front of the map. This will ultimately put the layers in the
   * correct order with the first group on top, and subsequent groups below.
   */
  public getGeoLayerViewGroupIdOrder(): string[] {
    var allGeoLayerViewGroups: string[] = [];
    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (!geoLayerViewGroup.properties.isBackground || geoLayerViewGroup.properties.isBackground === 'false') {
          allGeoLayerViewGroups.push(geoLayerViewGroup.geoLayerViewGroupId);
        }
      }
    }
    return allGeoLayerViewGroups.reverse();
  }

  /**
   * @returns an array of eventHandler objects from the geoLayerView whose geoLayerId matches the given @param geoLayerId
   * @param geoLayerId The geoLayerId to match with
   */
  public getGeoLayerViewEventHandler(geoLayerId: string): any[] {

    var geoLayerViewGroups: any = this.mapConfig.geoMaps[0].geoLayerViewGroups;

    for (let geoLayerViewGroup of geoLayerViewGroups) {
      if (!geoLayerViewGroup.properties.isBackground || geoLayerViewGroup.properties.isBackground === 'false') {
        for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
          if (geoLayerView.geoLayerId === geoLayerId) {
            return geoLayerView.eventHandlers;
          }
        }
      }
    }
    return [];
  }

  /**
   * @returns the file path as a string obtained from a graph template file that shows where the graph data file can be found
   */
  public getGraphFilePath(): string {
    return this.graphFilePath;
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
   * @returns an array of the list of layer view groups from the app config file.
   * NOTE: This still uses geoMaps[0] and does not take into account more geoMaps in an app config file.
   */
  public getLayerGroups(): any[] {
    return this.mapConfig.geoMaps[0].geoLayerViewGroups;
  }

  /**
   * @returns the array of layer marker data, such as size, color, icon, etc.
   */
  public getLayerMarkerData(): void {
    return this.mapConfig.layerViewGroups;
  }

  /**
   * NOTE: This function is not currently being used, as it's being used by functions in map.component.ts that have
   * not been implemented yet.
   * @param id The given geoLayerId to match with
   */
  public getLayerFromId(id: string) {
    let dataLayers: any = this.mapConfig.dataLayers;
    let layer: any = null;
    dataLayers.forEach((l: any) => {
      if (l.geoLayerId === id) {
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

    var geoLayerViewGroups: any = this.mapConfig.geoMaps[0].geoLayerViewGroups;
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

  /**
   * @returns the entire @var mapConfig object obtained from the map configuration file. Essentially the geoMapProject.
   */
  public getMapConfig() {
    return this.mapConfig;
  }

  /**
   * @returns the relative path to the map configuration file for the application
   */
  public getMapConfigPath(): string {
    return this.mapConfigPath;
  }

  /**
   * @returns the name attribute to the FIRST geoMap in the geoMapProject
   */
  public getGeoMapName(): string {
    if (this.mapConfig) {
      if (this.mapConfig.geoMaps[0].name.length < 30) {
        return this.mapConfig.geoMaps[0].name;
      }
      else return this.mapConfig.geoMaps[0].name.substring(0, 30) + '...';
    }
  }

  public getOriginalFeatureStyle(): any { return this.originalFeatureStyle; }

  /**
   * @returns the upper level geoMapProject properties 
   */
  public getProperties(): {} {
    return this.mapConfig.properties;
  }

  /**
   * NOTE: This is not used at the moment, as refreshing the page is not an option. Maybe in the future
   * @param id The geoLayerId to match with
   */
  public getRefreshTime(id: string): string[] {
    return this.getLayerViewFromId(id).properties.refreshInterval.split(" ");
  }

  /**
   * @returns a geoLayerSymbol object from the geoLayerView whose geoLayerId matches with @param id
   * @param id The geoLayerId to match with
   */
  public getSymbolDataFromID(id: string): any {
    var geoLayerViewGroups: any = this.mapConfig.geoMaps[0].geoLayerViewGroups;
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

  /**
   * @returns all information before the first tilde (~) in the TSID from the graph template file. 
   */
  public getTSIDLocation(): string { return this.graphTSID; }

  public isBadPath(geoLayerId: string): boolean { 
    if (this.badPath) {
      return this.badPath[geoLayerId];
    } else return false;
  }

  /**
   * @returns a boolean describing if a button has been clicked once
   */
  public isClicked(): boolean {
    return this.clicked;
  }

  public isServerUnavailable(geoLayerId: string): boolean {
    if (this.serverUnavailable) {
      return this.serverUnavailable[geoLayerId];
    } else return false;
  }

  /**
   * Resets the @var clicked back to false when the Dialog has been closed
   */
  public resetClick(): void { this.clicked = false; }

  /**
   * Resets the @var mapConfigLayerOrder when a new map is created
   */
  public resetMapConfigLayerOrder(): void { this.mapConfigLayerOrder = []; }

  /**
   * Sets the globally used @var appConfig for access to the app's configuration settings
   * @param appConfig The entire application configuration read in from the app-config file as an object
   */
  public setAppConfig(appConfig: {}): void { this.appConfig = appConfig; }

  /**
   * Sets the @var clicked to true, after it has been clicked and a dialog has been opened
   */
  public setAsClicked(): void { this.clicked = true; }

  /**
   * Sets, or possibly creates the badPath object with the geo
   * @param geoLayerId The geoLayerId from the geoLayer where the bad path was set
   */
  public setBadPath(path: string, geoLayerId: string): void { this.badPath[geoLayerId] = [true, path]; }

  /**
   * Sets @var chartTemplateObject with the object read in from JSON graph template file
   * @param graphTemplateObject The graph template object obtained from the graph template file
   */
  public setChartTemplateObject(graphTemplateObject: Object): void {
    this.chartTemplateObject = graphTemplateObject;
  }

  /**
   * Sets the @var graphFilePath to the given path
   * @param path The path given in the graph template file TSID
   */
  public setGraphFilePath(path: string): void {
    this.graphFilePath = path;
  }

  /**
   * Sets the @var geoJSONBasePath to the correct relative path in the application
   * @param path The path to set to
   */
  private setGeoJSONBasePath(path: string): void {
    let splitPath: string[] = path.split('/');
    var finalPath: string = '';

    for (let i = 0; i < splitPath.length - 1; i++) {
      finalPath += splitPath[i] + '/';
    }
    this.geoJSONBasePath = finalPath;
  }

  /**
   * Sets the @var mapConfig to the object obtained from the map configuration file
   * @param mapConfig The entire map configuration object to set to
   */
  public setMapConfig(mapConfig: any): void {
    this.mapConfig = mapConfig;
  }

  /**
   * Iterates over each geoLayerViewGroup in the geoMap and pushes each geoLayerView's geoLayerId in the order they are given,
   * so the InfoMapper knows the order in which they should be draw on the Leaflet map.
   */
  public setMapConfigLayerOrder(): void {
    var layerArray: string[] = [];

    for (let geoMap of this.mapConfig.geoMaps) {
      for (let geoLayerViewGroup of geoMap.geoLayerViewGroups) {
        if (!geoLayerViewGroup.properties.isBackground || geoLayerViewGroup.properties.isBackground === 'false')
        for (let geoLayerView of geoLayerViewGroup.geoLayerViews) {
          layerArray.push(geoLayerView.geoLayerId);
        }
      }
    }
    // Reverse the array here, since we'll start on the layer that should be at the bottom, bring it to the front of Leaflet map,
    // move on to the layer that should be on top of the bottom layer, bring it to the front, and so on.
    layerArray = layerArray.reverse();
    // Get an instance of the singleton MapLayerManager class and set the mapConfigLayerOrder variable so it can be used to order
    // layers instead of the map service
    let mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
    mapLayerManager.setMapConfigLayerOrder(layerArray);
  }

  /**
   * Sets the @var mapConfigPath to the path to the map configuration file in the application
   * @param path The path to set to
   */
  public setMapConfigPath(path: string): void {
    this.mapConfigPath = path;
  }

  /**
   * Sets the @var originalFeatureStyle to the style object from the feature passed in.
   * @param style The style object of the feature to be saved
   */
  public setOriginalFeatureStyle(style: any): void { this.originalFeatureStyle = style; }

  /**
   * Sets the @var serverUnavailable with a key of @var id to true.
   * @param id The geoLayerId to compare to while creating the side bar
   */
  public setServerUnavailable(id: string): void { this.serverUnavailable[id] = true; }

  /**
   * Sets the @var graphTSID to the given tsid.
   * @param tsid The tsid to set to
   */
  public setTSIDLocation(tsid: string): void { this.graphTSID = tsid; }

}

/**
 * 
 */
export enum SaveFileType {
  dataTable,
  text,
  tstable
}