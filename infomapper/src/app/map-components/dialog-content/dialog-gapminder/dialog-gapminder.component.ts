/**
 * 1. Clone viz repo
 * 2. Copy gapminder-js folder under dialog-gapminder/
 * 3. Change/Update all gapminder-js component files with this Dialog Component files.
 * 4. Update the name of the GeneralGapminderJsComponent to the name of this component.
 * 5. Change/Update any necessary imports.
 */

import { AfterViewInit,
          Component}            from '@angular/core';

import { WindowManager }        from '../../window-manager.js';

// reference to JS functions
// reference to JS functions
import * as gapminderv4         from './gapminder-js/js/gapminder-4.0.0.js';
import * as display             from './gapminder-js/js/gapminder-util/display-data.js';


// Define gapminder configuration 
let configurationFile = "assets/app/data-maps/gapminder-data/viz-config.json";
// '../gapminder-js/gapminder-data/viz-config.json';


@Component({
  selector: 'app-dialog-gapminder',
  templateUrl: './dialog-gapminder.component.html',
  styleUrls: ['./dialog-gapminder.component.css']
})
export class DialogGapminderComponent implements AfterViewInit {

  // Define gapminder Ref for function calls in template
  public gapminderRef = gapminderv4;

  constructor() { 
  }

  ngAfterViewInit(): void {
     // Get the element id="defaultOpen" and click for default option 
    document.getElementById("defaultOpen").click();

    // // set configuration file 
    // gapminderv4.setGapminderConfig("assets/gapminder-data/viz-config.json")

    // call gapminder js functionality 
    gapminderv4.gapminder('assets/app/data-maps/gapminder-data/viz-config.json');
    // gapminderv4.gapminder('./gapminder-data/viz-config.json');


  }

  public dataLoaded = false;
  public gapminderSelected = true;

  /*Opens and displays div selected by tabs*/
  openTab(evt, name) {

    if(name == "Gapminder"){
      this.gapminderSelected = true;
    }else{
      this.gapminderSelected = false;
    }
    if(name == "Data" && !this.dataLoaded){
      display.displayData(configurationFile);
      this.dataLoaded = true;
    }
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      document.getElementById(name).style.display = "block";
      evt.currentTarget.className += " active";

  }

 
}
