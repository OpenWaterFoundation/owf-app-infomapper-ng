import { Component,
          Inject,
          OnInit }          from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppService }       from 'src/app/app.service';
import { MapService }       from '../../map.service';

import { MapUtil}           from '../../map.util';

import { MapLayerManager }  from '../../map-layer-manager';
import { MapLayerItem }     from '../../map-layer-item'
import { WindowManager }    from '../../window-manager';

import * as IM              from '../../../../infomapper-types';
import * as Showdown        from 'showdown';


@Component({
  selector: 'app-dialog-properties',
  templateUrl: './dialog-properties.component.html',
  styleUrls: ['./dialog-properties.component.css', '../main-dialog-style.css']
})
export class DialogPropertiesComponent implements OnInit {
  /**
   * The MapLayerItem that represents the layer for the properties being displayed.
   */
  public layerItem: MapLayerItem;
  /**
   * An array of all properties for this layer.
   */
  public layerProperties: string[];
  /**
   * The layer's geoLayerId.
   */
  public geoLayerId: string;
  /**
   * The reference to the layer's geoLayer object.
   */
  public geoLayer: any;
  /**
   * The instance of the MapLayerManager, a helper class that manages MapLayerItem objects with Leaflet layers
   * and other layer data for displaying, ordering, and highlighting.
   */
  public mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /**
   * The formatted string to be converted to HTML by Showdown.
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
  

  /**
   * 
   * @param appService The reference to the AppService injected object.
   * @param dialogRef The reference to the DialogTSGraphComponent. Used for creation and sending of data.
   * @param mapService The reference to the map service, for sending data between components and higher scoped map variables.
   * @param dataObject The object containing data passed from the Component that created this Dialog.
   */
  constructor(public appService: AppService,
              public dialogRef: MatDialogRef<DialogPropertiesComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.geoLayer = this.mapService.getGeoLayerFromId(dataObject.data.geoLayerId);
    this.geoLayerId = dataObject.data.geoLayerId;
    this.layerProperties = dataObject.data.layerProperties;
    this.windowID = this.geoLayerId + '-dialog-properties';
    this.layerItem = this.mapLayerManager.getLayerItem(this.geoLayerId);
  }


  /**
   * Iterate over the geoLayer object and assigns each key and value to a table and gives other useful information to users in a
   * markdown string so it can be displayed in the dialog. Formats some of the attributes as well for lengthy URL's. 
   */
  private buildMarkdownString(): string {

    var markdownString = '## Layer Properties ##\n\n' +
    'Layers have the following properties:\n' +
    '1. Properties (attributes) associated with shapes. These properties are the data that are useful for ' +
    'analysis, such as area, population, and links to other data. Use the layer ***Data Table*** popup menu to view the data table. ' +
    'The following table lists the property names for the layer.\n' +
    '2. Layer metadata, which is information about the layer (see the ***Layer Metadata*** and ***Layer ' +
    'Configuration Properties*** sections below).\n\n';
    
    // Create the Layer Properties table by iterating over all properties in a feature in the layer, if the layer is a Vector.
    if (this.layerItem.isVectorLayer() === true) {
      markdownString += '| Property - (Attribute)|\n| ------- |\n';
      for (let property of this.layerProperties) {
        markdownString += '| ' + property + ' |\n';
      }
    }
    // If the layer is a Raster layer, add the main properties for the layer, then iterate through each band and list information
    // for each one.
    else if (this.layerItem.isRasterLayer() === true) {
      markdownString += '## Raster Properties ##\n\n' +
      '<pre class="raster-properties">';

      let geoRaster = this.layerItem.getItemLeafletLayer();

      markdownString +=
      '<b>Height:</b> ' + geoRaster.height + '\n' +
      '<b>Width:</b> ' + geoRaster.width + '\n' +
      '<b>Number of Bands:</b> ' + geoRaster.rasters.length + '\n' +
      '<b>Max Lat:</b> ' + geoRaster.maxLat.toFixed(8) + '\n' +
      '<b>Max Lng:</b> ' + geoRaster.maxLng.toFixed(8) + '\n' +
      '<b>Min Lat:</b> ' + geoRaster.minLat.toFixed(8) + '\n' +
      '<b>Min Lng:</b> ' + geoRaster.minLng.toFixed(8) + '\n' +
      '<b>Pixel Height:</b> ' + geoRaster.pixelHeight.toFixed(8) + '\n' +
      '<b>Pixel Width:</b> ' + geoRaster.pixelWidth.toFixed(8) + '\n' +
      '<b>Projection:</b> ' + geoRaster.projection + '\n' +
      '<b>Tile Height:</b> ' + geoRaster.tileHeight + '\n' +
      '<b>Tile Width:</b> ' + geoRaster.tileWidth + '\n' +
      '<b>x Max:</b> ' + geoRaster.xmax.toFixed(8) + '\n' +
      '<b>x Min:</b> ' + geoRaster.xmin.toFixed(8) + '\n' +
      '<b>y Max:</b> ' + geoRaster.ymax.toFixed(8) + '\n' +
      '<b>y Min:</b> ' + geoRaster.ymin.toFixed(8) + '\n\n';
      
      for (let i = 0; i < geoRaster.rasters.length; ++i) {
        markdownString +=
        '<b>Band ' + (i + 1) + '</b>\n' +
        '  <b>Data Type:</b> ' + this.getInstanceOf(geoRaster.rasters[i][0]) + '\n' +
        '  <b>Has No Data Value:</b> ' + (geoRaster.noDataValue === null ? 'False\n' : 'True\n') + 
        '  <b>No Data Value:</b> ' + geoRaster.noDataValue + '\n';
      }

      markdownString += '</pre>\n\n';

      markdownString += '# Layer Properties #\n\n' +
      'Raster layers have the following properties:\n' + 
      '1. Raster layers contain equal-sized grid cells with dimensional units that match the coordinate reference system. ' +
      'Raster layers contain one or more bands, each of which have a data type and contain values for the raster cells. ' +
      'Mouse over a cell or click on a cell to see the cell\'s data value.  Cell values can can also have no data value.\n' +
      '2. Layer metadata, which is information about the layer (see the ***Layer Metadata*** and ***Layer Configuration Properties*** sections below).\n\n'
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
    

    var fullPath: string = this.appService.buildPath(IM.Path.gLGJP, [this.geoLayer.sourcePath]);
    var formattedPath = this.appService.condensePath(fullPath, 'link');

    markdownString += '\n## Download Layer ##\n\n' +
    'The source layer file can be downloaded from: [' + formattedPath + '] (' + fullPath + ')\n\n' +
    'In some cases the source layer is a URL and not a simple file. In this case, use the `sourcePath` in Layer Configuration ' +
    'Properties to access the source data. The layer **Information** popup menu also typically lists the data source.'

    return markdownString;
  }

  /**
   * @returns A string describing the type of array the Raster is using, to be displayed under band properties.
   * @param arr The Raster array reference to determine what data types it is using.
   */
  private getInstanceOf(arr: any[]): string {
    if (arr instanceof Float32Array) {
      return 'Float32Array';
    } else if (arr instanceof Float64Array) {
      return 'Float64Array';
    } else if (arr instanceof Int8Array) {
      return 'Int8Array';
    } else if (arr instanceof Int16Array) {
      return 'Int16Array';
    } else if (arr instanceof Int32Array) {
      return 'Int32Array';
    } else {
      return 'Unknown';
    }
  }

  /**
   * The initial function called in this component. Called once, after ngOnChanges().
   */
  ngOnInit(): void {
    this.formatLayerProperties();

    var markdownString = this.buildMarkdownString();
    let converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        parseImgDimensions: true,
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
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
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
