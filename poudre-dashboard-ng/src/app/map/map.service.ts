import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { LayerComponent } from './layer.component';
import { layerItem } from './layer-item';

var layerArray = [];

@Injectable()

export class mapService {

  mapReference;

  //save a reference to the map component and pass it to layerItem so that
  //a layer toggle switch in the sidebar can call the toggle function inside
  //the ngOnInIt for map Component, changing the leaflet map
  saveMapReference( app : any) {
    this.mapReference = app;
  }

  //saves config data in variable
  saveLayerConfig (tsfile) {
    for (var i = 0; i < tsfile.layers.length; i++){

      layerArray.push(new layerItem(LayerComponent, {mapReference: this.mapReference, displayName: tsfile.layers[i].displayName, name: tsfile.layers[i].name, description: tsfile.layers[i].description}));

    }
  }

  //returns variable with config data
  getLayers() {
    return layerArray;
  }

}
