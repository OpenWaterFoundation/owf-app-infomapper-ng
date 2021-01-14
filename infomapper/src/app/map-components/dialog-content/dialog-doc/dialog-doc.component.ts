import { Component,
          Inject,
          OnInit, }         from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppService }       from '../../../app.service';
import { MapService }       from '../../map.service';
import { WindowManager }    from '../../window-manager';

import * as IM              from '../../../../infomapper-types';

import * as Showdown        from 'showdown';

@Component({
  selector: 'app-dialog-doc',
  templateUrl: './dialog-doc.component.html',
  styleUrls: ['./dialog-doc.component.css', '../main-dialog-style.css']
})
export class DialogDocComponent implements OnInit {

  /**
   * Boolean showing if the current documentation type is a regular text file.
   */
  public docText: boolean;
  /**
   * Boolean showing if the current documentation type is a markdown file.
   */
  public docMarkdown: boolean;
  /**
   * Boolean showing if the current documentation type is an HTML file.
   */
  public docHTML: boolean;
  /**
   * The string containing the documentation that needs to be displayed in this DialogDocComponent.
   */
  public doc: string;
  /**
   * The string representing the path to the documentation file to be displayed.
   */
  public docPath: string;
  /**
   * The string to show as the DialogDoc title.
   */
  public informationName: string;
  /**
   * The formatted string to be converted into markdown by Showdown.
   */
  public showdownHTML: string;
  /**
   * A unique string representing the windowID of this Dialog Component in the WindowManager.
   */
  public windowID: string;
  /**
   * The windowManager instance, whose job it will be to create, maintain, and remove multiple open dialogs from the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();
  

  constructor(public appService: AppService,
              public mapService: MapService,
              public dialogRef: MatDialogRef<DialogDocComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.doc = dataObject.data.doc;
    this.docPath = dataObject.data.docPath;

    if (dataObject.data.geoLayerView.name) {
      this.informationName = dataObject.data.geoLayerView.name;
    } else if (dataObject.data.geoLayerView) {
      this.informationName = dataObject.data.geoLayerView;
    }

    if (dataObject.data.docText) this.docText = true;
    else if (dataObject.data.docMarkdown) this.docMarkdown = true;
    else if (dataObject.data.docHtml) this.docHTML = true;

    this.windowID = dataObject.data.windowID;
  }

  /**
   * This function is called on initialization of the map component, right after the constructor.
   */
  ngOnInit(): void {

    if (this.docMarkdown) {
      let converter = new Showdown.Converter({
        emoji: true,
        openLinksInNewWindow: true,
        parseImgDimensions: true,
        simpleLineBreaks: false,
        strikethrough: true,
        tables: true
      });
      // Check to see if the markdown file has any input that is an image link syntax. If it does, we want users to
      // be able to set the path to the image relative to the markdown folder being displayed, so they don't have to
      // be burdened with putting a possibly extra long path.
      // var sanitizedDoc = this.sanitizeDoc(this.doc);
      var sanitizedDoc = this.appService.sanitizeDoc(this.doc, IM.Path.mP);

      setTimeout(() => {
        this.showdownHTML = converter.makeHtml(sanitizedDoc);
      });
    } else if (this.docHTML) {
      setTimeout(() => {          
        document.getElementById('docDiv').innerHTML = this.doc;
      });
    }
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

}
