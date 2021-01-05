import { Component, OnInit, Inject, } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

/* Reference to JS functions */
import * as gapminderv6         from './js/gapminder-6.1.1.js';
import * as display             from './js/gapminder-util/display-data.js';


@Component({
  selector: 'app-dialog-gapminder',
  templateUrl: './dialog-gapminder.component.html',
  styleUrls: ['./dialog-gapminder.component.css', '../main-dialog-style.css']
})
export class DialogGapminderComponent  {
    // Define gapminder configuration: Will be set by providing path to openDialog function
    public configurationFile;
    // Define gapminder Ref for function calls in template
    public gapminderRef = gapminderv6;
  
    constructor(
            public dialogRef: MatDialogRef<DialogGapminderComponent>,
            @Inject(MAT_DIALOG_DATA) public dataObject: any) { 
            
              this.configurationFile = dataObject.data.resourcePath;
        
    }
  
    ngAfterViewInit(): void {
      console.log("Config path: ", this.configurationFile)
       // Get the element id="defaultOpen" and click for default option to be set
      document.getElementById("defaultOpen").click();
  
      // call gapminder js functionality using path to configuration file
      // gapminderv6.gapminder('assets/gapminder-data/viz-config.json');
      gapminderv6.gapminder(this.configurationFile);
  
     
  
  
    }
    /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
    public onClose(): void {
      this.dialogRef.close();
      // this.windowManager.removeWindow(this.windowID);
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
        display.displayData(this.configurationFile);
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
  