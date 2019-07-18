import { Component, Input, OnInit }  from '@angular/core';

@Component({
  selector: 'map-layer-component',
  styleUrls: ['./map-layer.component.css'],
  templateUrl:'./map-layer.component.html'
})
export class MapLayerComponent implements OnInit{
    // Information about the layer from the configuration file such as description, or display name
    // Initialized in map.component.ts
    layerData: any;
    // Information linking the layer to the layer display
    // Initialized in map.component.ts
    layerViewConfiguration: any;
    // The data for the symbol such as color and size.
    symbol: any;
    // A reference to the main map component
    mapReference: any;

    // /**
    // * Used to hold names of the data classified as 'singleSymbol'. Will be used for the map legend/key.
    // * @type {string[]}
    // */
    // singleSymbolKeyNames = [];
    // /**
    // * Used to hold colors of the data classified as 'singleSymbol'. Will be used for the map legend/key.
    // * @type {string[]}
    // */
    // singleSymbolKeyColors = [];
    // /**
    // * Used to hold names of the data classified as 'categorized'. Will be used for the map legend/key.
    // * @type {string[]}
    // */
    // categorizedKeyNames = [];
    // /**
    // * Used to hold colors of the data classified as 'categorized'. Will be used for the map legend/key.
    // * @type {string[]}
    // */
    // categorizedKeyColors = [];
    // categorizedClassificationField = [];
    // /**
    // * Used to hold the name of the data classified as 'graduated'. Will be used for the map legend/key.
    // * @type {string[]}
    // */
    // graduatedKeyNames = [];
    // /**
    // * Used to hold colors of the data classified as 'graduated'. Will be used for the map legend/key.
    // * @type {string[]}
    // */
    // graduatedKeyColors = [];

    // graduatedClassificationField = [];

    ngOnInit(){
      this.symbol = this.layerViewConfiguration.symbol;
    }

    toggleLayer() {
      let geolayerId: string = this.layerData.geolayerId;
      this.mapReference.toggleLayer(geolayerId);
    }

}
