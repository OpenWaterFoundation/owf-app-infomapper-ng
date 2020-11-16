import { Component,
          Inject,
          OnInit }              from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA }     from '@angular/material/dialog';
import { NgxGalleryOptions,
          NgxGalleryImage,
          NgxGalleryAnimation}  from 'ngx-gallery-9';

import { AppService }           from '../../../app.service';
import { MapService,
          Bounds }              from '../../map.service';
import { WindowManager }        from '../../window-manager';


@Component({
  selector: 'app-dialog-gallery',
  templateUrl: './dialog-gallery.component.html',
  styleUrls: ['./dialog-gallery.component.css', '../main-dialog-style.css']
})
export class DialogGalleryComponent implements OnInit {
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
   * The geoLayerId that the feature belongs to.
   */
  public geoLayerId: string;
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
   * 
   * @param appService 
   * @param dialogRef 
   * @param mapService 
   * @param dataObject 
   */
  constructor(public appService: AppService,
              public dialogRef: MatDialogRef<DialogGalleryComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.papaResult = dataObject.data.papaResult;
    this.featureIndex = dataObject.data.featureIndex ? dataObject.data.featureIndex : 0;
    this.geoLayerId = dataObject.data.geoLayerId;
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
        height: '565px',
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
        previewCloseOnClick: true,
        previewDownload: true,
        previewKeyboardNavigation: true,
        startIndex: this.featureIndex,
        thumbnailsColumns: 4,
        thumbnailsMoveSize: 4,
        width: '890px'
      },
      {
        breakpoint: 800,
        width: '100%',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      {
        breakpoint: 400,
        preview: false
      }
    ];
    // Iterate over each line in the CSV file, and populate the galleryImages array with the data from the line. Each element in
    // the galleryImages array is a NgxGalleryImage object.
    var count = 0;
    for (var line of this.papaResult) {
      this.galleryImages.push({
        small: line.imagePath,
        medium: line.imagePath,
        big: line.imagePath,
        description: count.toString() + ': ' + line.description
      });
      ++count;
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
