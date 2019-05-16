import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

@Component({
    //selector: 'side-panel-info-component',
    template: `
    <div id="information-tab">
        <h4> {{properties.name}} </h4>
        <p> {{properties.description}} </p>
    </div>
    `,
    styleUrls: ['./map.component.css']
})
export class SidePanelInfoComponent {
    @Input() properties: any;
}
