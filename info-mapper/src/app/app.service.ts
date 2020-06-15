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
    console.log(JSON.parse(JSON.stringify(groupOrder)));
    
    var drawOrder: Object[] = this.mapService.getLayerOrder();
    console.log(JSON.parse(JSON.stringify(drawOrder)));


    // // Go through each layerGroup in the leaflet map and add it to the
    // // layerGroupArray so we can see the order in which layers were drawn
    // mainMap.eachLayer((layerGroup: any) => {
    //   if (layerGroup instanceof L.LayerGroup)
    //     layerGroupArray.push(layerGroup);
    // });

    // for (let viewGroupId of groupOrder) {
    //   var groupSize: number = -1;
    //   for (let layer of drawOrder) {
    //     if (layer[viewGroupId] != undefined) {
    //       groupSize += 1;
    //     }            
    //   }
      
    //   while (groupSize >= 0) {
    //     for (let i = 0; i <= drawOrder.length - 1; i++) {                         
    //       if (drawOrder[i][viewGroupId] != 'undefined' &&
    //           drawOrder[i][viewGroupId] == groupSize &&
    //           drawOrder[i][viewGroupId] >= 0) {
            
    //         layerGroupArray[i].bringToFront();
    //         drawOrder[i][viewGroupId] = -1;
    //         groupSize--;
    //       }
    //     }
    //   }
    // }
    // this.mapService.resetLayerOrder();
  }

}
