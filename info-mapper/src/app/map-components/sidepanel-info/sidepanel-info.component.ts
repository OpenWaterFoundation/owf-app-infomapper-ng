import { Component, Input } from '@angular/core';

import { MapService }       from '../map.service';

@Component({
  selector: 'side-panel-info-component',
  templateUrl: './sidepanel-info.component.html',
  styleUrls: ['./sidepanel-info.component.css']
})
export class SidePanelInfoComponent {
  @Input() properties: any;
  @Input() appVersion: any;
  @Input() projectVersion: any;

  constructor(private mapService: MapService) { }

  ngOnInit(): void {
    // Set the projectVersion class variable to an Observable that contains what was received
    // from the version.json file. The template will then use the async pipe to subscribe to it
    // and display the version.
    this.projectVersion = this.mapService.getJSONData('assets/version.json');
  }
}
