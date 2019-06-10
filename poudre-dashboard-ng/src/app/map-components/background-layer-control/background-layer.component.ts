import { Component, Input }  from '@angular/core';

@Component({
  selector: 'background-layer-component',
  styleUrls: ['./background-layer.component.css'],
  templateUrl:'./background-layer.component.html'
})
export class BackgroundLayerComponent {
    @Input() data: any;
    checked: boolean = false;
    selectBackgroundLayer() {
      this.data.mapReference.selectBackgroundLayer(this.data.name);
    }
}
