import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { MapService } from './map-components/map.service';

@Injectable({ providedIn: 'root' })
export class AppService {

  FAVICON_SET = false;
  faviconPath: string;
  defaultFaviconPath = 'assets/app-default/img/OWF-Logo-Favicon-32x32.ico';

  constructor(public mapService: MapService,
              private http: HttpClient) { }


  public getDefaultFaviconPath(): string { return this.defaultFaviconPath }

  public getFavicon(): boolean { return this.FAVICON_SET; }

  public getFaviconPath(): string {
    if (this.faviconPath.startsWith('/')) {
      return this.faviconPath.substring(1);
    } else return this.faviconPath;
  }

  public setFaviconTrue(): void { this.FAVICON_SET = true; }

  public setFaviconPath(path: string): void { this.faviconPath = path; }

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
      var currentMax = Number.MIN_SAFE_INTEGER;

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
