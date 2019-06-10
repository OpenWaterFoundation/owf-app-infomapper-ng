import { Component, Input }  from '@angular/core';

@Component({
  selector: 'map-layer-component',
  styleUrls: ['./map-layer.component.css'],
  templateUrl:'./map-layer.component.html'
})
export class MapLayerComponent {
    @Input() data: any;
    toggleLayer() {
      this.data.mapReference.toggleLayer(this.data.geolayerId);
    }
}
