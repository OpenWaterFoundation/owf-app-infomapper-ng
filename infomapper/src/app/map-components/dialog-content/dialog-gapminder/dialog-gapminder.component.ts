// import { AfterViewInit,
//           Inject,
//           Component}            from '@angular/core';

// import { MatDialogRef,
//           MAT_DIALOG_DATA }     from '@angular/material/dialog';
// import { WindowManager }        from '../../window-manager.js';

// // reference to JS functions
// import * as gapminderv4         from '../dialog-gapminder/js/gapminder-4.0.0.js';
// import * as display             from '../dialog-gapminder/js/gapminder-util/display-data.js';


// @Component({
//   selector: 'app-dialog-gapminder',
//   templateUrl: './dialog-gapminder.component.html',
//   styleUrls: ['./dialog-gapminder.component.css', '../main-dialog-style.css']
// })
// export class DialogGapminderComponent implements AfterViewInit {

//   /**
//    * Define gapminder Ref for function calls in template.
//    */
//   public gapminderRef = gapminderv4;
//   /**
//    * 
//    */
//   public configurationFile: string;  // = 'assets/gapminder-data/viz-config.json';
//   /**
//    * 
//    */
//   public dataLoaded = false;
//   /**
//    * 
//    */
//   public gapminderSelected = true;
//   /**
//    * A unique string representing the windowID of this Dialog Component in the WindowManager.
//    */
//   public windowID: string;
//   /**
//    * The windowManager instance, whose job it will be to create, maintain, and remove multiple open dialogs from the InfoMapper.
//    */
//   public windowManager: WindowManager = WindowManager.getInstance();
  
//   /**
//    * 
//    */
//   constructor(public dialogRef: MatDialogRef<DialogGapminderComponent>,
//               @Inject(MAT_DIALOG_DATA) public dataObject: any) {

//     this.configurationFile = dataObject.data.resourcePath;
//   }


//   /**
//    * 
//    */
//   ngAfterViewInit(): void {



//      // Get the element id="defaultOpen" and click for default option 
//     document.getElementById("defaultOpen").click();

//     // call gapminder js functionality 
//     gapminderv4.gapminder();

//   }

//   /**
//    * Closes the Mat Dialog popup when the Close button is clicked.
//    */
//   public onClose(): void {
//     this.dialogRef.close();
//     // this.windowManager.removeWindow(this.windowID);
//   }

//   /**
//    * Opens and displays div selected by tabs.
//    * @param evt 
//    * @param name 
//    */
//   public openTab(evt: any, name: any) {

//     if(name == "Gapminder"){
//       this.gapminderSelected = true;
//     }else{
//       this.gapminderSelected = false;
//     }
//     if(name == "Data" && !this.dataLoaded){
//       display.displayData(this.configurationFile);
//       this.dataLoaded = true;
//     }
//       var i, tabcontent, tablinks;
//       tabcontent = document.getElementsByClassName("tabcontent");
//       for (i = 0; i < tabcontent.length; i++) {
//           tabcontent[i].style.display = "none";
//       }
//       tablinks = document.getElementsByClassName("tablinks");
//       for (i = 0; i < tablinks.length; i++) {
//           tablinks[i].className = tablinks[i].className.replace(" active", "");
//       }
//       document.getElementById(name).style.display = "block";
//       evt.currentTarget.className += " active";

//   }

// }
