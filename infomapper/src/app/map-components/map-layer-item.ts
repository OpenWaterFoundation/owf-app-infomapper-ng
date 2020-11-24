/**
 * A class that holds Leaflet and geoMapProject layer information and data. 
 */
export class MapLayerItem {

  private addedToMainMap = false;
  private displayed = false;
  private layerItemGeoLayerId: string;
  private layerItemViewGroupId: string;
  private leafletLayer: any;
  private selectBehavior: string;
  private selectInitial: boolean;


  constructor(leafletLayer: any, geoLayer: any, geoLayerView: any, geoLayerViewGroup: string) {
    this.init(leafletLayer, geoLayer, geoLayerView, geoLayerViewGroup);
  }


  /**
   * Adds the Leaflet layer from this layer item back onto the Leaflet map, set the @var displayed to true, hides both the
   * layer's description and symbol, and turns the slide toggle from off to checked
   * @param mainMap The reference to the Leaflet map object
   */
  public addItemLeafletLayerToMainMap(mainMap: any): void {
    mainMap.addLayer(this.leafletLayer);
    this.displayed = true;

    (<HTMLInputElement>document.getElementById(this.layerItemGeoLayerId + "-slider")).checked = true;
    let description = $("#description-" + this.layerItemGeoLayerId);
    description.css('visibility', 'visible');
    description.css('height', '100%');
    let symbols = $("#symbols-" + this.layerItemGeoLayerId);
    symbols.css('visibility', 'visible');
    symbols.css('height', '100%');
  }

  /**
   * @returns this MapLayerItem's geoLayerViewGroupId that it came from
   */
  public getItemGeoLayerViewGroupId(): string {
    return this.layerItemViewGroupId;
  }

  /**
   * @returns this MapLayerItem's Leaflet layer
   */
  public getItemLeafletLayer(): any {
    return this.leafletLayer;
  }

  public getItemSelectBehavior(): string {
    return this.selectBehavior;
  }

  /**
   * Initializes and assigns the necessary variables for the MapLayerItem creation set up
   * @param leafletLayer The leaflet layer for the Leaflet map
   * @param geoLayer This layer's geoLayer from the geoMap
   * @param geoLayerView This layer's geoLayerView from the geoMap
   */
  private init(leafletLayer: any, geoLayer: any, geoLayerView: any, geoLayerViewGroup: any): void {
    this.leafletLayer = leafletLayer;
    if (geoLayerView.properties.selectedInitial === undefined || geoLayerView.properties.selectedInitial === 'true') {
      this.selectInitial = true;
    } else if (geoLayerView.properties.selectedInitial === 'false') {
      this.selectInitial = false;
    }
    this.layerItemViewGroupId = geoLayerViewGroup.geoLayerViewGroupId;
    this.layerItemGeoLayerId = geoLayer.geoLayerId;

    if (geoLayerViewGroup.properties.selectBehavior) {
      this.selectBehavior = geoLayerViewGroup.properties.selectBehavior;
    } else {
      this.selectBehavior = 'Any';
    }
  }

  /**
   * Add the leaflet layer to the Leaflet map for the first time, doing the initializing step of setting the @var addedToMainMap
   * to true
   * @param mainMap The reference to the Leaflet map object
   */
  public initItemLeafletLayerToMainMap(mainMap: any): void {
    if (this.leafletLayer.rasters) {
      this.leafletLayer.setZIndex(999);
    }
    this.leafletLayer.addTo(mainMap);
    this.addedToMainMap = true;
    this.displayed = true;

    (<HTMLInputElement>document.getElementById(this.layerItemGeoLayerId + "-slider")).checked = true;
    let description = $("#description-" + this.layerItemGeoLayerId);
    description.css('visibility', 'visible');
    description.css('height', '100%');
    let symbols = $("#symbols-" + this.layerItemGeoLayerId);
    symbols.css('visibility', 'visible');
    symbols.css('height', '100%');
  }

  /**
   * @returns whether this layer item has been added to the Leaflet map for the first time
   */
  public isItemAddedToMainMap(): boolean {
    return this.addedToMainMap;
  }

  /**
   * @returns whether this layer item is currently being displayed on the Leaflet map
   */
  public isItemDisplayedOnMainMap(): boolean {
    return this.displayed;
  }

  /**
   * @returns whether this layer item has the selectedInitial property set to true (undefined is defaulted to true) or false
   */
  public isSelectInitial(): boolean {
    return this.selectInitial;
  }

  /**
   * Removes the Item Leaflet layer from the Leaflet map, sets the @var displayed to false, hides the description and symbol
   * of the layer in the side bar, and toggles the slide toggle button from checked to off
   * @param mainMap The reference to the Leaflet map object
   */
  public removeItemLeafletLayerFromMainMap(mainMap: any): void {
    mainMap.removeLayer(this.leafletLayer);
    this.displayed = false;

    (<HTMLInputElement>document.getElementById(this.layerItemGeoLayerId + "-slider")).checked = false;
    let description = $("#description-" + this.layerItemGeoLayerId);
    description.css('visibility', 'hidden');
    description.css('height', 0);
    let symbols = $("#symbols-" + this.layerItemGeoLayerId);
    symbols.css('visibility', 'hidden');
    symbols.css('height', 0);
  }

}