import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

@Component({
    //selector: 'side-panel-info-component',
    template: `
    <div>
        <h2> Hello World! </h2>
    </div>
    `
})
export class SidePanelInfoComponent {
    @Input() properties: any;
}
