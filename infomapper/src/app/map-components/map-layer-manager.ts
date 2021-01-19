import { MapLayerItem } from './map-layer-item';


/**
 * A helper singleton class for creating, managing and maintaining Leaflet maps in the Infomapper. The fact that it is singleton
 * is important.
 */
export class MapLayerManager {

  /**
   * The instance of this MapLayerManager object.
   */
  private static instance: MapLayerManager;
  /**
   * String array containing the geoLayerId of the reverse order each layer should be displayed in on the Leaflet map.
   */
  private mapConfigLayerOrder: string[];
  /**
   * The object to hold each MapLayerItem as the value, with the layer's geoLayerId as the key.
   */
  private mapLayers: {} = {};
  /**
   * The object with each geoLayerViewGroup in the geoMap as the key, and an array of all geoLayerId's in the geoLayerViewGroup
   * as the value.
   */
  private layerViewGroups: {} = {};

  /**
   * A private constructor is declared so any instance of the class cannot be created elsewhere, getInstance must be called
   */
  private constructor() { }

  /**
   * Only one instance of this MapLayerManager can be used at one time, making it a singleton Class.
   */
  public static getInstance(): MapLayerManager {
    if (!MapLayerManager.instance) { MapLayerManager.instance = new MapLayerManager(); }
    return MapLayerManager.instance;
  }

  /**
   * The initial adding of the layer to the @var mapLayers object, with the layer's geoLayerId as the key, and a new MapLayerItem
   * instance as the value
   * @param leafletLayer The leaflet layer to add to the map
   * @param geoLayer The geoMap geoLayer representing the layer added
   * @param geoLayerView The geoMap geoLayerView representing the layer added
   */
  public addLayerItem(leafletLayer: any, geoLayer: any, geoLayerView: any, geoLayerViewGroup: any, isRaster?: boolean): void {
    this.mapLayers[geoLayer.geoLayerId] = new MapLayerItem(leafletLayer, geoLayer, geoLayerView, geoLayerViewGroup, isRaster);
    // Add to the layerViewGroup object, with the geoLayerViewGroupId as the key, and push/create to/the array
    // with the geoLayerId as the value
    if ($.isEmptyObject(this.layerViewGroups) || !this.layerViewGroups[geoLayerViewGroup.geoLayerViewGroupId]) {
      let geoLayerIdArray: string[] = [geoLayer.geoLayerId];
      this.layerViewGroups[geoLayerViewGroup.geoLayerViewGroupId] = geoLayerIdArray;
    } else {
      this.layerViewGroups[geoLayerViewGroup.geoLayerViewGroupId].push(geoLayer.geoLayerId);
    }
    this.sortLayerViewGroups(geoLayerViewGroup.geoLayerViewGroupId)
  }

  /**
   * @returns The number of raster layers currently being shown on the Leaflet map.
   */
  public displayedRasterLayers(): number {
    // A counter that increments for every layer currently displayed on the map.
    var count = 0
    for (let id in this.mapLayers) {
      if (this.mapLayers[id].isDisplayedOnMainMap() === true && this.mapLayers[id].isRasterLayer()) {
        ++count;
      }
    }
    return count;
  }

  /**
   * @returns the MapLayerItem whose key matches the geoLayerId given, or null if not
   * @param geoLayerId The desired layer's geoLayerId
   */
  public getLayerItem(geoLayerId: string): MapLayerItem {
    return this.mapLayers[geoLayerId] ? this.mapLayers[geoLayerId] : null;
  }

  public getMapLayers(): any {
    return this.mapLayers;
  }

  /**
   * @returns A boolean whether a vector layer is currently displayed on the Leaflet @var mainMap.
   */
  public isVectorDisplayed(): boolean {

    for (let key of Object.keys(this.mapLayers)) {
      if (this.mapLayers[key].isVectorLayer() === true && this.mapLayers[key].isDisplayedOnMainMap() === true) {
        return true;
      }
    }
    return false;
  }

  /**
   * Prints out the @var mapLayers object.
   */
  public printMapLayers(): void {
    console.log(this.mapLayers);
  }

  /**
   * Resets each of the MapLayerManager's class variables, so when another map is created, they are using fresh new variables
   * without having to worry about them containing previous map information.
   */
  public resetMapLayerManagerVariables(): void {
    this.layerViewGroups = {};
    this.mapConfigLayerOrder = [];
    this.mapLayers = {};
  }

  /**
   * Looks at what layers are being shown on the current Leaflet map and renders them in the correct order. This should
   * be in the same order as each geoLayerView in the geoLayerViewGroups from top to bottom.
   * @param mapLayers An object with the geoLayerId as the key, and the layer added to the leaflet map as the value
   */
  public setLayerOrder() {
    // Iterate through the MapManager's mapConfigLayerOrder, and check to see if the geoLayerId is a key in the mapLayers object.
    // If it is, then bring that layer to the front of the map. Since we're going through backwards, the last layer will be
    // brought to the front first, and the first layer will be brought to the front last, which will give us the ordering we want
    for (let geoLayerId of this.mapConfigLayerOrder) {
      if (this.mapLayers[geoLayerId]) {
        this.mapLayers[geoLayerId].getItemLeafletLayer().bringToFront();
      }
    }
  }

  /**
   * Sets the @var mapConfigLayerOrder as the reversed array set in the map service with the order of geoLayerId's
   * @param mapConfigLayerOrder The string array of the order of layer geoLayerId's in reverse order
   */
  public setMapConfigLayerOrder(mapConfigLayerOrder: string[]): void {
    this.mapConfigLayerOrder = mapConfigLayerOrder;
  }

  /**
   * 
   */
  private sortLayerViewGroups(geoLayerViewGroupId: string): void {

    for (let geoLayerId of this.mapConfigLayerOrder) {
      for (let viewGroupGeoLayerID of this.layerViewGroups[geoLayerViewGroupId]) {
        if (geoLayerId === viewGroupGeoLayerID) {
          this.layerViewGroups[geoLayerViewGroupId]
          .push(this.layerViewGroups[geoLayerViewGroupId]
          .splice(this.layerViewGroups[geoLayerViewGroupId]
          .indexOf(viewGroupGeoLayerID), 1)[0]);
        }
      }
    }
  }

  /**
   * A toggle slider button has been clicked, and the geoLayerViewGroup it's a part of has the selectBehavior property set
   * to Single instead of the default 'Any'. 
   * @param mainMap The reference to the Leaflet map object
   */
  public toggleOffOtherLayersOnMainMap(geoLayerId: string, mainMap: any, geoLayerViewGroupId: string, first?: string): void {
    // Iterate over the array value from the layerViewGroups object, and if the geoLayerId is the geoLayerId of the layer that
    // needs to be turned on, skip it. Otherwise, retrieve the MapLayerItem object using the geoLayerId (ID), check if it's
    // currently being show on the map, and remove it if it is.
    for (let ID of this.layerViewGroups[geoLayerViewGroupId]) {
      if (ID === geoLayerId) {
        continue;
      }
      let layerItem = this.getLayerItem(ID);
      if (layerItem.isDisplayedOnMainMap() === true) {
        layerItem.removeItemLeafletLayerFromMainMap(mainMap);
      }
    }
    // When a layer is first put on the map, check to see if it's the first layer that needs to be 
    if (first) {

      var selectedArray: boolean[] = [];
      for (let ID of this.layerViewGroups[geoLayerViewGroupId]) {
        if (this.getLayerItem(ID).isSelectInitial()) {
          selectedArray.push(true);
        } else {
          selectedArray.push(false);
        }
      }
      // If all layers are true for selectedInitial, or they're not given, perform the default of showing the top-most layer
      if (selectedArray.every(Boolean)) {
        var firstLayerGeoLayerId = this.layerViewGroups[geoLayerViewGroupId][this.layerViewGroups[geoLayerViewGroupId].length - 1];
        if (geoLayerId !== firstLayerGeoLayerId) {
          let layerItem = this.getLayerItem(firstLayerGeoLayerId);
          layerItem.addItemLeafletLayerToMainMap(mainMap);
  
          this.toggleOffOtherLayersOnMainMap(firstLayerGeoLayerId, mainMap, geoLayerViewGroupId);
        }
      }
      // If some layers are specifically marked false, show the top-most true layer
      else {
        for (let bool of selectedArray) {
          if (bool === true) {
            let indexOfBool = selectedArray.indexOf(bool);
            var layerGeoLayerId = this.layerViewGroups[geoLayerViewGroupId][indexOfBool];
            let layerItem = this.getLayerItem(layerGeoLayerId);
            layerItem.addItemLeafletLayerToMainMap(mainMap);
  
          }
        }
      }
      
    }
    
  }

}

