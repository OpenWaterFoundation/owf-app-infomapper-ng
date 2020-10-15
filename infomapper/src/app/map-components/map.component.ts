import { Component,
          ComponentFactoryResolver,
          ViewChild,
          ViewContainerRef,
          ViewEncapsulation,
          AfterViewInit,
          OnDestroy}                 from '@angular/core';
import { ActivatedRoute, Router }    from '@angular/router';
import { MatDialog,
         MatDialogRef,
         MatDialogConfig }           from '@angular/material/dialog';
         
import { forkJoin, Subscription }    from 'rxjs';
import { take }                      from 'rxjs/operators';

import { BackgroundLayerComponent }  from './background-layer-control/background-layer.component';
import { DialogPropertiesComponent } from './dialog-content/dialog-properties/dialog-properties.component';
import { DialogTSGraphComponent }    from './dialog-content/dialog-TSGraph/dialog-TSGraph.component';
import { DialogTextComponent }       from './dialog-content/dialog-text/dialog-text.component';
import { SidePanelInfoComponent }    from './sidepanel-info/sidepanel-info.component';
import { DialogDocComponent }        from './dialog-content/dialog-doc/dialog-doc.component';
import { DialogDataTableComponent }  from './dialog-content/dialog-data-table/dialog-data-table.component';

import { BackgroundLayerDirective }  from './background-layer-control/background-layer.directive';
import { LegendSymbolsDirective }    from './legend-symbols/legend-symbols.directive'
import { SidePanelInfoDirective }    from './sidepanel-info/sidepanel-info.directive';

import { AppService }                from '../app.service';
import { MapService }                from './map.service';
import { WindowManager,
          WindowType }               from './window-manager';
import { MapUtil,
          Style }                    from './map.util';

import * as $                        from 'jquery';
import * as Papa                     from 'papaparse';
import * as GeoRasterLayer           from 'georaster-layer-for-leaflet';
import * as parse_georaster          from 'georaster';
// Needed to use leaflet L class
declare var L: any;


@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit, OnDestroy {

  // The following global variables are used for dynamically creating elements in the application. Dynamic elements are being
  // added in a manner similar to the following Angular tutorial:
  // https://angular.io/guide/dynamic-component-loader 
  //---------------------------------------------------------------------------
  // ViewChild is used to inject a reference to components. This provides a reference to the html element
  // <ng-template background-layer-hook></ng-template> found in map.component.html
  @ViewChild(BackgroundLayerDirective) backgroundLayerComp: BackgroundLayerDirective;
  // This provides a reference to <ng-template map-layer-hook></ng-template> in map.component.html
  // @ViewChild(MapLayerDirective) LayerComp: MapLayerDirective;
  // This provides a reference to <ng-template side-panel-info-host></ng-template> in map.component.html
  @ViewChild(SidePanelInfoDirective, { static: true }) InfoComp: SidePanelInfoDirective;
  // This provides a reference to <ng-template legend-symbol-hook></ng-template> in map-layer.component.html
  @ViewChild(LegendSymbolsDirective) LegendSymbolsComp: LegendSymbolsDirective;

  // Global value to access container ref in order to add and remove sidebar info components dynamically.
  public infoViewContainerRef: ViewContainerRef;
  // Global value to access container ref in order to add and remove map layer component dynamically.
  public layerViewContainerRef: ViewContainerRef;
  // Global value to access container ref in order to add and remove background layer components dynamically.
  public backgroundViewContainerRef: ViewContainerRef;
  // Global value to access container ref in order to add and remove symbol descriptions components dynamically.
  public legendSymbolsViewContainerRef: ViewContainerRef;

  // The following are basic types of global variables used for various purposes
  // described below.
  //---------------------------------------------------------------------------
  // A reference for the Leaflet map.
  public mainMap: any;
  // A variable to keep track of whether or not the leaflet map has already been initialized. This is useful for resetting
  // the page and clearing the map using map.remove() which can only be called on a previously initialized map.
  public mapInitialized: boolean = false; 
  // The current map's ID from the app configuration file
  public mapID: string;
  // Boolean to indicate whether the sidebar has been initialized. Don't need to waste time/resources initializing sidebar twice,
  // but rather edit the information in the already initialized sidebar.
  public sidebar_initialized: boolean = false;
  // An array to hold sidebar layer components to easily remove later, when resetting the sidebar.
  public sidebar_layers: any[] = [];
  // An array to hold sidebar background layer components to easily remove later, when resetting the sidebar.
  public sidebar_background_layers: any[] = [];

  // Time interval used for resetting the map after a specified time, if defined in the configuration file.
  public interval: any = null;
  // Boolean of whether or not refresh is displayed.
  public showRefresh: boolean = true;
  
  // Boolean to know if all layers are currently displayed on the map or not.
  public displayAllLayers: boolean = true;
  // Boolean to know if the user has selected to hide all descriptions in the sidebar under map layer controls.
  public hideAllDescription: boolean = false;
  // Boolean to know if the user has selected to hide all symbols in the sidebar under the map layer controls.
  public hideAllSymbols: boolean = false;
  // All the features of a geoLayerView to be passed to the attribute table in a Material Dialog
  public allFeatures: {} = {};
  //
  public leafletData: {} = {};
  // Used to indicate which background layer is currently displayed on the map.
  public currentBackgroundLayer: string;
  // A list of map layer objects for ease of adding or removing the layers on the map.
  public mapLayers = [];
  // A list of the id's associated with each map layer
  public mapLayerIds = [];
  // The object that holds the base maps that populates the leaflet sidebar
  public baseMaps: any = {};
  // A categorized configuration object with the geoLayerId as key and a list of name followed by color for each feature in
  // the Leaflet layer to be shown in the sidebar
  public categorizedLayerColor = {};

  public badPath = false;
  public serverUnavailable = false;

  // Class variables to use when subscribing so unsubscribing can be done on ngOnDestroy() when the component is destroyed,
  // preventing memory leaks.
  private routeSubscription$ = <any>Subscription;
  private forkJoinSubscription$ = <any>Subscription;
  private mapConfigSubscription$ = <any>Subscription;


  /**
   * @constructor for the Map Component
   * @param activeRoute Used for routing in the app
   * @param appService A reference to the top level application service
   * @param componentFactoryResolver Adding components dynamically
   * @param dialog A reference to the MatDialog for creating and displaying a popup with a chart
   * @param mapService A reference to the map service, for sending data between components and global variables
   * @param route Used for getting the parameter 'id' passed in by the url and from the router
   * @param router Used to update the route when a dialog component is created and opened
   */
  constructor(private activeRoute: ActivatedRoute,
              private appService: AppService,
              private componentFactoryResolver: ComponentFactoryResolver,
              public dialog: MatDialog,
              public mapService: MapService,
              private route: ActivatedRoute, 
              private router: Router) { }


  /**
   * Add content to the info tab of the sidebar dynamically. Following the example from the Angular
   * documentation found here: https://angular.io/guide/dynamic-component-loader
   */
  private addInfoToSidebar(): void {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(SidePanelInfoComponent);
    let infoViewContainerRef = this.InfoComp.viewContainerRef;
    let componentRef = infoViewContainerRef.createComponent(componentFactory);

    (<SidePanelInfoComponent>componentRef.instance).properties = this.mapService.getProperties();
    (<SidePanelInfoComponent>componentRef.instance).appVersion = this.mapService.appConfig.version;
  }

  /**
   * Dynamically add the layer information to the sidebar coming in from the map configuration file
   * @param configFile 
   */
  private addLayerToSidebar(configFile: any) {
    // reset the sidebar components so elements are added on top of each other
    this.resetSidebarComponents();

    // Creates new layerToggle component in sideBar for each layer specified in
    // the config file, sets data based on map service.
    // var geoLayers = configFile.geoMaps[0].geoLayers;

    let mapGroups: any[] = [];
    let backgroundMapGroups: any[] = [];
    let viewGroups: any = configFile.geoMaps[0].geoLayerViewGroups;
    // var groupNumber = 0;

    viewGroups.forEach((group: any) => {
      if (group.properties.isBackground == undefined ||
          group.properties.isBackground == "false") {
            mapGroups.push(group);
          }
      if (group.properties.isBackground == "true")
        backgroundMapGroups.push(group);
    });

    // Create the each background component asynchronously by using setTimeout. If no time is given to setTimeout, 0 is used by
    // default, which makes sure that viewContainerRef is defined by the time the components are created.
    setTimeout(() => {
      backgroundMapGroups.forEach((backgroundGroup: any) => {
        backgroundGroup.geoLayerViews.forEach((backgroundGeoLayerView: any) => {
        // Create the background map layer component
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(BackgroundLayerComponent);
        this.backgroundViewContainerRef = this.backgroundLayerComp.viewContainerRef;
        let componentRef = this.backgroundViewContainerRef.createComponent(componentFactory);
        // Initialize the data for the background map layer component
        let component = <BackgroundLayerComponent>componentRef.instance;
        component.data = backgroundGeoLayerView;
        component.mapComponentReference = this;
  
        // Save the reference to this component so it can be removed when resetting the page.
        this.sidebar_background_layers.push(componentRef);
        });
      });
    });

  }

  /**
   * A CSV classification file is given by the user, so use that to create the colorTable to add to the categorizedLayerColor
   * array for creating the legend colors.
   * @param results An array of objects containing information from each row in the CSV file
   * @param geoLayerId The geoLayerId of the given layer. Used for creating legend colors
   */
  private assignFileColor(results: any[], geoLayerId: string): void {

    let colorTable: any[] = [];
    var propertyObject: any;

    for (let i = 0; i < results.length; i++) {
      propertyObject = {};
      colorTable.push(results[i]['label']);

      if (results[i]['color']) {
        propertyObject.color = results[i]['color'];
      }
      if (results[i]['fillColor']) {
        propertyObject.fillColor = results[i]['fillColor'];
      }
      if (results[i]['fillOpacity']) {
        propertyObject.fillOpacity = results[i]['fillOpacity'];
      }
      if (results[i]['weight']) {
        propertyObject.weight = results[i]['weight'];
      }

      colorTable.push(propertyObject);
    }

    if (this.categorizedLayerColor[geoLayerId]) {
      this.categorizedLayerColor[geoLayerId] = colorTable;
    }    
  }

  /**
   * 
   * @param popupTemplateId 
   * @param action 
   * @param featureProperties 
   * @param firstAction 
   */
  private buildPopupHTML(popupTemplateId: string, action: any, featureProperties: any, firstAction: boolean): string {

    // VERY IMPORTANT! When the user clicks on a marker, a check is needed to determine if the marker has been clicked on before,
    // and if so, that HTML element needs to be removed so it can be created again. This allows each created button to be
    // referenced specifically for the marker being created. 
    if (L.DomUtil.get(popupTemplateId + '-' + action.label) !== null) {
      L.DomUtil.remove(L.DomUtil.get(popupTemplateId + '-' + action.label));
    }

    var divContents = '';
    // First action, so show all properties (including the encoding of URL's) and the button for the first action. 
    if (firstAction) {
      for (let prop in featureProperties) {
        if (typeof featureProperties[prop] === 'string') {
          if (featureProperties[prop].startsWith('http://') || featureProperties[prop].startsWith('https://')) {            
            divContents += '<b>' + prop + ':</b> ' +
                            "<a href='" +
                            encodeURI(featureProperties[prop]) + "' target=_blank'" +
                            "'>" +
                            featureProperties[prop] +
                            "</a>" +
                            "<br>";
          } else {
            divContents += '<b>' + prop + ' :</b> ' + featureProperties[prop] + '<br>';
          }
        } else {
          divContents += '<b>' + prop + ' :</b> ' + featureProperties[prop] + '<br>';
        }
      }
      // Create the action button (class="btn btn-light btn-sm" creates a nicer looking bootstrap button than regular html can)
      divContents += '<br><button class="btn btn-light btn-sm" id="' + popupTemplateId + '-' + action.label +
                      '" style="background-color: #c2c1c1">' + action.label + '</button>';
    }
    // The features have already been created, so just add a button with a new id to keep it unique.
    else {        
      divContents += '&nbsp&nbsp<button class="btn btn-light btn-sm" id="' + popupTemplateId + '-' + action.label +
                      '" style="background-color: #c2c1c1">' + action.label + '</button>';
    }
    return divContents;
  }

  /**
   * The entry point and main foundation for building the Leaflet map using the data from the configuration file. Contains the
   * building and positioning of the map, raster and/or vector layers on the map and all necessary Leaflet functions for the
   * creation and styling of shapes, polygons and images on the map (among other options).
   */
  private buildMap(): void {
    
    this.mapInitialized = true;
    var _this = this;
    this.mapService.resetLayerOrder();

    // Create background layers from the configuration file.
    let backgroundLayers: any[] = this.mapService.getBackgroundLayers();
    
    backgroundLayers.forEach((backgroundLayer) => {

      let leafletBackgroundLayer = L.tileLayer(backgroundLayer.sourcePath, {
        attribution: backgroundLayer.properties.attribution,
      });
      this.baseMaps[this.mapService.getBackgroundGeoLayerViewNameFromId(backgroundLayer.geoLayerId)] = leafletBackgroundLayer;
      
    });

    // Create a Leaflet Map; set the default layers that appear on initialization
    this.mainMap = L.map('mapID', {
        layers: [this.baseMaps[this.mapService.getDefaultBackgroundLayer()]],
        // We're using our own zoom control for the map, so we don't need the default
        zoomControl: false,
        wheelPxPerZoomLevel: 150,
        zoomSnap: 0.1
    });
    // 
    // L.esri.basemapLayer('NationalGeographic').addTo(this.mainMap);
    // Retrieve the initial extent from the config file and set the map view
    let extentInitial = this.mapService.getExtentInitial();    
    this.mainMap.setView([extentInitial[1], extentInitial[0]], extentInitial[2]);
    
    // Set the default layer radio check to true
    this.setDefaultBackgroundLayer();

    // TODO: jpkeahey 2020.08.21 - Sort the baseMaps. Other changes can be made, but not easily. See here:
    // https://stackoverflow.com/questions/40906118/is-it-possible-to-add-custom-html-to-leaflet-layer-groups-and-layers-control
    // if (this.mapService.getBackgroundLayersMapControl()) {
    //   var baseMapControl = L.control.layers(this.baseMaps, null, {
    //     sortFunction: function() {}
    //   });
    //   baseMapControl.addTo(this.mainMap);
    // }
    // Add the background layers to the maps control in the topright
    if (this.mapService.getBackgroundLayersMapControl()) {
      L.control.layers(this.baseMaps).addTo(this.mainMap);
    }

    // baselayerchange is fired when the base layer is changed through the layer control. So when a radio button is pressed and
    // the basemap changes, update the currentBackgroundLayer and check the radio button
    this.mainMap.on('baselayerchange', (backgroundLayer: any) => {
      this.setBackgroundLayer(backgroundLayer.name);
    });

    // Get the map name from the config file.
    let mapName: string = this.mapService.getGeoMapName();
    // Create the control on the Leaflet map
    var mapTitle = L.control({ position: 'topleft' });
    // Add the title to the map in a div whose class name is 'info'
    mapTitle.onAdd = function () {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        // Without this, the mouse cannot select what's in the info div. With it, it can. This hopefully helps with the
        // flashing issues that have been happening when a user hovers over a feature on the map. NOTE: It didn't
        // L.DomEvent.disableClickPropagation(this._div);
        return this._div;
    };
    // When the title-card is created, have it say this
    mapTitle.update = function () {
        this._div.innerHTML = ('<div id="title-card"><h4>' + mapName + '</h4>');
    };
    mapTitle.addTo(this.mainMap);

    // Display the zoom level on the map
    let mapZoom = L.control({ position: 'bottomleft' });
    mapZoom.onAdd = function () {
      // Have Leaflet create a div with the class name zoomInfo
      this._container = L.DomUtil.create('div', 'zoomInfo');
      // When the map is created for the first time, call update to display zoom
      this.update();
      // On subsequent zoom events (at the end of the zoom) update the innerHTML again, and round to tenths
      _this.mainMap.on('zoomend', function() {
        this._container.innerHTML = '<div id="zoomInfo">Zoom Level: ' + _this.mainMap.getZoom().toFixed(1) + '</div>';
      }, this);
      return this._container;
    };
    mapZoom.update = function () {
        this._container.innerHTML = '<div id="zoomInfo">Zoom Level: ' + _this.mainMap.getZoom().toFixed(1) + '</div>';
    };
    // jpkeahey might have to turn the event listener off when a map is removed
    // mapZoom.onRemove = function() {
    //   L.DomUtil.remove(this._container);
    //   map.off('zoomend', )
    // }

    // Add home and zoom in/zoom out control to the top right corner
    L.Control.zoomHome({
      position: 'topright',
      zoomHomeTitle: 'Zoom to initial extent'
    }).addTo(this.mainMap);

    // Show the lat and lang of mouse position in the bottom left corner
    var mousePosition = L.control.mousePosition({
      position: 'bottomleft',
      lngFormatter: (num: number) => {
        let direction = (num < 0) ? 'W' : 'E';
        let formatted = Math.abs(num).toFixed(6) + '&deg ' + direction;
        return formatted;
      },
      latFormatter: (num: number) => {
        let direction = (num < 0) ? 'S' : 'N';
        let formatted = Math.abs(num).toFixed(6) + '&deg ' + direction;
        return formatted;
      }
    });

    // The next three lines of code makes sure that each control in the bottom left is created on the map in a specific order
    this.mainMap.addControl(mousePosition);
    this.mainMap.addControl(mapZoom);
    // Bottom Left corner control that shows the scale in km and miles of the map.
    L.control.scale({ position: 'bottomleft', imperial: true }).addTo(this.mainMap);

    updateTitleCard();
    // needed for the following function
    // This function will update the title card in the top left corner of the map
    // If there are configurations to allow UI interaction via mouse over or
    // clicking on a feature then the title card will show some instruction for 
    // how to do so.
    function updateTitleCard(): void {
      let div = document.getElementById('title-card');
      let instruction: string = "Move over or click on a feature for more information";
      let divContents: string = "";

      divContents = ('<h4 id="geoLayerView">' + mapName + '</h4>' + '<p id="point-info"></p>');
      if (instruction != "") {
        divContents += ('<hr/>' + '<p id="instructions"><i>' + instruction + '</i></p>');
      }
      div.innerHTML = divContents;
    }

    var geoLayerViewGroups: any[] = this.mapService.getLayerGroups();
    var dialog = this.dialog;
    
    // Dynamically load layers into array. VERY IMPORTANT
    geoLayerViewGroups.forEach((geoLayerViewGroup: any) => {
      if (geoLayerViewGroup.properties.isBackground === undefined ||
          geoLayerViewGroup.properties.isBackground === 'false') {
        
        for (let i = 0; i < geoLayerViewGroup.geoLayerViews.length; i++) {
          
          // Obtain the geoLayer for use in creating this Leaflet layer
          let geoLayer: any = this.mapService.getGeoLayerFromId(geoLayerViewGroup.geoLayerViews[i].geoLayerId);
          // Obtain the symbol data for use in creating this Leaflet layer
          let symbol: any = this.mapService.getSymbolDataFromID(geoLayer.geoLayerId);
          // Obtain the event handler information from the geoLayerView for use in creating this Leaflet layer
          let eventHandlers: any = this.mapService.getGeoLayerViewEventHandler(geoLayer.geoLayerId);
          
          var asyncData: any[] = [];
          // Push the retrieval of layer data onto the async array by appending the
          // appPath with the GeoJSONBasePath and the sourcePath to find where the
          // geoJSON file is to read.
          
          // Displays a web feature service from Esri. 
          if (geoLayer.sourceFormat && geoLayer.sourceFormat.toUpperCase() === 'WFS') {

            // Displays a raster layer on the Leaflet map by using the third-party package 'georaster-layer-for-leaflet'
          } else if (geoLayer.layerType.toUpperCase().includes('RASTER')) {
            this.createRasterLayer(geoLayer, symbol);
            // Since a raster was already created for the layer, we can skip doing anything else and go to the next geoLayerView
            continue;
          } else if (geoLayer.layerType.toUpperCase().includes('VECTOR')) {
            asyncData.push(
              this.appService.getJSONData(
                this.appService.buildPath('geoLayerGeoJsonPath', [geoLayer.sourcePath]), 'geoLayerGeoJsonPath', geoLayer.geoLayerId
              )
            );
          }
          // Push each event handler onto the async array if there are any
          if (eventHandlers.length > 0) {
            eventHandlers.forEach((event: any) => {
              if (event.properties.popupConfigPath) {
                // Use the http GET request function and pass it the returned formatted path
                asyncData.push(
                  this.appService.getJSONData(
                    this.appService.buildPath('popupConfigPath', [event.properties.popupConfigPath]), 'popupConfigPath', this.mapID
                  )
                );
              }
            });
          }
          // Use forkJoin to go through the array and be able to subscribe to every
          // element and get the response back in the results array when finished.
          this.forkJoinSubscription$ = forkJoin(asyncData).subscribe((results) => {

            // The scope of keyword this does not reach some of the leaflet functions
            // in functions. The new variable _this is created so we can still have a
            // reference to our service deeper into the leaflet layer.
            var _this = this;
            // The first element in the results array will always be the features
            // returned from the geoJSON file.
            this.allFeatures[geoLayer.geoLayerId] = results[0];
            // Prints out how many features each geoLayerView contains
            if (this.allFeatures[geoLayer.geoLayerId]) {
              console.log(geoLayerViewGroup.geoLayerViews[i].name, 'contains', this.allFeatures[geoLayer.geoLayerId].features.length, 'features');
            }
            
            var eventObject: any = {};

            // Go through each event and assign the retrieved template output to each
            // event type in an eventObject
            if (eventHandlers.length > 0) {
              for (let i = 0; i < eventHandlers.length; i++) {
                eventObject[eventHandlers[i].eventType + '-popupConfigPath'] = results[i + 1];
              }
            }
            
            // If the layer is a LINESTRING or SINGLESYMBOL POLYGON, create it here
            if (geoLayer.geometryType.toUpperCase().includes('LINESTRING') ||
                geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
                symbol.classificationType.toUpperCase().includes('SINGLESYMBOL')) {
              
              var data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                  onEachFeature: onEachFeature,
                  style: MapUtil.addStyle( {
                    feature: this.allFeatures[geoLayer.geoLayerId],
                    geoLayer: geoLayer,
                    symbol: symbol
                  })
              }).addTo(this.mainMap);

              this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data.getLayerId(data));              

              this.mapLayers.push(data);
              this.mapLayerIds.push(geoLayer.geoLayerId);

              this.mapService.setLayerOrder(this.mainMap, L);
            } 
            // If the layer is a CATEGORIZED POLYGON, create it here
            else if (geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
              symbol.classificationType.toUpperCase().includes('CATEGORIZED')) {

              this.categorizedLayerColor[geoLayer.geoLayerId] = [];

              if (symbol.properties.classificationFile) {

                Papa.parse(this.appService.buildPath('classificationPath', [symbol.properties.classificationFile]),
                  {
                    delimiter: ",",
                    download: true,
                    comments: "#",
                    skipEmptyLines: true,
                    header: true,
                    complete: (result: any, file: any) => {
                      this.assignFileColor(result.data, geoLayer.geoLayerId);

                      var geoLayerView = this.mapService.getLayerViewFromId(geoLayer.geoLayerId);                      
                      var results = result.data;
                      // var layerSelected: any;
                      
                      let data = new L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                        onEachFeature: onEachFeature,
                        style: function (feature: any) {
                          return MapUtil.addStyle({
                            feature: feature,
                            symbol: symbol,
                            results: results,
                            geoLayerView: geoLayerView
                          })
                        }
                      }).addTo(this.mainMap);

                      this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data.getLayerId(data));
                      this.mapLayers.push(data);
                      this.mapLayerIds.push(geoLayerView.geoLayerId);

                      this.mapService.setLayerOrder(this.mainMap, L);
                    }
                  });
                
              } else {                
                // Default color table is made here
                let colorTable = MapUtil.assignColor(this.allFeatures[geoLayer.geoLayerId].features, symbol);
                this.categorizedLayerColor[geoLayer.geoLayerId] = colorTable;
                
                // If there is no classificationFile, create a default colorTable
                let data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                  onEachFeature: onEachFeature,
                  style: (feature: any, layerData: any) => {                    
                    let classificationAttribute: any = feature['properties'][symbol.classificationAttribute];
                      return {
                        color: MapUtil.verify(MapUtil.getColor(symbol, classificationAttribute, colorTable), Style.color),
                        fillOpacity: MapUtil.verify(symbol.properties.fillOpacity, Style.fillOpacity),
                        opacity: MapUtil.verify(symbol.properties.opacity, Style.opacity),
                        stroke: symbol.properties.outlineColor == "" ? false : true,
                        weight: MapUtil.verify(parseInt(symbol.properties.weight), Style.weight)
                      }
                  }
                }).addTo(this.mainMap);

                this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data.getLayerId(data));
                this.mapLayers.push(data);
                this.mapLayerIds.push(geoLayer.geoLayerId);

                this.mapService.setLayerOrder(this.mainMap, L);
              }
            }
            // Display a leaflet marker or custom point/SHAPEMARKER
            else {

              var data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                pointToLayer: (feature: any, latlng: any) => {
                  // Create a shapemarker layer
                  if (geoLayer.geometryType.toUpperCase().includes('POINT') && !symbol.properties.symbolImage && !symbol.properties.builtinSymbolImage) {
                    return L.shapeMarker(latlng, MapUtil.addStyle({
                      feature: feature,
                      geoLayer: geoLayer,
                      symbol: symbol
                    }));
                  }
                  // Create a user-provided marker image layer
                  else if (symbol.properties.symbolImage) {
                    let markerIcon = L.icon({
                      iconUrl: this.appService.getAppPath() + this.mapService.formatPath(symbol.properties.symbolImage, 'symbolImage'),
                      iconAnchor: MapUtil.createAnchorArray(symbol.properties.symbolImage, symbol.properties.imageAnchorPoint)
                    });
                    return L.marker(latlng, { icon: markerIcon });
                  }
                  // Create a built-in (default) marker image layer
                  else if (symbol.properties.builtinSymbolImage) {

                    let markerIcon = new L.icon({
                      iconUrl: this.mapService.formatPath(symbol.properties.builtinSymbolImage, 'builtinSymbolImage'),
                      iconAnchor: MapUtil.createAnchorArray(symbol.properties.builtinSymbolImage, symbol.properties.imageAnchorPoint)
                    });
                    return L.marker(latlng, { icon: markerIcon })
                  }
                },
                onEachFeature: onEachFeature
              }).addTo(this.mainMap);

              var SelectedClass = L.GeoJSON.include({

                setSelectedStyleAfter: function() {
                  this.setStyle({
                    color: 'red',
                    fillOpacity: '0',
                    opacity: '1',
                    radius: parseInt(symbol.properties.symbolSize) + 3,
                    weight: 2
                  });
                },

                setSelectedStyleInit: function() {
                  this.setStyle({
                    color: 'red',
                    fillOpacity: '0',
                    opacity: '0',
                    radius: parseInt(symbol.properties.symbolSize) + 3,
                    weight: 2
                  });
                }
              });

              var selected = new SelectedClass();
              selected = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                pointToLayer: (feature: any, latlng: any) => {
                  // Create a shapemarker layer
                  return L.shapeMarker(latlng, MapUtil.addStyle({
                    feature: feature,
                    geoLayer: geoLayer,
                    symbol: symbol
                }));
              }});
              
              selected.setSelectedStyleInit();
              selected.addTo(this.mainMap);
              this.leafletData[geoLayer.geoLayerId] = selected;

              this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data.getLayerId(data));
              this.mapLayers.push(data);
              this.mapLayerIds.push(geoLayer.geoLayerId);
              
              this.mapService.setLayerOrder(this.mainMap, L);
            }
            // Check if refresh
            // let refreshTime: string[] = this.mapService.getRefreshTime(geoLayer.geoLayerId ? geoLayer.geoLayerId : geoLayer.geoLayerId)
            // if (!(refreshTime.length == 1 && refreshTime[0] == "")) {
            //   this.addRefreshDisplay(refreshTime, geoLayer.geoLayerId);
            // }

            // This function will add UI functionality to the map that allows the user to
            // click on a feature or hover over a feature to get more information. 
            // This information comes from the map configuration file
            function onEachFeature(feature: any, layer: any): void {

              // If the geoLayerView has its own custom events, use them here
              if (eventHandlers.length > 0) {
                // If the map config file has event handlers, use them
                eventHandlers.forEach((eventHandler: any) => {   
                  switch (eventHandler.eventType.toUpperCase()) {
                    case "CLICK":
                      layer.on({
                        // If only click is given for an event, default should be to display all features and show them.
                        mouseover: function(e: any) {
                          MapUtil.updateFeature(e, _this, geoLayer, symbol, geoLayerViewGroup, i);
                        },
                        mouseout: function(e: any) {
                          MapUtil.resetFeature(e, _this, geoLayer);
                        },
                        click: ((e: any) => {
                          // Feature Properties is an object with all of the clicked
                          // feature properties. We obtain the graphTemplateObject, which
                          // is the configPath property in the map configuration file event
                          // handler. This is the actual TS graph template file with ${ }
                          // properties that need to be replaced. They are replaced in the
                          // replace Properties function above.
                          // var marker = e.target;

                          if (!eventObject[eventHandler.eventType + '-popupConfigPath'].actions) {
                            console.error('No action attribute detected in the popup template file. ' +
                            'Please add at least one action to the action list');
                            return;
                          }

                          var featureProperties: Object = e.target.feature.properties;
                          var chartPackageArray: any[] = [];
                          var firstAction = true;
                          var numberOfActions = eventObject[eventHandler.eventType + '-popupConfigPath'].actions.length;
                          var actionArray: string[] = [];
                          var actionLabelArray: string[] = [];
                          var graphFilePath: string;
                          var divContents = '';
                          var TSID_Location: string;
                          var resourcePathArray: string[] = [];
                          var downloadFileNameArray: any[] = [];
                          var popupTemplateId = eventObject[eventHandler.eventType + '-popupConfigPath'].id;

                          // Replaces any properties in ${featureAttribute:} notation
                          MapUtil.replaceProperties(eventObject[eventHandler.eventType + '-popupConfigPath'], featureProperties);

                          for (let action of eventObject[eventHandler.eventType + '-popupConfigPath'].actions) {
                            downloadFileNameArray.push(action.saveFile);
                            resourcePathArray.push(action.resourcePath);
                            actionLabelArray.push(action.label);
                            actionArray.push(action.action);
                            chartPackageArray.push(action.chartPackage);

                            if (firstAction) {
                              divContents += _this.buildPopupHTML(popupTemplateId, action, featureProperties, true);
                              firstAction = false;
                            } else {
                              divContents += _this.buildPopupHTML(popupTemplateId, action, featureProperties, false);
                            }

                          }
                          layer.unbindPopup().bindPopup(divContents, {
                            maxHeight: 300,
                            maxWidth: 300
                          }).openPopup();
                          
                          for (let i = 0; i < numberOfActions; i++) {
                            L.DomEvent.addListener(L.DomUtil.get(popupTemplateId + '-' + actionLabelArray[i]), 'click', function (e: any) {
                              // Display a plain text file in a Dialog popup
                              if (actionArray[i] === 'displayText') {
                                
                                let fullResourcePath = _this.appService.buildPath('resourcePath', [resourcePathArray[i]]);

                                _this.appService.getPlainText(fullResourcePath, 'resourcePath').subscribe((text: any) => {
                                  openTextDialog(dialog, text, fullResourcePath);
                                });
                              }
                              // Display a Time Series graph in a Dialog popup
                              else if (actionArray[i] === 'displayTimeSeries') {
                                
                                let fullResourcePath = _this.appService.buildPath('resourcePath', [resourcePathArray[i]]);
                                
                                _this.appService.getJSONData(fullResourcePath, 'resourcePath', _this.mapID)
                                .subscribe((graphTemplateObject: Object) => {

                                  MapUtil.replaceProperties(graphTemplateObject, featureProperties);

                                  if (graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID) {
                                    let TSID: string = graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID;
                                    // Split on the ~ and set the actual file path we want to use so our dialog-content component
                                    // can determine what kind of file was given.
                                    TSID_Location = TSID.split('~')[0];
                                    // If the TSID has one tilde (~), set the path using the correct index compared to if the 
                                    // TSID contains two tildes.
                                    if (TSID.split('~').length === 2) {
                                      graphFilePath = TSID.split("~")[1];
                                    } else if (TSID.split('~').length === 3) {
                                      graphFilePath = TSID.split("~")[2];
                                    }
                                  } else console.error('The TSID has not been set in the graph template file');

                                  openTSGraphDialog(dialog, graphTemplateObject, graphFilePath, TSID_Location, chartPackageArray[i],
                                  downloadFileNameArray[i] ? downloadFileNameArray[i] : null);
                                });
                              }
                              // If the attribute is neither displayTimeSeries nor displayText
                              else {
                                console.error(
                                  'Action attribute is not supplied or incorrect. Please specify either "displayText" or "displayTimeSeries" as the action.'
                                );
                              }
                            });
                          }

                          // Not needed?
                          layer.getPopup().on('remove', function() {
                            for (let i = 0; i < numberOfActions; i++) {
                              L.DomEvent.removeListener(L.DomUtil.get(popupTemplateId + '-' + actionLabelArray[i], 'click', function(e: any) { }));                              
                            }                            
                          });

                        })
                      });
                      break;
                    case "MOUSEOVER":
                      switch (eventHandler.action.toUpperCase()) {
                        case "UPDATETITLECARD":
                          layer.on({
                            mouseover: function(e: any) {
                              MapUtil.updateFeature(e, _this, geoLayer, symbol, geoLayerViewGroup, i);
                            },
                            mouseout: function(e: any) { MapUtil.resetFeature(e, _this, geoLayer); }
                          });
                          break;
                      }
                      break;
                    default:
                      layer.on({
                        mouseover: function(e: any) {
                          MapUtil.updateFeature(e, _this, geoLayer, symbol, geoLayerViewGroup, i);
                        },
                        mouseout: function(e: any) { MapUtil.resetFeature(e, _this, geoLayer); }
                      });
                      break;
                  }  
                });
              } else {                
                  // If the map config does NOT have any event handlers, use a default
                  layer.on({
                  mouseover: function(e: any) {
                    MapUtil.updateFeature(e, _this, geoLayer, symbol, geoLayerViewGroup, i);
                  },
                  mouseout: function(e: any) { MapUtil.resetFeature(e, _this, geoLayer); },
                  click: ((e: any) => {
                    
                    // TODO: jpkeahey 2020.07.09 - Find a way to keep highlighted yellow on click.
                    // if (geoLayer.geometryType.includes('LineString')) {
                    //   let layer = e.target;
                    //   layer.setStyle({
                    //     color: 'yellow'
                    //   });
                    // }

                    var divContents = '';
                    var feature = '';
                    // Boolean to describe if we've converted any epoch times in the features. Used to add what the + sign
                    // means in the popup
                    var converted = false;
                    // Boolean to help determine if the current property needs to be converted
                    var convertedEpochTime: boolean;
                    // Go through each property and write the correct html for displaying
                    for (let property in e.target.feature.properties) {
                      // Reset the converted boolean so the rest of the feature don't have + signs on them
                      convertedEpochTime = false;
                      // Rename features so the long e.tar... isn't used in many places
                      feature = e.target.feature.properties[property];
                      if (typeof feature == 'string') {
                        if (feature.startsWith("http://") || feature.startsWith("https://")) {
                          // If the value is a http or https link, convert it to one
                          divContents += '<b>' + property + ':</b> ' +
                          "<a href='" +
                          encodeURI(feature) + "' target=_blank'" +
                          "'>" +
                          MapUtil.truncateString(feature, 45) +
                          "</a>" +
                          "<br>";

                        } else { // Display a regular non-link string in the popup
                            divContents += '<b>' + property + ':</b> ' + feature + '<br>';
                        }
                      } else { // Display a non-string in the popup
                        // This will convert the feature to an ISO 8601 moment
                        if (typeof feature === 'number') {
                          if (/date|time/i.test(property) && feature > 1000000000) {
                            converted = true;
                            convertedEpochTime = true;

                            divContents += '<b>' + property + ':</b> ' + feature + '<br>';
                            feature = MapUtil.convertEpochToFormattedDate(feature);
                          }
                        }

                        if (convertedEpochTime) {
                          divContents += '<b>+' + property + '</b>: ' + feature + '<br>';
                        } else {
                          divContents += '<b>' + property + '</b>: ' + feature + '<br>';
                        }

                      }
                    }
                    // Add in the explanation of what the prepended + sign means above
                    if (converted) {
                      divContents += '<br> <b>+</b> auto-generated values';
                    }

                    // Show the popup on the map. It must be unbound first, or else will only
                    // be able to show up on the first click.
                    layer.unbindPopup().bindPopup(divContents, {
                      maxHeight: 300,
                      maxWidth: 300
                    });
                    // TODO: jpkeahey 2020.06.15 - Might have to remove this and replace with
                    // let marker = e.target; marker.openPopup() like in a custom event above
                    var popup = e.target.getPopup();
                    popup.setLatLng(e.latlng).openOn(_this.mainMap);
                  })
                });
              }
            }

            /**
             * Creates the Dialog object to show the graph in and passes the info needed for it.
             * @param dialog The dialog object needed to create the Dialog popup
             * @param graphTemplateObject The template config object of the current graph being shown
             * @param graphFilePath The file path to the current graph that needs to be read
             */
            function openTSGraphDialog(dialog: any, graphTemplateObject: any, graphFilePath: string,
            TSID_Location: string, chartPackage: string, downloadFileName?: string): void {

              // Create a MatDialogConfig object to pass to the DialogTSGraphComponent for the graph that will be shown
              const dialogConfig = new MatDialogConfig();
              dialogConfig.data = {
                chartPackage: chartPackage,
                graphTemplate: graphTemplateObject,
                graphFilePath: graphFilePath,
                // This cool piece of code uses quite a bit of syntactic sugar. It dynamically sets the saveFile based on the
                // condition that saveFile is defined, using the spread operator. More information was found here:
                // https://medium.com/@oprearocks/what-do-the-three-dots-mean-in-javascript-bc5749439c9a
                ...(downloadFileName && { downloadFileName: downloadFileName }),
                TSID_Location: TSID_Location
              }
              const dialogRef: MatDialogRef<DialogTSGraphComponent, any> = dialog.open(DialogTSGraphComponent, {
                data: dialogConfig,
                hasBackdrop: false,
                panelClass: 'custom-dialog-container',
                height: "700px",
                width: "910px",
                minHeight: "700px",
                minWidth: "910px",
                maxHeight: "700px",
                maxWidth: "910px"
              });

              var windowManager: WindowManager = WindowManager.getInstance();
              windowManager.addWindow(dialogRef, TSID_Location, WindowType.TSGRAPH)
            }

            /**
             * Creates a Dialog object to show a plain text file and passes the info needed for it.
             * @param dialog The dialog object needed to create the Dialog popup
             * @param text The text retrieved from the text file to display in the Dialog Content popup
             * @param resourcePath The path to the text file so the file name can be extracted in the dialog-text component
             */
            function openTextDialog(dialog: any, text: any, resourcePath: string): void {

              const dialogConfig = new MatDialogConfig();
              dialogConfig.data = {
                text: text,
                resourcePath: resourcePath
              }
              const dialogRef: MatDialogRef<DialogTextComponent, any> = dialog.open(DialogTextComponent, {
                data: dialogConfig,
                // This stops the dialog from containing a backdrop, which means the background opacity is set to 0, and the
                // entire Info Mapper is still navigable while having the dialog open. This way, you can have multiple dialogs
                // open at the same time.
                hasBackdrop: false,
                panelClass: 'custom-dialog-container',
                height: "750px",
                width: "900px",
                minHeight: "600px",
                minWidth: "410px",
                maxHeight: "90vh",
                maxWidth: "90vw"
              });
            }

          });
          this.badPath = false;
          this.serverUnavailable = false;
        }
      }
    });
    // Retrieve the expandedInitial and set to collapse if false or not present. If true, show all background layers
    if (this.mapService.getBackgroundExpandedInitial() === false) {
      setTimeout(() => {
        document.getElementById('collapse-background').setAttribute('class', 'collapse');
      });
    }
    // If the sidebar has not already been initialized once then do so.
    if (this.sidebar_initialized == false) { this.createSidebar(); }
  }

  /**
   * Determine what layer the user clicked the clear button from, and rest the styling for the highlighted features
   * @param geoLayerId The geoLayerId to determine which layer style should be reset
   */
  public clearSelections(geoLayerId: string): void {
    
    var selectedLayer = this.leafletData[geoLayerId];
    // Reset the style of the selected layer so that it disappears when the clear selection button is clicked.
    if (selectedLayer) {
      selectedLayer.setStyle({
        fillOpacity: '0',
        opacity: '0'
      });
    }
  }

  /**
   * Asynchronously creates a raster layer on the Leaflet map.
   * @param geoLayer The geoLayer object from the map configuration file
   * @param symbol The Symbol data object from the geoLayerView
   */
  private createRasterLayer(geoLayer: any, symbol: any): void {
    // Uses the fetch API with the given path to get the tiff file in assets to create the raster layer
    fetch('assets/app/' + this.mapService.formatPath(geoLayer.sourcePath, 'rasterPath'))
    .then((response: any) => response.arrayBuffer())
    .then((arrayBuffer: any) => {
      parse_georaster(arrayBuffer).then((georaster: any) => {
        // The classificationFile attribute exists in the map configuration file, so use that file path for Papaparse
        if (symbol.properties.classificationFile) {

          this.categorizedLayerColor[geoLayer.geoLayerId] = [];

          Papa.parse(this.appService.buildPath('classificationPath', [symbol.properties.classificationFile]),
            {
              delimiter: ",",
              download: true,
              comments: "#",
              skipEmptyLines: true,
              header: true,
              complete: (result: any, file: any) => {

                this.assignFileColor(result.data, geoLayer.geoLayerId);
                
                var layer = new GeoRasterLayer({
                  georaster: georaster,
                  // Sets the color and opacity of each cell in the raster layer
                  pixelValuesToColorFn: (values: any) => {
                    if (values[0] === 0) {
                      return undefined;
                    }

                    for (let line of result.data) {
                      if (values[0] === parseInt(line.value)) {
                        let conversion = MapUtil.hexToRGB(line.fillColor);
                        
                        return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
                      }
                    }

                    for (let line of result.data) {
                      if (line.value === '*') {
                        if (line.fillColor && !line.fillOpacity) {
                          let conversion = MapUtil.hexToRGB(line.fillColor);
                        
                          return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, 0.7)`;
                        } else if (!line.fillColor && line.fillOpacity) {
                          return `rgba(0, 0, 0, ${line.fillOpacity})`;
                        } else
                        return `rgba(0, 0, 0, 0.6)`;
                      }
                    }
                  }
                });

                layer.addTo(this.mainMap);
                
                // this.mainMap.on('click', function(e: any) {
                //   var latlng = _this.mainMap.mouseEventToLatLng(e.originalEvent);
                //   console.log(latlng);
                // });

                this.mapLayers.push(layer);
                this.mapLayerIds.push(geoLayer.geoLayerId);
              }
            });
        }
        // No classificationFile attribute was given in the config file, so just create a default raster layer
        else {
          var layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: 0.7
          });

          layer.addTo(this.mainMap);
          // this.mainMap.on('click', function(evt: any) {
          //   var latlng = map.mouseEventToLatLng(evt.originalEvent);
          //   console.log(latlng);
            
          // });

          this.mapLayers.push(layer);
          this.mapLayerIds.push(geoLayer.geoLayerId);
        }

      });
    });
  }

  /**
   * Creates the side bar on the left side of the map using the third party npm package `leaflet-sidebar-v2`
   */
  private createSidebar(): void {
    this.sidebar_initialized = true;
    // Create the sidebar instance and add it to the map. 
    let sidebar = L.control.sidebar({ container: 'sidebar' })
        .addTo(this.mainMap)
        .open('home');

    // Add panels dynamically to the sidebar
    // sidebar.addPanel({
    //     id:   'testPane',
    //     tab:  '<i class="fa fa-gear"></i>',
    //     title: 'JS API',
    //     pane: '<div class="leaflet-sidebar-pane" id="home"></div>'
    // });    
    this.addInfoToSidebar();
  }

  public getBadPath(geoLayerId: string): string {
    return this.mapService.getBadPath(geoLayerId);
  }

  /**
   * @returns the geometryType of the current geoLayer to determine what shape should be drawn in the legend
   * @param geoLayerId The id of the current geoLayer
   */
  public getGeometryType(geoLayerId: string): any { return this.mapService.getGeometryType(geoLayerId); }

  /**
   * This function is called on initialization of the map component.
   */
  public ngAfterViewInit() {
    // When the parameters in the URL are changed the map will refresh and load
    // according to new configuration data
    this.routeSubscription$ = this.activeRoute.params.subscribe(() => {

      this.resetMapVariables();

      this.mapID = this.route.snapshot.paramMap.get('id');
      
      // TODO: jpkeahey 2020.05.13 - This helps show how the map config path isn't set on a hard refresh because of async issues
      // Loads data from config file and calls loadComponent when the mapConfig is defined
      // The path plus the file name 
      setTimeout(() => {
        let fullMapConfigPath = this.appService.getAppPath() + this.mapService.getFullMapConfigPath(this.mapID);

        this.mapConfigSubscription$ = 
        this.appService.getJSONData(fullMapConfigPath, 'fullMapConfigPath', this.mapID).subscribe((mapConfig: any) => {
          // Set the configuration file class variable for the map service
          this.mapService.setMapConfig(mapConfig);
          // Add components to the sidebar
          this.addLayerToSidebar(mapConfig);
          // Create the map.
          this.buildMap();
        });
      }, 500);
    });

  }

  public isBadPath(geoLayerId: string): boolean {
    return this.mapService.isBadPath(geoLayerId);
  }

  public isServerUnavailable(geoLayerId: string): boolean {
    return this.mapService.isServerUnavailable(geoLayerId);
  }

  /**
   * Called once, before the instance is destroyed.
   */
  public ngOnDestroy(): void {
    this.routeSubscription$.unsubscribe();
    this.forkJoinSubscription$.unsubscribe();
    this.mapConfigSubscription$.unsubscribe();
  }

  /**
   * Opens up an attribute (data) table dialog
   * @param geoLayerId The geoLayerView's geoLayerId to be matched so the correct features are displayed
   */
  public openAttributeTableDialog(geoLayerId: string, geoLayerViewName: string): void {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      allFeatures: this.allFeatures[geoLayerId],
      geoLayerId: geoLayerId,
      geoLayerViewName: geoLayerViewName,
      leafletData: this.leafletData,
      mainMap: this.mainMap
    }
    const dialogRef: MatDialogRef<DialogDataTableComponent, any> = this.dialog.open(DialogDataTableComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: 'custom-dialog-container',
      height: "750px",
      width: "910px",
      minHeight: "530px",
      minWidth: "570px",
      maxHeight: "90vh",
      maxWidth: "90vw"
    });
  }

  /**
   * Refreshes and/or reinitializes map global variables when a new map component instance is created
   */
  private resetMapVariables(): void {
    // First clear the map
    if (this.mapInitialized === true) {
      // BUT before the map is removed - and there can only be one popup open at a time on the map - close it so that when the
      // new map is created, there aren't any issues
      this.mainMap.closePopup();
      this.mainMap.remove();
    }

    this.mapInitialized = false;
    this.mapLayers = [];
    this.mapLayerIds = [];

    clearInterval(this.interval);
  }

  /**
   * Clears the current data displayed in the sidebar. This makes sure that the sidebar is cleared when
   * adding new components due to a page refresh.
   */
  private resetSidebarComponents(): void {
    if (this.layerViewContainerRef && this.backgroundViewContainerRef) {
      if (this.layerViewContainerRef.length > 1 || this.backgroundViewContainerRef.length > 1) {
        this.layerViewContainerRef.clear();
        this.backgroundViewContainerRef.clear();
      }
    }
  }

  // TODO: jpkeahey 2020.07.21 - Not yet implemented.
  public selectedInitial(geoLayerView: any): boolean {
    // if (geoLayerView.properties.selectedInitial === undefined || geoLayerView.properties.selectedInitial === 'true') {

    //   return true;
    // } else if (geoLayerView.properties.selectedInitial === 'false') {
    //   this.toggleLayer(geoLayerView.geoLayerId);
    //   return false;
    // }
    return true;
  }

  /**
   * Replaces the background layer on the Leaflet map with the layer selected
   * @param name The name of the background selected to set the @var currentBackgroundLayer as
   */
  public selectBackgroundLayer(name: string): void {
    this.mainMap.removeLayer(this.baseMaps[this.currentBackgroundLayer]);
    this.mainMap.addLayer(this.baseMaps[name]);
    this.currentBackgroundLayer = name;

    // When a new background layer is selected, the raster layer was being covered up by the new tile layer. This
    // sets the z index of the raster so that it stays on top of the background, but behind the vector.
    this.mainMap.eachLayer((layer: any) => {
      if (layer instanceof L.GridLayer && layer.debugLevel) {
        layer.setZIndex(10);
      }
    });
    
  }

  /**
   * Sets the @var clicked to true, after it has been clicked and a dialog has been opened
   */
  public setAsClicked(): void {
    this.mapService.setAsClicked();
  }

  /**
   * Sets the @var currentBackgroundLayer to the name of the background layer given, and sets the radio check in the side bar
   * to checked so that background layer is set on the Leaflet map.
   * @param name The name of the background layer selected
   */
  private setBackgroundLayer(name: string): void {
    this.currentBackgroundLayer = name;
    let radio: any = document.getElementById(name + "-radio");
    radio.checked = "checked";
  }

  /**
   * Sets the default background layer for the leaflet map by creating a MutationObserver and listens for when the DOM element
   * defaultName + '-radio' is not undefined. When the if statement is true, it calls the handleCanvas function, set the now
   * creating canvas elementId to 'checked', stops the observer from observing, and returns.
   */
  private setDefaultBackgroundLayer(): void {

    let defaultName: string = this.mapService.getDefaultBackgroundLayer();
    this.currentBackgroundLayer = defaultName;

    // Callback executed when canvas was found
    function handleCanvas(canvas: any) { 
      canvas.checked = "checked";
    }
    // Set up the mutation observer
    var observer = new MutationObserver(function (mutations, me) {
      // `mutations` is an array of mutations that occurred
      // `me` is the MutationObserver instance
      var canvas = document.getElementById(defaultName + "-radio");
      if (canvas) {
        handleCanvas(canvas);
        me.disconnect(); // stop observing
        return;
      }
    });
    // Start observing
    observer.observe(document, {
      childList: true,
      subtree: true
    });

  }

  /**
   * When the info button by the side bar slider is clicked, it will either show a popup or separate tab containing the documentation
   * for the selected geoLayerViewGroup or geoLayerView.
   * @param docPath The string representing the path to the documentation
   */
  public openDocDialog(docPath: string, geoLayerView: any): void {
    // Needed so the scope of the map component reference can be used in the jquery code
    var _this = this;
    var text: boolean, markdown: boolean, html: boolean;
    // This is needed to unbind the click handler from the div, or else events will be added every time the doc button is pressed
    $('.geoMap-doc-button').off('click');
    $('.geoLayerViewGroup-doc-button').off('click');
    $('.geoLayerView-doc-button').off('click');
    // Adds the event for clicking, and depending on whether it was normal or ctl-click, do different things
    $( '.geoMap-doc-button, .geoLayerViewGroup-doc-button, .geoLayerView-doc-button' ).on( 'click', function( event ) {
      if ( event.ctrlKey ) {
        // Ctrl + click
        console.log('Ctl-click');
          
      } else {
        // Normal click
        // Set the type of display the Mat Dialog will show
        if (docPath.includes('.txt')) text = true;
        else if (docPath.includes('.md')) markdown = true;
        else if (docPath.includes('.html')) html = true;

        _this.appService.getPlainText(_this.appService.buildPath('docPath', [docPath]), 'Documentation')
        .pipe(take(1))
        .subscribe((doc: any) => {

          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = {
            doc: doc,
            docPath: docPath,
            docText: text,
            docMarkdown: markdown,
            docHtml: html,
            geoLayerView: geoLayerView
          }
          
          _this.route.queryParams
          .pipe(take(1))
          .subscribe((params) => {
            
            var dialogRef: any;
            if (params['dialog']) {
              dialogRef = _this.dialog.open(DialogDocComponent, {
                data: dialogConfig,
                hasBackdrop: false,
                panelClass: 'custom-dialog-container',
                height: "725px",
                width: "700px",
                minHeight: "550px",
                minWidth: "500px",
                maxHeight: "90vh",
                maxWidth: "90vw"
              });

              dialogRef.afterClosed()
              .pipe(take(1))
              .subscribe(() => {
                _this.router.navigate(['.'], { relativeTo: _this.route })
              });
            }
          });
        });
      }
    });
  }

  /**
   * 
   */
  public openPropertyDialog(geoLayerId: string, geoLayerViewName: any): void {

    // Create a MatDialogConfig object to pass to the DialogTSGraphComponent for the graph that will be shown
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      geoLayerId: geoLayerId,
      geoLayerViewName: geoLayerViewName
    }
    const dialogRef: MatDialogRef<DialogPropertiesComponent, any> = this.dialog.open(DialogPropertiesComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: 'custom-dialog-container',
      height: "700px",
      width: "910px",
      minHeight: "580px",
      minWidth: "410px",
      // vh = view height = 1% of the browser's height, so the max height will be 90% of the browser's
      maxHeight: "90vh",
      // vw = view width = 1% of the browser's width, so the max width will be 90% of the browser's
      maxWidth: "90vw"
    });

    // var windowManager: WindowManager = WindowManager.getInstance();
    // windowManager.addWindow(dialogRef, TSID_Location, WindowType.TSGRAPH)
  }

  /**
   * Style's the current legend object in the sidebar legend.
   * @param symbolProperties The display style object for the current layer's legend
   * @param styleType A string or character differentiating between single symbol, categorized, and graduated style legend objects
   */
  public styleObject(symbolProperties: any, styleType: string): Object {
    switch(styleType) {
      case 'ss':
        return {
          fill: MapUtil.verify(symbolProperties.properties.fillColor, Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.properties.fillOpacity, Style.fillOpacity),
          opacity: MapUtil.verify(symbolProperties.properties.opacity, Style.opacity),
          stroke: MapUtil.verify(symbolProperties.properties.color, Style.color),
          strokeWidth: MapUtil.verify(symbolProperties.properties.weight, Style.weight)
        };
      case 'c':
        return {
          fill: MapUtil.verify(symbolProperties.fillColor, Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.fillOpacity, Style.fillOpacity),
          stroke: MapUtil.verify(symbolProperties.color, Style.color),
          strokeWidth: MapUtil.verify(symbolProperties.weight, Style.weight)
        };
    }

  }

  // TODO: jpkeahey 2020.07.20 - Maybe I can try to change this at some point to only toggle all layers in the geoLayerViewGroup
  // instead of the entire Leaflet map.
  /**
   * Toggles all layers on the Leaflet map on or off when the Show All Layers or Hide All Layers button is clicked
   */
  public toggleAllLayers() : void{

    if (!this.displayAllLayers) {
      for(let i = 0; i < this.mapLayers.length; i++) {
        this.mainMap.addLayer(this.mapLayers[i]);
        (<HTMLInputElement>document.getElementById(this.mapLayerIds[i] + "-slider")).checked = true;
        let description = $("#description-" + this.mapLayerIds[i])
        if (!this.hideAllDescription) {
          description.css('visibility', 'visible');
          description.css('height', '100%');
        }
        let symbols = $("#symbols-" + this.mapLayerIds[i]);
        if (!this.hideAllSymbols) {
          symbols.css('visibility', 'visible');
          symbols.css('height', '100%');
        }
      }
      document.getElementById("display-button").innerHTML = "Hide All Layers";
      this.displayAllLayers = true;

      this.mapService.setLayerOrder(this.mainMap, L);
    }
    else {
      for(let i = 0; i < this.mapLayers.length; i++) {
        this.mainMap.removeLayer(this.mapLayers[i]);
        (<HTMLInputElement>document.getElementById(this.mapLayerIds[i] + "-slider")).checked = false;
        let description = $("#description-" + this.mapLayerIds[i]);
        description.css('visibility', 'hidden');
        description.css('height', 0);
        let symbols = $("#symbols-" + this.mapLayerIds[i]);
        symbols.css('visibility', 'hidden');
        symbols.css('height', 0);
      }
      document.getElementById("display-button").innerHTML = "Show All Layers";
      this.displayAllLayers = false;
    }
  }

  /**
   * Uses jquery to toggle all descriptions in the sidebar legend.
   */
  public toggleDescriptions() {
    $('.description').each((i, obj) => {

      let description = $(obj)[0];
      // Split on the FIRST instance of "-" to get the full id
      let id = description.id.split(/-(.+)/)[1];
      
      if (id) {
        let mapLayer = $("#" + id + "-slider")[0];      
        let checked = mapLayer.getAttribute("checked");

        if (checked == "checked") {
          if ($(obj).css('visibility') == 'visible') {
            $(obj).css('visibility', 'hidden');
            $(obj).css('height', 0);
          }
          else if ($(obj).css('visibility') == 'hidden') {
          $(obj).css('visibility', 'visible');
          $(obj).css('height', '100%');
          }
        }
      }
    });

    if (this.hideAllDescription) {
      this.hideAllDescription = false;
    } else {
      this.hideAllDescription = true;
    }
  }

  /**
   * Toggles Leaflet layer visibility from sidebar controls
   * @param geoLayerId The current geoLayer ID
   */
  public toggleLayer(geoLayerId: string): void {
    let index = this.mapLayerIds.indexOf(geoLayerId);
    
    let checked = (<HTMLInputElement>document.getElementById(geoLayerId + "-slider")).checked;    
    
    if (!checked) {
      this.mainMap.removeLayer(this.mapLayers[index]);      
      this.mapService.removeLayerFromDrawOrder(this.mapLayers[index]._leaflet_id);

      (<HTMLInputElement>document.getElementById(geoLayerId + "-slider")).checked = false;
      let description = $("#description-" + geoLayerId);
      description.css('visibility', 'hidden');
      description.css('height', 0);
      let symbols = $("#symbols-" + geoLayerId);
      symbols.css('visibility', 'hidden');
      symbols.css('height', 0);
    }
    // If checked
    else {
      this.mainMap.addLayer(this.mapLayers[index]);
      this.mapService.addHiddenLayerToDrawOrder(this.mapLayers[index]._leaflet_id);

      (<HTMLInputElement>document.getElementById(geoLayerId + "-slider")).checked = true;
      let description = $("#description-" + geoLayerId)
      if (!this.hideAllDescription) {
        description.css('visibility', 'visible');
        description.css('height', '100%');
      }
      let symbols = $("#symbols-" + geoLayerId);
      if (!this.hideAllSymbols) {
        symbols.css('visibility', 'visible');
        symbols.css('height', '100%');
      }
      // When the slider is checked again, re-sort the layers so layer
      // order is preserved.
      this.mapService.setLayerOrder(this.mainMap, L);
    }
  }

  /**
   * Toggle the visibility of the symbols in the sidebar legend
   */
  public toggleSymbols() {
    $('.symbols').each((i, obj) => {
      let symbol = $(obj)[0];
      // Split on the FIRST instance of "-", as the id might have dashes
      let id = symbol.id.split(/-(.+)/)[1];
      
      let mapLayer = $("#" + id + "-slider")[0];
      let checked = mapLayer.getAttribute("checked");

      if (checked == "checked") {
        if ($(obj).css('visibility') == 'visible') {
          $(obj).css('visibility', 'hidden');
          $(obj).css('height', 0);
        }
        else if ($(obj).css('visibility') == 'hidden') {
          $(obj).css('visibility', 'visible');
          $(obj).css('height', '100%');
        }
      }
    })
    if (this.hideAllSymbols) {
      this.hideAllSymbols = false;  
    } else {
      this.hideAllSymbols = true;
    }
  }

}