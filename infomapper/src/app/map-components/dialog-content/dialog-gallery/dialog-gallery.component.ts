import { Component,
          Inject,
          OnInit }             from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA }    from '@angular/material/dialog';
import { NgxGalleryOptions,
          NgxGalleryImage,
          NgxGalleryAnimation} from 'ngx-gallery-9';
import { Action } from 'rxjs/internal/scheduler/Action';

import { AppService }          from '../../../app.service';
import { MapService,
          PathType }           from '../../map.service';
import { WindowManager }       from '../../window-manager';


@Component({
  selector: 'app-dialog-gallery',
  templateUrl: './dialog-gallery.component.html',
  styleUrls: ['./dialog-gallery.component.css', '../main-dialog-style.css']
})
export class DialogGalleryComponent implements OnInit {
  /**
   * All features of a geoLayerView.
   */
  public allFeatures: any;
  /**
   * The object containing an event action's id as the key, and the entire event object from the popup template file
   * as the value. Used for kebab menu Image Galleries.
   */
  public eventActions: any;
  /**
   * The object containing the type of event as the key (e.g. click-eCP) and the entire event object from the
   * popup template file.
   */
  public eventObject: any;
  /**
   * The initial index of the picture in the @var galleryImages array when this DialogGalleryComponent was opened.
   */
  private featureIndex: number;
  /**
   * Array of NgxGalleryOption objects containing optional data for creating the Gallery.
   */
  public galleryOptions: NgxGalleryOptions[] = [];
  /**
   * Array of NgxGalleryImage objects for creating and showing images in the Gallery.
   */
  public galleryImages: NgxGalleryImage[] = [];
  /**
   * The geoLayerId that the feature belongs to from the map configuration file.
   */
  public geoLayerId: string;
  /**
   * The geoLayerView that the feature belongs to from the map configuration file.
   */
  public geoLayerView: any;
  /**
   * The reference to the Leaflet map object.
   */
  public mainMap: any;
  /**
   * The array containing the result objects from Papaparse, with the headers of the CSV file as keys, and the appropriate CSV
   * column as the value. Each object in the array counts as one line from the CSV file.
   */
  public papaResult: any;
  /**
   * The object of a specific Leaflet LayerGroup that supports feature highlighting.
   */
  public selectedLayerGroup: any;
  /**
   * The object of all Leaflet LayerGroups that support feature highlighting. Each element in the object contains the geoLayerId
   * as the key, and the LayerGroup object as the value.
   */
  public selectedLayers: any;
  /**
   * A unique string representing the windowID of this Dialog Component in the WindowManager.
   */
  public windowID: string;
  /**
   * The windowManager instance, whose job it will be to create, maintain, and remove multiple open dialogs from the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * Creates and displays an Image Gallery with png, jpg, and similar files in a Material Dialog.
   * @param appService The reference to the AppService injected object.
   * @param dialogRef The reference to the DialogTSGraphComponent. Used for creation and sending of data.
   * @param mapService The reference to the map service, for sending data between components and higher scoped map variables.
   * @param dataObject The object containing data passed from the Component that created this Dialog.
   */
  constructor(public appService: AppService,
              public dialogRef: MatDialogRef<DialogGalleryComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.allFeatures = dataObject.data.allFeatures;
    this.eventActions = dataObject.data.eventActions;
    this.eventObject = dataObject.data.eventObject;
    this.featureIndex = dataObject.data.featureIndex ? dataObject.data.featureIndex - 1 : 0;
    this.geoLayerId = dataObject.data.geoLayerId;
    this.geoLayerView = dataObject.data.geoLayerView;
    this.papaResult = dataObject.data.papaResult;
    this.mainMap = dataObject.data.mainMap;
    this.selectedLayers = dataObject.data.selectedLayers;
    this.windowID = this.geoLayerId + '-dialog-gallery';
  }


  /**
   * Create the class variables galleryOptions and galleryImages that will be used by this Dialog's template file for displaying
   * the gallery.
   */
  private buildGallery(): void {
    // First, populate the galleryOptions array with the necessary options for gallery creation.
    this.galleryOptions = [
      {
        arrowPrevIcon: "fa fa-arrow-circle-o-left fa-lg", 
        arrowNextIcon: "fa fa-arrow-circle-o-right fa-lg",
        height: '98%',
        imageActions: [
          {
            icon: 'fa fa-search-plus fa-2x',
            titleText: 'Zoom to Project',
            onClick: (event: Event, index: number) => {
              this.zoomToFeatures(index);
            }
          },
          // {
          //   icon: 'fa fa-dot-circle-o fa-2x',
          //   titleText: 'Select Project',
          //   onClick: (event: Event, index: number) => {
          //     console.log(event, index);
          //   }
          // }
        ],
        imageAnimation: NgxGalleryAnimation.Fade,
        imageDescription: true,
        // imagePercent: 80,
        previewCloseOnClick: true,
        previewDownload: true,
        previewKeyboardNavigation: true,
        startIndex: this.featureIndex,
        thumbnailsColumns: 4,
        thumbnailsMoveSize: 4,
        thumbnailMargin: 1,
        thumbnailsMargin: 1,
        // thumbnailsPercent: 20,
        width: '100%'
      },
      {
        breakpoint: 800,
        width: '100%'
      },
      {
        breakpoint: 400,
        preview: false
      }
    ];
    // Iterate over each line in the CSV file, and populate the galleryImages array with the data from the line. Each element in
    // the galleryImages array is a NgxGalleryImage object.
    var count = 1;
    // Create a variable that will cut down on the length of trying to use the full 'path' to the ID.
    var imageGalleryEventActionId = this.geoLayerView.properties.imageGalleryEventActionId;
    // KEBAB MENU
    if (imageGalleryEventActionId) {
      // If the imageGalleryEventActionId is a key in the eventActions, then it confirms this layer will use the event object
      // associated with that ID.
      if (imageGalleryEventActionId in this.eventActions) {
        // Iterate through the feature array so each image is added to the imageGallery array in the same order they were created
        // on the Leaflet map, keeping the indexes from the map and the imageGallery arrays in tune.
        for (var feature of this.allFeatures.features) {
          // Go through each line from the CSV classification file.
          for (var line of this.papaResult) {
            // Use the value header from the CSV gallery template file to compare with the feature, and if they're equal, add the
            // NgxGalleryImage object to the array.
            if (feature.properties[this.eventActions[imageGalleryEventActionId].imageGalleryAttribute].toString() === line.value) {
              this.galleryImages.push({
                small: this.appService.buildPath(PathType.iGP, [line.imagePath]),
                medium: this.appService.buildPath(PathType.iGP, [line.imagePath]),
                big: this.appService.buildPath(PathType.iGP, [line.imagePath]),
                description: count.toString() + ': ' + line.description
              });
              ++count;
            }
          }
        }
      }
    }
    // EVENT DRIVEN
    else {
      // Iterate through the feature array so each image is added to the imageGallery array in the same order they were created
      // on the Leaflet map, keeping the indexes from the map and the imageGallery arrays in tune.
      for (var feature of this.allFeatures.features) {
        // Go through each line from the CSV classification file.
        for (var line of this.papaResult) {
          // Use the value header from the CSV gallery template file to compare with the feature, and if they're equal, add the
          // NgxGalleryImage object to the array.
          for (let action of this.eventObject['click-eCP'].actions) {
            if (action.action.toUpperCase() === 'DISPLAYIMAGEGALLERY') {
              if (feature.properties[action.imageGalleryAttribute].toString() === line.value) {
                this.galleryImages.push({
                  small: this.appService.buildPath(PathType.iGP, [line.imagePath]),
                  medium: this.appService.buildPath(PathType.iGP, [line.imagePath]),
                  big: this.appService.buildPath(PathType.iGP, [line.imagePath]),
                  description: count.toString() + ': ' + line.description
                });
                ++count;
              }
            }
          }
          
        }
      }
    }

  }

  /**
   * Called once after the constructor.
   */
  ngOnInit(): void {
    this.buildGallery();
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.windowID);
  }

  /**
   * When the magnifying glass icon is clicked on, get the correct coordinate bounds and zoom the map to them.
   * @param index The index of the image clicked on in the NgxGalleryImage array.
   */
  public zoomToFeatures(index: number): void {
    // Attempt to create the selectedLayer object.
    this.selectedLayerGroup = this.selectedLayers[this.geoLayerId];
    var layers = this.selectedLayerGroup.getLayers();

    // If the selected (or highlighted) layer exists, zoom to it on the map.
    if (layers) {

      var layer = layers[index];

      // NOTE: The Leaflet method fitBounds() is currently not being used, as the method flyTo() uses a smoother transition
      // between features. It is a little laggy however, so the fitBounds was left for the future.
      // If the selectedLayer variable is created (if the Leaflet layer supports it e.g. Points, Markers, Images) then zoom
      // to the layer bounds on the map
      // var bounds: Bounds = {
      //   NEMaxLat: layer.feature.geometry.coordinates[1],
      //   NEMaxLong: layer.feature.geometry.coordinates[0],
      //   SWMinLat: layer.feature.geometry.coordinates[1],
      //   SWMinLong: layer.feature.geometry.coordinates[0]
      // }
      // Add and subtract by 0.07 so that the zoom does not go to the point at the maximum possible zoom.
      // var zoomBounds = [[bounds.NEMaxLat - 0.07, bounds.NEMaxLong + 0.07],
      //                   [bounds.SWMinLat + 0.07, bounds.SWMinLong - 0.07]];
      // this.mainMap.fitBounds(zoomBounds, 13, {
      //   padding: [475, 0]
      // });

      var zoomBounds = [layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]]
      this.mainMap.flyTo(zoomBounds, 13, {
        animate: true,
        duration: 1.5,
        // easeLinearity: 1,
        padding: [475, 0]
      });
    }

  }

}
