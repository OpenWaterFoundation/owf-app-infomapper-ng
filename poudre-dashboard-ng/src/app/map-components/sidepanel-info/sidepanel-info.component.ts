import { Component, Input }  from '@angular/core';
import { Type } from '@angular/core';

@Component({
    selector: 'side-panel-info-component',
    templateUrl: './sidepanel-info.component.html',
    styleUrls: ['./sidepanel-info.component.css']
})
export class SidePanelInfoComponent {
    @Input() properties: any;
}
