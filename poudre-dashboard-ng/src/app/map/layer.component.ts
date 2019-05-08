import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

@Component({

  styleUrls: ['./map.component.css'],

  template: `
  <tr>
    <td class="name">

      {{data.displayName}}

      <div class="description">{{data.description}}</div>

    </td>
    <td class="toggle">
      <label class="switch">

        <input type="checkbox" checked (click)="toggleLayer()" id="swrf">
        <span class="slider round"></span>
      </label>
    </td>
  </tr>
  `
})
export class LayerComponent {
  @Input() data: any;

    toggleLayer() {
      this.data.mapReference.toggleLayer(this.data.name);
    }

}
