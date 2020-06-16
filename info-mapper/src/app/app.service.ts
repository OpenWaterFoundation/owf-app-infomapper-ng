import { Injectable } from '@angular/core';

import { MapService } from './map-components/map.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(public mapService: MapService) { }


  public setLayerOrder(mainMap: any, L: any) {    

    var layerGroupArray: any[] = [];
    var groupOrder: string[] = this.mapService.getGeoLayerViewGroupIdOrder();
    
    var drawOrder: Object[] = this.mapService.getLayerOrder();
    // console.log(JSON.parse(JSON.stringify(drawOrder)));

    // If there is only one layer, we don't care about when; It doesn't matter
    if (drawOrder.length === 1) return;

    // Go through each layerGroup in the leaflet map and add it to the
    // layerGroupArray so we can see the order in which layers were drawn
    mainMap.eachLayer((layerGroup: any) => {
      if (layerGroup instanceof L.LayerGroup) {
        layerGroupArray.push(layerGroup);        
      }  
    });    

    for (let viewGroupId of groupOrder) {
      var groupSize = 0;
      for (let layer of drawOrder) {
        groupSize++;
      }
      var currentMax = -999;

      for (let i = 0; i < drawOrder.length; i++) {
        if (drawOrder[i][viewGroupId] > currentMax) {
          currentMax = drawOrder[i][viewGroupId];
        }          
      }
      
      while (currentMax >= 0) {

        for (let i = 0; i < drawOrder.length; i++) {          
          if (drawOrder[i][viewGroupId] === currentMax) {
            layerGroupArray[i].bringToFront();
            break;
          }
        }
        currentMax--;
      }
    }
  }

  // This was the old way of changing map layers to be in the correct order. The
  // code will be kept around until I'm (Josh) convinced the new code works completely.
  public x_setLayerOrder() {

    // setTimeout(() => {

    //   var layerGroupArray: any[] = [];
    //   var groupOrder: string[] = this.mapService.getGeoLayerViewGroupIdOrder();
    //   var drawOrder: Object[] = this.mapService.getLayerOrder();

    //   // Go through each layerGroup in the leaflet map and add it to the
    //   // layerGroupArray so we can see the order in which layers were drawn
    //   this.mainMap.eachLayer((layerGroup: any) => {
    //     if (layerGroup instanceof L.LayerGroup)
    //       layerGroupArray.push(layerGroup);
    //   });

    //   for (let viewGroupId of groupOrder) {
    //     var groupSize: number = -1;
    //     for (let layer of drawOrder) {
    //       if (layer[viewGroupId] != undefined) {
    //         groupSize += 1;
    //       }            
    //     }
        
    //     while (groupSize >= 0) {
    //       for (let i = 0; i <= drawOrder.length - 1; i++) {                         
    //         if (drawOrder[i][viewGroupId] != 'undefined' &&
    //             drawOrder[i][viewGroupId] == groupSize &&
    //             drawOrder[i][viewGroupId] >= 0) {
              
    //           layerGroupArray[i].bringToFront();
    //           drawOrder[i][viewGroupId] = -1;
    //           groupSize--;
    //         }
    //       }
    //     }
    //   }
    //   this.mapService.resetLayerOrder();
    // }, 1500);
  }

}
