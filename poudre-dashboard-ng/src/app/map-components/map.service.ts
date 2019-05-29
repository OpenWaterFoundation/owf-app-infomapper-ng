import { Injectable }          from '@angular/core';

import { LayerComponent }      from './layer/layer.component';
import { LayerItemComponent }  from './layer/layer-item.component';

@Injectable()
export class MapService {

  layerArray: LayerItemComponent[] = [];

  mapReference;
  tsfile: any;
  mapConfigFile: any;

  // Clear the layer array
  clearLayerArray(){
    this.layerArray = [];
  }

  //save a reference to the map component and pass it to layerItem so that
  //a layer toggle switch in the sidebar can call the toggle function inside
  //the ngOnInIt for map Component, changing the leaflet map
  saveMapReference( app : any) {
    this.mapReference = app;
  }

  //saves config data in variable
  saveLayerConfig () {
    for (var i = 0; i < this.tsfile.layers.length; i++){
      this.layerArray.push(new LayerItemComponent(LayerComponent, 
        {
          mapReference: this.mapReference, 
          displayName: this.tsfile.layers[i].displayName, 
          name: this.tsfile.layers[i].name, 
          description: this.tsfile.layers[i].description,
          geolayerId: this.tsfile.layers[i].geolayerId
        }));
    }
  }

  // Set the ts file 
  setTSFile(tsfile: any): void{
    this.tsfile = tsfile
  }

  // Set the .json configuration file
  setMapConfigFile(mapConfigFile: any): void {
      this.mapConfigFile = mapConfigFile;
  }

  // return an array containing the information for how to center the map.
  getCenter(): number[] {
    return this.mapConfigFile.properties.center;
  }

  getRefreshTime(id: string): string[] {
    return this.getLayerViewFromId(id).mapRefresh.split(" ");
  }

  //returns an array of layer file names from the json config file.
  getLayerFiles() : any[] {
    return this.mapConfigFile.layers;
  }

  // return an array of the list of layer view groups from config file.
  getLayerGroups(): any[] {
    return this.mapConfigFile.layerViewGroups[0].layerViews;
  }

  //returns variable with config data
  getLayers() {
    return this.layerArray;
  }

  // Get the array of layer marker data, such as size, color, icon, etc.
  getLayerMarkerData() : void {
    return this.mapConfigFile.layerViewGroups;
  }

  getLayerViewFromId(id: string) {
    let layerViews: any = this.mapConfigFile.layerViewGroups[0].layerViews;
    let layerView: any = null;
    layerViews.forEach((lv) => {
      if(lv.layerId == id){
        layerView = lv;
      }
    })
    return layerView;
  }

  getLayerFromId(id: string){
    let layers: any = this.mapConfigFile.layers;
    let layer: any = null;
    layers.forEach((l) => {
      if(l.geolayerId == id){
        layer = l;
      }
    })
    return layer;
  }

  getName(): string {
    return this.mapConfigFile.properties.name;
  }

  getProperties(): {} {
    return this.mapConfigFile.properties;
  }

  getMouseoverFromId(id: string): {} {
    let mouseover: any;
    let layerView: any = this.getLayerViewFromId(id)
    if(layerView.onMouseover != null){
      mouseover = layerView.onMouseover;
    }else{
      mouseover = {
        "action":"",
        "properties":""
      }
    }
    return mouseover;
  }

  getOnClickFromId(id: string): {} {
    let onClick: any;
    let layerView: any = this.getLayerViewFromId(id);
    if(layerView.onClick != null){
      onClick = layerView.onClick;
    }else{
      onClick = {
        "action": "",
        "properties": ""
      }
    }
    return onClick;
  }

  getLayerViewUIEventHandlers(){
    return this.mapConfigFile.layerViewUIEventHandlers ? this.mapConfigFile.layerViewUIEventHandlers : [];
  }

  getLayerViewUIEventHandlersFromId(id: string){
    let layerViewUIEventHandlers: any = this.mapConfigFile.layerViewUIEventHandlers;
    let returnHandlers: any[] = [];
    if (layerViewUIEventHandlers){
      layerViewUIEventHandlers.forEach((handler) => {
        if(handler.layerViewId == id){
          returnHandlers.push(handler);
        }
      })
    }
    return returnHandlers;
  }

  getSymbolDataFromID(id: string): any {
    let layerviews = this.mapConfigFile.layerViewGroups[0].layerViews;
    let layerviewRet = null;
    layerviews.forEach(function(layerview){
      if (layerview.layerId == id){
        layerviewRet = layerview.symbol;
      }
    })
    return layerviewRet;
  }

  // return an array containing zoom data from config file
  // zoomInfo[0] = initialExtent
  // zoomInfo[1] = minimumExtent
  // zoomInfo[2] = maximumExtent
  getZoomInfo(): number[] {
    let zoomInfo: number[] = [];
    let properties: any = this.mapConfigFile.properties;
    zoomInfo.push(properties.initialExtent);
    zoomInfo.push(properties.minimumExtent);
    zoomInfo.push(properties.maximumExtent);
    return zoomInfo;
  }

}
