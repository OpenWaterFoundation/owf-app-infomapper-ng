import { Injectable }                   from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { Router }                       from '@angular/router';

import { catchError }                   from 'rxjs/operators';

import { Observable, of }               from 'rxjs';

import { BackgroundLayerComponent }     from './background-layer-control/background-layer.component';
import { BackgroundLayerItemComponent } from './background-layer-control/background-layer-item.component';
import { MapLayerComponent }            from './map-layer-control/map-layer.component';
import { MapLayerItemComponent }        from './map-layer-control/map-layer-item.component';

@Injectable({ providedIn: 'root' })
export class MapService {

  layerArray: MapLayerItemComponent[] = [];
  backgroundLayerArray: BackgroundLayerItemComponent[] = [];
  mapConfigFile: any;

  constructor(private http: HttpClient, private router: Router) { }
  
  // Set the .json configuration file
  public setMapConfigFile(mapConfigFile: any): void {
    this.mapConfigFile = mapConfigFile;
  }

  // Read data from a json file
  public getJSONdata(path: string): Observable<any> {
    return this.http.get<any>(path)
    .pipe(
      catchError(this.handleError<any>(path))
    );
  }

  // Get the background layers for the map
  public getBackgroundLayers(): any[] {
    let backgroundLayers: any[] = [];
    this.mapConfigFile.geoMaps[0].geoLayers.forEach((geoLayer: any) => {
      if (geoLayer.properties.background == 'true')
        backgroundLayers.push(geoLayer);
    });
    return backgroundLayers
  }

  // Return the boolean to add a leaflet background layers control or not
  public getBackgroundLayersMapControl(): boolean {
    return true;
  }

  // Return an array containing the information for how to center the map.
  public getCenter(): number[] {
    return JSON.parse(this.mapConfigFile.geoMaps[0].properties.center);
  }

  // Get default background layer
  public getDefaultBackgroundLayer(): string {
    let defaultLayer: string = '';
    this.mapConfigFile.geoMaps[0].geoLayerViewGroups.forEach((viewGroup: any) => {
      if (viewGroup.properties.background == 'true') {
        viewGroup.geoLayerViews.forEach((layerView: any) => {
          if (layerView.properties.selectedInitial == 'true')
            defaultLayer = layerView.geoLayerId;
        });
      }
    });
    return defaultLayer;
  }

  // Returns an array of layer file names from the json config file.
  public getDataLayers(): any[] {
    let dataLayers: any[] = [];
    this.mapConfigFile.geoMaps.forEach((geoMap: any) => {
      geoMap.geoLayers.forEach((geoLayer: any) => {
        if (geoLayer.properties.background == 'false')
          dataLayers.push(geoLayer);
      });
    });
    return dataLayers;
  }

  // Return an array of the list of layer view groups from config file.
  public getLayerGroups(): any[] {
    return this.mapConfigFile.geoMaps[0].geoLayerViewGroups
  }

  // Returns variable with config data
  public getLayers() {
    return this.layerArray;
  }

  // Get the array of layer marker data, such as size, color, icon, etc.
  public getLayerMarkerData() : void {
    return this.mapConfigFile.layerViewGroups;
  }

  public getLayerViewFromId(id: string) {
    var layerViews: any;
    layerViews = this.mapConfigFile.geoMaps[0].geoLayerViewGroups[0].geoLayerViews;

    var layerView: any = null;
    for (let lvg of layerViews) {
      if (lvg.geoLayerId == id) {
        layerView = lvg;
        break;
      }
    }
    return layerView;
  }

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

  public getName(): string {
    if (this.mapConfigFile.name) return this.mapConfigFile.name;
  }

  public getProperties(): {} {
    return this.mapConfigFile.properties;
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

  public getLayerViewUIEventHandlers() {
    // if (this.mapConfigFile.layerViewUIEventHandlers) {
    //   return this.mapConfigFile.layerViewUIEventHandlers ? this.mapConfigFile.layerViewUIEventHandlers : [];
    // } else if (this.mapConfigFile.geoLayerViewEventHandlers) {
    //   return this.mapConfigFile.geoLayerViewEventHandlers ? this.mapConfigFile.geoLayerViewEventHandlers : [];
    // }
    return this.mapConfigFile.layerViewUIEventHandlers ? this.mapConfigFile.layerViewUIEventHandlers : [];
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

  public getRefreshTime(id: string): string[] {
    return this.getLayerViewFromId(id).properties.mapRefresh.split(" ");
  }

  public getSymbolDataFromID(id: string): any {
    var layerviews: any;
    var layerviewRet: any;

    layerviews = this.mapConfigFile.geoMaps[0].geoLayerViewGroups[0].geoLayerViews;      
    for (let layerview of layerviews) {
      if (layerview.geoLayerId == id) {
        layerviewRet = layerview.geoLayerSymbol;
      }
    }
    return layerviewRet;
  }

  /**
   * Return an array containing zoom data from the config file
   * zoomInfo[0] = initialExtent
   * zoomInfo[1] = minimumExtent
   * zoomInfo[2] = maximumExtent
   */
  public getZoomInfo(): number[] {
    let zoomInfo: number[] = [];
    var properties: any;
    // Testing for new or old config file. This try catch tries the new first, because
    // the new also has mapConfigFile.properties, which won't be given the correct zoom
    properties = this.mapConfigFile.geoMaps[0].properties;
    zoomInfo.push(parseInt(properties.extentInitial));
    zoomInfo.push(parseInt(properties.extentMinimum));
    zoomInfo.push(parseInt(properties.extentMaximum));

    return zoomInfo;
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
}
