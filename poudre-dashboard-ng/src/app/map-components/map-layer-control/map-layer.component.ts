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

    ngOnInit(){
      this.symbol = this.layerViewConfiguration.symbol;
    }

    toggleLayer() {
      let geolayerId: string = this.layerData.geolayerId;
      this.mapReference.toggleLayer(geolayerId);
    }
}
