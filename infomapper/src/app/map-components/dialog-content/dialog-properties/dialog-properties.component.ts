import { Component,
          Inject,
          OnInit }          from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppService,
          PathType }        from 'src/app/app.service';
import { MapService }       from '../../map.service';

import * as Showdown        from 'showdown';


@Component({
  selector: 'app-dialog-properties',
  templateUrl: './dialog-properties.component.html',
  styleUrls: ['./dialog-properties.component.css', '../main-dialog-style.css']
})
export class DialogPropertiesComponent implements OnInit {

  public layerProperties: string[];
  public geoLayerId: string;
  public geoLayer: any;
  public showdownHTML: string;


  constructor(public appService: AppService,
              public dialogRef: MatDialogRef<DialogPropertiesComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.geoLayer = this.mapService.getGeoLayerFromId(dataObject.data.geoLayerId);
    this.geoLayerId = dataObject.data.geoLayerId;
    this.layerProperties = dataObject.data.layerProperties;
  }


  /**
   * Iterate over the geoLayer object and assigns each key and value to a table and gives other useful information to users in a
   * markdown string so it can be displayed in the dialog. Formats some of the attributes as well for lengthy URL's. 
   */
  private buildMarkdownString(): string {

    var markdownString = '## Layer Properties ##\n\n' +
    'Layers have the following data:\n' +
    '1. Layer metadata, which is information about the layer (see the ***Layer Metadata*** and ***Layer ' +
    'Configuration Properties*** sections below).\n' +
    '2. Shapes (geometries), which are used to draw the map.\n' +
    '3. Properties (attributes) associated with shapes. These properties are the data that are useful for ' +
    'analysis, such as area, population, and links to other data. Use the layer ***Data Table*** popup menu to view the data table. ' +
    'The following table lists the property names for the layer.\n\n';

    // Create the Layer Properties table by iterating over all properties in a feature in the layer
    markdownString += '| Property |\n| ------- |\n';
    for (let property of this.layerProperties) {
      markdownString += '| ' + property + ' |\n';
    }

    markdownString += '## Layer Metadata ##\n\n' +
    'This application does not currently support displaying Geographic Information System layer metadata files. However, this feature is envisioned for the future.\n\n';

    markdownString += '## Layer Configuration Properties\n\n' +
    'The following are layer configuration properties that are used by the web application.\n' +
    'URL values, such as for `sourcePath`, are automatically detected and are converted to display "Link". If the URL contains a ' +
    'supported file extension (.csv, .json, etc.), clicking on link will immediately download the file. If download is not automatic, ' +
    'clicking on link will show the file in a new tab, which can be saved using the browser\'s save feature. Additionally, right-click ' +
    'on the link and save the associated file using ***Save link as…***\n\n';

    // Create the Layer Configuration Properties table by iterating over all properties in the geoLayer object
    markdownString += '| Property | Value |\n| ------ | ------ |\n';
    for (let property in this.geoLayer) {
      // Skip the history property, as it is not relevant to all users, per Steve
      if (property.toUpperCase().includes('HISTORY')) {
        continue;
      }
      // The value from the geoLayer object is an array. Iterate over it and use the same property name, with the each value
      // either printed normally if a number or string, or as a link
      if (Array.isArray(this.geoLayer[property])) {
        for (let prop of this.geoLayer[property]) {
          markdownString += '| ' + property + ' | ' +

          (this.appService.isURL(prop) ? '[Link] (' + prop + ')' : prop) +
                            ' |\n';
        }
      } else if (typeof this.geoLayer[property] === 'object') {
        // When handling a nested object in the geoLayer object, this only handles ONE. Any more nested objects will not be printed.
        for (let prop in this.geoLayer[property]) {
          markdownString += '| ' + prop + ' | ' +

          (this.appService.isURL(this.geoLayer[property][prop]) ? '[Link] (' + this.geoLayer[property][prop] + ')' : this.geoLayer[property][prop]) +
                            ' |\n';
        }
      } else if (typeof this.geoLayer[property] === 'string') {
        markdownString += '| ' + property + ' | ' +
        
        (this.appService.isURL(this.geoLayer[property]) ? '[Link] (' + this.geoLayer[property] + ')' : this.geoLayer[property]) +
                          ' |\n';
      }
    }

    var fullPath: string = this.appService.buildPath(PathType.gLGJP, [this.geoLayer.sourcePath]);
    var formattedPath = this.appService.formatPath(fullPath, 'link');

    markdownString += '\n## Download Layer ##\n\n' +
    'The source layer file can be downloaded from: [' + formattedPath + '] (' + fullPath + ')\n\n' +
    'In some cases the source layer is a URL and not a simple file. In this case, use the `sourcePath` in Layer Configuration ' +
    'Properties to access the source data. The information provided for a layer typically also lists the data source.'

    return markdownString;
  }

  /**
   * The initial function called in this component. Called once, after ngOnChanges().
   */
  ngOnInit(): void {
    this.formatLayerProperties();

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

  /**
   * Iterates over the layer properties array and formats them so they can be appropriately displayed in a markdown string
   */
  private formatLayerProperties(): void {
    
    for (let i = 0; i < this.layerProperties.length; ++i) {
      this.layerProperties[i] = this.layerProperties[i].replace(/_/g, '\\_');
    }
  }

}
