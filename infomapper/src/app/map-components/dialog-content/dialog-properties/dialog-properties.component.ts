import { Component,
          Inject,
          OnInit }          from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppService }       from 'src/app/app.service';
import { MapService }       from '../../map.service';

import * as Showdown        from 'showdown';


@Component({
  selector: 'app-dialog-properties',
  templateUrl: './dialog-properties.component.html',
  styleUrls: ['./dialog-properties.component.css', '../main-dialog-style.css']
})
export class DialogPropertiesComponent implements OnInit {

  public geoLayerId: string;
  public geoLayer: any;
  public showdownHTML: string;


  constructor(public appService: AppService,
              public dialogRef: MatDialogRef<DialogPropertiesComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.geoLayer = this.mapService.getGeoLayerFromId(dataObject.data.geoLayerId);
    this.geoLayerId = dataObject.data.geoLayerId;
  }


  /**
   * Iterate over the geoLayer object and assign each key and value to a markdown table string so it can be displayed in the
   * dialog. Formats some of the attributes as well for lengthy URL's. 
   */
  private buildMarkdownString(): string {

    var markdownString = '## Layer Properties ##\n\n';
    markdownString += 'The following are the properties and their values for the ' + this.geoLayer.name + ' layer. ' +
    'Values are automatically detected for URL\'s, and will be converted to display "Link". If the URL contains a supported ' +
    'file extension (.csv, .json), clicking on Link will immediately download the file. If not, clicking on Link will show the ' +
    'file in a new tab, which can be saved from there. Additionally, the Link can be right-clicked, and the file can be saved ' +
    'by clicking on **Save link as...**\n\n';

    markdownString += '| Property | Value |\n| ------ | ------ |\n';

    for (let property in this.geoLayer) {
      // The value from the geoLayer object is an array. Iterate over it and use the same property name, with the each value
      // either printed normally if a number or string, or as a link
      if (Array.isArray(this.geoLayer[property])) {
        for (let prop of this.geoLayer[property]) {
          markdownString += '| ' +
                            property +
                            ' | ' +
          (this.appService.isURL(prop) ? '[Link] (' + prop + ')' : prop) +
                            ' |\n';
        }
      } else if (typeof this.geoLayer[property] === 'object') {
        // When handling a nested object in the geoLayer object, this only handles ONE. Any more nested objects will not be printed.
        for (let prop in this.geoLayer[property]) {
          markdownString += '| ' +
                            prop +
                            ' | ' +
          (this.appService.isURL(this.geoLayer[property][prop]) ? '[Link] (' + this.geoLayer[property][prop] + ')' : this.geoLayer[property][prop]) +
                            ' |\n';
        }
      } else if (typeof this.geoLayer[property] === 'string') {
        markdownString += '| ' +
                          property +
                          ' | ' +
        (this.appService.isURL(this.geoLayer[property]) ? '[Link] (' + this.geoLayer[property] + ')' : this.geoLayer[property]) +
                          ' |\n';
      }
    }

    var fullPath: string = this.appService.buildPath('geoLayerGeoJsonPath', [this.geoLayer.sourcePath]);
    var formattedPath = this.appService.formatPath(fullPath, 'link');

    markdownString += '\n#### Download layer ####';
    markdownString += '\nThe source layer file can be downloaded at [' + formattedPath + '] (' + fullPath + ')';

    return markdownString;
  }

  ngOnInit(): void {
    var markdownString = this.buildMarkdownString();
    let converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        simpleLineBreaks: false,
        strikethrough: true,
        tables: true
    });
    this.showdownHTML = converter.makeHtml(markdownString);
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.mapService.resetClick();
    this.dialogRef.close();
  }

}
