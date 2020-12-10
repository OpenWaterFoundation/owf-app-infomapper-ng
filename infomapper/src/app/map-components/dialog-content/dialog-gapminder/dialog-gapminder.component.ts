/**
 * 1. Clone viz repo
 * 2. Copy gapminder-js/css and gapminder-js/js folder under dialog-gapminder/
 * 3. Change/Update all gapminder-js component files with this Dialog Component files.
 * 4. Update the name of the GeneralGapminderJsComponent to the name of this component.
 * 5. Change/Update any necessary imports.
 */
import { AfterViewInit,
          Inject,
          Component }    from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { WindowManager } from '../../window-manager.js';
// reference to JS functions
// reference to JS functions
import * as gapminderv4 from './gapminder-js/js/gapminder-4.0.0.js';
import * as display from './gapminder-js/js/gapminder-util/display-data.js';


@Component({
  selector: 'app-dialog-gapminder',
  templateUrl: './dialog-gapminder.component.html',
  styleUrls: ['./dialog-gapminder.component.css', '../main-dialog-style.css']
})
export class DialogGapminderComponent implements AfterViewInit {
  /**
   * 
   */
  public dataLoaded = false;
  /**
   * Define gapminder Ref for function calls in template
   */
  public gapminderRef = gapminderv4;
  /**
   * The full formatted path to the configuration file to the Gapminder data.
   */
  public gapminderPath: string;
  /**
   * 
   */
  public gapminderSelected = true;
  /**
   * This Gapminder Dialog's unique windowID for keeping track of opening and closing multiple dialogs. Created by taking the
   * geoLayerId of the layer with a dash (-), followed by the resourcePath property; the path to the Gapminder config file.
   */
  public windowID: string;
  /**
   * The windowManager instance, whose job it will be to create, maintain, and remove multiple open dialogs from the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();


  constructor(public dialogRef: MatDialogRef<DialogGapminderComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.gapminderPath = dataObject.data.resourcePath;
    this.windowID = dataObject.data.windowID;
  }


  ngAfterViewInit(): void {
    // Get the element id="defaultOpen" and click for default option 
    document.getElementById("defaultOpen").click();

    // // set configuration file 
    // gapminderv4.setGapminderConfig("assets/gapminder-data/viz-config.json")

    // call gapminder js functionality 
    gapminderv4.gapminder(this.gapminderPath);
    // gapminderv4.gapminder('./gapminder-data/viz-config.json');


  }

 /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.dialogRef.close();
    // this.windowManager.removeWindow(this.windowID);
  }

  /*Opens and displays div selected by tabs*/
  openTab(evt, name) {

    if (name == "Gapminder") {
      this.gapminderSelected = true;
    } else {
      this.gapminderSelected = false;
    }
    if (name == "Data" && !this.dataLoaded) {
      display.displayData(this.gapminderPath);
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