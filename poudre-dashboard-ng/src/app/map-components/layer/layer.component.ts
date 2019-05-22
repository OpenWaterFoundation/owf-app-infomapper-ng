import { Component, Input }  from '@angular/core';

@Component({
  selector: 'layer-component',
  styleUrls: ['./layer.component.css'],
  templateUrl:'./layer.component.html'
})
export class LayerComponent {
    @Input() data: any;
    toggleLayer() {
      this.data.mapReference.toggleLayer(this.data.geolayerId);
    }
}
