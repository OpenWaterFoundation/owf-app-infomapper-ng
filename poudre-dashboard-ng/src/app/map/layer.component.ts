import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

@Component({

  styleUrls: ['./map.component.css'],

  template: `
  <tr>
    <td class="name">Source Water Route Framework<div class="description">The Source Water Route Framework was developed by the Colorado Division of Water Resources and derived from the National Hydrography Dataset (NHD). The SWRF represents most streams in Colorado, in particular those with water rights or other important features.</div></td>
    <td class="toggle">
      <label class="switch">
        <input type="checkbox" checked (click)="toggleLayer('swrf')" id="swrf">
        <span class="slider round"></span>
      </label>
    </td>
  </tr>
  `
})
export class LayerComponent {
  @Input() data: any;

}
