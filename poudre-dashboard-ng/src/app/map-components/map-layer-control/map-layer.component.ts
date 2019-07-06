import { Component, Input, OnInit }  from '@angular/core';

@Component({
  selector: 'map-layer-component',
  styleUrls: ['./map-layer.component.css'],
  templateUrl:'./map-layer.component.html'
})
export class MapLayerComponent implements OnInit{
    @Input() data: any;
    @Input() layerView: any;
    symbol: any = null;
    ngOnInit(){
      this.symbol = this.layerView.symbol;
      console.log(this.symbol);
    }

    toggleLayer() {
      this.data.mapReference.toggleLayer(this.data.geolayerId);
    }
}
