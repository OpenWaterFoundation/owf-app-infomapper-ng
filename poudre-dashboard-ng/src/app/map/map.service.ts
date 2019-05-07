import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { LayerComponent } from './layer.component';
import { layerItem } from './layer-item';

var layerArray = [];

@Injectable()

export class mapService {

  //saves config data in variable
  saveLayerConfig (tsfile) {
    for (var i = 0; i < tsfile.layers.length; i++){

      //layerArray.push(new layerItem(LayerComponent, {name: tsfile.layers[i].name}));

    }
  }

  //returns variable with config data
  getLayers() {
    return layerArray;
  }

}
