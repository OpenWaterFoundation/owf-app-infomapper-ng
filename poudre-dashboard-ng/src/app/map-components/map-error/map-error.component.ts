import { Component, OnInit }  from '@angular/core';

@Component({
  selector: `map-error`,
  styleUrls: ['./map-error.component.css', '../map.component.css'],
  templateUrl: `./map-error.component.html`
})
export class MapErrorComponent implements OnInit{
    constructor() { }
    ngOnInit() {
      console.log("Map Error Component.")
    }
}
