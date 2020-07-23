import { Component,
          ComponentFactoryResolver,
          QueryList,
          ViewChild,
          ViewChildren,
          ViewContainerRef,
          ViewEncapsulation,
          AfterViewInit,
          OnDestroy}                from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';
import { MatDialog,
         MatDialogConfig }          from '@angular/material/dialog';
         
import { forkJoin, Subscription }   from 'rxjs';
import { take }                     from 'rxjs/operators';

import { BackgroundLayerComponent } from './background-layer-control/background-layer.component';
import { DialogContent }            from './dialog-content/dialog-content.component';
import { SidePanelInfoComponent }   from './sidepanel-info/sidepanel-info.component';

import { BackgroundLayerDirective } from './background-layer-control/background-layer.directive';
import { LegendSymbolsDirective }   from './legend-symbols/legend-symbols.directive'
import { SidePanelInfoDirective }   from './sidepanel-info/sidepanel-info.directive';

import { AppService }               from '../app.service';
import { MapService }               from './map.service';

import * as $                       from "jquery";
import * as Papa                    from 'papaparse';


var parse_georaster = require('georaster');
var GeoRasterLayer = require('georaster-layer-for-leaflet');
// Needed to use leaflet L class
declare var L: any;

@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit, OnDestroy {

  // The following global variables are used for dynamically creating elements in
  // the application. Dynamic elements are being added in a manner similar to the
  // following Angular tutorial:
  // https://angular.io/guide/dynamic-component-loader 
  //---------------------------------------------------------------------------
  // ViewChild is used to inject a reference to components.
  // This provides a reference to the html element
  // <ng-template background-layer-hook></ng-template> found in map.component.html
  @ViewChild(BackgroundLayerDirective) backgroundLayerComp: BackgroundLayerDirective;
  // This provides a reference to <ng-template map-layer-hook></ng-template>
  // in map.component.html
  // @ViewChild(MapLayerDirective) LayerComp: MapLayerDirective;
  // @ViewChild('componentGroup', { read: ViewContainerRef }) componentGroup: ViewContainerRef;
  @ViewChildren('test', { read: ViewContainerRef }) components!: QueryList<ViewContainerRef>;
  // This provides a reference to <ng-template side-panel-info-host></ng-template>
  // in map.component.html
  @ViewChild(SidePanelInfoDirective, { static: true }) InfoComp: SidePanelInfoDirective;
  // This provides a reference to <ng-template legend-symbol-hook></ng-template> in
  // map-layer.component.html
  @ViewChild(LegendSymbolsDirective) LegendSymbolsComp: LegendSymbolsDirective;

  // Global value to access container ref in order to add and remove sidebar info
  // components dynamically.
  infoViewContainerRef: ViewContainerRef;
  // Global value to access container ref in order to add and remove map layer
  // component dynamically.
  layerViewContainerRef: ViewContainerRef;
  // Global value to access container ref in order to add and remove background
  // layer components dynamically.
  backgroundViewContainerRef: ViewContainerRef;
  // Global value to access container ref in order to add and remove symbol
  // descriptions components dynamically.
  legendSymbolsViewContainerRef: ViewContainerRef;

  // The following are basic types of global variables used for various purposes
  // described below.
  //---------------------------------------------------------------------------
  // A reference for the Leaflet map.
  mainMap: any;
  // A variable to keep track of whether or not the leaflet map has already been
  // initialized. This is useful for resetting the page and clearing the map using
  // map.remove() which can only be called on a previously initialized map.
  mapInitialized: boolean = false; 

  // Boolean to indicate whether the sidebar has been initialized. Don't need to
  // waste time/resources initializing sidebar twice, but rather edit the information
  // in the already initialized sidebar.
  sidebar_initialized: boolean = false;
  // An array to hold sidebar layer components to easily remove later, when resetting
  // the sidebar.
  sidebar_layers: any[] = [];
  // An array to hold sidebar background layer components to easily remove later, when
  // resetting the sidebar.
  sidebar_background_layers: any[] = [];

  // Time interval used for resetting the map after a specified time, if defined in the configuration file.
  interval: any = null;
  // Boolean of whether or not refresh is displayed.
  showRefresh: boolean = true;
  
  // Boolean to know if all layers are currently displayed on the map or not.
  displayAllLayers: boolean = true;
  // Boolean to know if the user has selected to hide all descriptions in the sidebar
  // under map layer controls.
  hideAllDescription: boolean = false;
  // Boolean to know if the user has selected to hide all symbols in the sidebar
  // under the map layer controls.
  hideAllSymbols: boolean = false;

  // Used to indicate which background layer is currently displayed on the map.
  currentBackgroundLayer: string;
  // A list of map layer objects for ease of adding or removing the layers on the map.
  mapLayers = [];
  // A list of the id's associated with each map layer
  mapLayerIds = [];
  // The object that holds the base maps that populates the leaflet sidebar
  baseMaps: any = {};
  // A categorized configuration object with the geoLayerId as key and a list of name followed by color for each feature in
  // the Leaflet layer to be shown in the sidebar
  categorizedLayerColor = {};

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
   * @param mapService A reference to the map service, for sending data
   * @param route Used for getting the parameter 'id' passed in by the url and from the router
   * @param router 
   */
  constructor(private route: ActivatedRoute, 
              private router: Router,
              private componentFactoryResolver: ComponentFactoryResolver,
              private appService: AppService,
              public mapService: MapService, 
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog) { }


  /**
   * Add the categorized layer to the map by reading in a CSV file as the colorTable
   * @param allFeatures All features from the geoJson file of the given layer on the map being created
   * @param geoLayerViewGroupId The ID of the geoLayerViewGroup that this geoLayerView belongs to
   * @param geoLayerView The entire geoLayerView
   * @param results The results obtained from the CSV classification file
   * @param layerIndex The index of this layer from the for loop that is creating the Leaflet layers. Used for layer draw order
   */
  private addCategorizedLayer(allFeatures: any, geoLayerViewGroupId: string, geoLayerView: any, results: any, layerIndex: number) {

    var mapService = this.mapService;
    // var layerSelected: any;
    
    let data = new L.geoJson(allFeatures, {
      onEachFeature: (feature: any, layer: any) => {
        layer.on({
          mouseover: updateTitleCard,
          mouseout: removeTitleCard,
          click: ((e: any) => {
            var divContents: string = '';
            for (let property in e.target.feature.properties) {
              divContents += '<b>' + property + ':</b> ' +
                            e.target.feature.properties[property] + '<br>';           
            }
            layer.bindPopup(divContents, {
              maxHeight: 300,
              maxWidth: 300
            });
            var popup = e.target.getPopup();            
            popup.setLatLng(e.latlng).openOn(this.mainMap);
          })
        });

        function updateTitleCard(e: any) {
        // These lines bold the outline of a selected feature
        // layerSelected = e.target;
        // layerSelected.setStyle({
        //   weight: 2.5
        // });
        // layerSelected.bringToFront();

          let div = document.getElementById('title-card');
          let featureProperties: any = e.target.feature.properties;
          let instruction: string = "Click on a feature for more information";

          let divContents = '<h4 id="geoLayerView">' + geoLayerView.name + '</h4>' + '<p id="point-info"></p>';

          for (let prop in featureProperties) {
            divContents += '<b>' + prop + ' :</b> ' + featureProperties[prop] + '<br>';
          }
          if (instruction != "") {
            divContents += ('<hr/>' + '<p><i>' + instruction + '</i></p>');
          }
                    
          div.innerHTML = divContents;
        }
        
        function removeTitleCard(e: any) {
          let div = document.getElementById('title-card');
          let instruction: string = "Move over or click on a feature for more information";
          let divContents: string = "";
        
          divContents = ('<h4 id="geoLayerView">' + mapService.getName() + '</h4>' + '<p id="point-info"></p>');
          if (instruction != "") {
            divContents += ('<hr/>' + '<p><i>' + instruction + '</i></p>');
          }
          div.innerHTML = divContents;
        }
      },
      style: (feature: any) => {

        // Before the classification attribute is used, check to see if it exists,
        // and complain if it doesn't.
        if (!feature['properties'][geoLayerView.geoLayerSymbol.classificationAttribute]) {
          console.error("The classification file property 'classificationAttribute' value '" +
          geoLayerView.geoLayerSymbol.classificationAttribute +
          "' was not found. Confirm that the specified attribute exists in the layer attribute table.");
        }
        // The classification file property 'classificationAttribute' value 'DIVISION' was not found. Confirm that the specified
        // attribute exists in the layer attribute table.
        for (let i = 0; i < results.length; i++) {          
          // If the classificationAttribute is a string, check to see if it's the same as the variable returned
          // from Papaparse. 
          if (typeof feature['properties'][geoLayerView.geoLayerSymbol.classificationAttribute] == 'string' &&
              feature['properties'][geoLayerView.geoLayerSymbol.classificationAttribute].toUpperCase() == results[i]['value'].toUpperCase()) {
                
            return {
              color: results[i]['color'],
              fillOpacity: results[i]['fillOpacity'],
              opacity: results[i]['opacity'],
              stroke: geoLayerView.geoLayerSymbol.properties.outlineColor == "" ? false : true,
              weight: results[i]['weight']
            }
          }
          // If the classificationAttribute is a number, compare it with the results
          else if (feature['properties'][geoLayerView.geoLayerSymbol.classificationAttribute] == results[i]['value']) {
            return {
              color: results[i]['color'],
              fillOpacity: results[i]['fillOpacity'],
              opacity: results[i]['opacity'],
              stroke: geoLayerView.geoLayerSymbol.properties.outlineColor == "" ? false : true,
              weight: results[i]['weight']
            }
          }
        }
      }
    }).addTo(this.mainMap);

    this.mapService.addInitLayerToDrawOrder(geoLayerViewGroupId, layerIndex, data._leaflet_id);
    this.mapLayers.push(data);
    this.mapLayerIds.push(geoLayerView.geoLayerId);

    this.mapService.setLayerOrder(this.mainMap, L);
  }

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
    var geoLayers = configFile.geoMaps[0].geoLayers;

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

    // NOTE: This setTimeout function dynamically created the side bar MapLayerComponents, but did not cooperate when trying to
    // separate by geoLayerViewGroup, so was scrapped. Might be used in the future. Also, think about setting the timeout to nothing,
    // which will default to 0. It just needs to asynchronously create the components since it's being displayed under an ngIf in the
    // map.component.html file.
    // setTimeout(() => {
    //   mapGroups.forEach((mapGroup: any) => {
    //     mapGroup.geoLayerViews.forEach((geoLayerView: any) => {
          
    //       // Create the View Layer Component
    //       let componentFactory = this.componentFactoryResolver.resolveComponentFactory(MapLayerComponent);
          
    //       this.layerViewContainerRef = this.LayerComp.viewContainerRef;
    //       let componentRef = this.layerViewContainerRef.createComponent(componentFactory);
          
    //       // Initialize data for the map layer component.
    //       let component = <MapLayerComponent>componentRef.instance;
    //       component.layerViewData = geoLayerView;
    //       component.mapComponentReference = this;

    //       let id: string = geoLayerView.geoLayerId;
    //       component.geometryType = this.mapService.getGeometryType(id);
    //       // Save the reference to this component so it can be removed when resetting the page.
    //       this.sidebar_layers.push(componentRef);
    //     });
    //   });
          
    // }, 750);

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

  // Add the style to the features
  private addStyle(feature: any, layerData: any): Object {
    
    let symbolData: any = this.mapService.getSymbolDataFromID(layerData.geoLayerId);

    if (symbolData.properties.symbolShape) {        
      symbolData.properties.symbolShape =
                              symbolData.properties.symbolShape.toLowerCase();        
    }
    
    let style: {} = {};

    if (layerData.geometryType.includes('Point') &&
                symbolData.classificationType.toUpperCase() == 'SINGLESYMBOL') {
      style = {
        color: this.mapService.verify(symbolData.properties.color, 'color'),
        fillColor: this.mapService.verify(symbolData.properties.fillColor, 'fillColor'),
        fillOpacity: this.mapService.verify(symbolData.properties.fillOpacity, 'fillOpacity'),
        opacity: this.mapService.verify(symbolData.properties.opacity, 'opacity'),
        radius: this.mapService.verify(parseInt(symbolData.properties.symbolSize), 'size'),
        stroke: symbolData.properties.outlineColor == "" ? false : true,
        shape: this.mapService.verify(symbolData.properties.symbolShape, 'shape'),
        weight: this.mapService.verify(parseInt(symbolData.properties.weight), 'weight')
      }
      
    } else if (layerData.geometryType.includes('Point') &&
                  symbolData.classificationType.toUpperCase() == 'CATEGORIZED') {
      style = {
        color: symbolData.properties.color,
        fillOpacity: symbolData.properties.fillOpacity,
        opacity: symbolData.properties.opacity,
        radius: parseInt(symbolData.properties.symbolSize),
        stroke: symbolData.properties.outlineColor == "" ? false : true,
        shape: symbolData.properties.symbolShape,
        weight: parseInt(symbolData.properties.weight)
      }
    } else if (layerData.geometryType.includes('LineString')) {
      style = {
        color: this.mapService.verify(symbolData.properties.color, 'color'),
        fillColor: this.mapService.verify(symbolData.properties.fillColor, 'fillColor'),
        fillOpacity: this.mapService.verify(symbolData.properties.fillOpacity, 'fillOpacity'),
        opacity: this.mapService.verify(symbolData.properties.opacity, 'opacity'),
        weight: this.mapService.verify(parseInt(symbolData.properties.weight), 'weight')
      }
    } else if (layerData.geometryType.includes('Polygon')) {      
      style = {
        color: this.mapService.verify(symbolData.properties.color, 'color'),
        fillColor: this.mapService.verify(symbolData.properties.fillColor, 'fillColor'),
        fillOpacity: this.mapService.verify(symbolData.properties.fillOpacity, 'fillOpacity'),
        opacity: this.mapService.verify(symbolData.properties.opacity, 'opacity'),
        stroke: symbolData.properties.outlineColor == "" ? false : true,
        weight: this.mapService.verify(parseInt(symbolData.properties.weight), 'weight')
      }
    }
    return style;

  }

  /**
   * Goes through each feature in the selected layer and assigns an arbitrary hex number color to display both on the map
   * and the legend. NOTE: There cannot be more than 16 default colors for the Info Mapper.
   * @returns an string array containing the feature label, followed by the feature color e.g. colorTable = ['Bear Creek', '#003cb3'];
   * @param features An array of all features of the selected layer
   * @param symbol The symbol object containing data about the selected layer
   */
  private assignColor(features: any[], symbol: any): string[] {
    let colors: string[] = MapService.defaultColorTable;
    let colorTable: any[] = [];
    
    // Before the classification attribute is used, check to see if it exists,
    // and complain if it doesn't.
    if (!features[0]['properties'][symbol.classificationAttribute]) {
      console.error("The classification file property 'classificationAttribute' value",
      features[0]['properties'][symbol.classificationAttribute],
      "was not found. Confirm that the specified attribute exists in the layer attribute table.");
    }   

    // TODO: jpkeahey 2020.04.30 - Let people know that no more than 16 default
    // colors can be used
    for (let i = 0; i < features.length; i++) {
      if (typeof features[i]['properties'][symbol.classificationAttribute] == 'string') {
        colorTable.push(features[i]['properties'][symbol.classificationAttribute].toUpperCase());
      }
      else {
        colorTable.push(features[i]['properties'][symbol.classificationAttribute]);
      }
      colorTable.push(colors[i]);
    }    
    return colorTable;
  }

  /**
   * A CSV classification file is given by the user, so use that to create the colorTable to add to the categorizedLayerColor
   * array for creating the legend colors.
   * @param results An array of objects containing information from each row in the CSV file
   * @param geoLayerId The geoLayerId of the given layer. Used for creating legend colors
   */
  private assignFileColor(results: any[], geoLayerId: string) {    
    let colorTable: any[] = [];
    for (let i = 0; i < results.length; i++) {
      colorTable.push(results[i]['label']);
      colorTable.push(results[i]['color']);
    }

    if (this.categorizedLayerColor[geoLayerId]) {
      this.categorizedLayerColor[geoLayerId] = colorTable;      
    }    
  }

  // TODO: jpkeahey 2020.07.20 - This isn't being used, and therefore the legend colors aren't being set. What to do?
  /**
   * If no color table is given, create your own for populating the legend colors
   * @param features All features on the Leaflet layer
   * @param symbol The geoLayerSymbol data from the geoLayer
   */
  private assignLegendColor(features: any[], symbol: any) {
    let colors: string[] = MapService.defaultColorTable;
    let colorTable: any[] = [];
    // TODO: jpkeahey 2020.04.30 - Make sure you take care of more than 16
    for (let i = 0; i < features.length; i++) {
      colorTable.push(symbol.classificationAttribute + ' ' +
                      features[i]['properties'][symbol.classificationAttribute]);
      colorTable.push(colors[i]);
    }
    return colorTable;
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

    this.mapService.resetLayerOrder();

    // Create background layers dynamically from the configuration file.
    let backgroundLayers: any[] = this.mapService.getBackgroundLayers();
    backgroundLayers.forEach((backgroundLayer) => {
      let leafletLayer = L.tileLayer(backgroundLayer.sourcePath, {
        attribution: backgroundLayer.properties.attribution,
      });      
      this.baseMaps[this.mapService.getBackgroundGeoLayerViewNameFromId(backgroundLayer.geoLayerId)] = leafletLayer;
    });

    // Create a Leaflet Map; set the default layers that appear on initialization
    this.mainMap = L.map('mapid', {
        layers: [this.baseMaps[this.mapService.getDefaultBackgroundLayer()]],
        // We're using our own zoom control for the map, so we don't need the default
        zoomControl: false,
        wheelPxPerZoomLevel: 150,
        zoomSnap: 0.1
    });
    // Retrieve the initial extent from the config file and set the map view
    let extentInitial = this.mapService.getExtentInitial();    
    this.mainMap.setView([extentInitial[1], extentInitial[0]], extentInitial[2]);
    
    // Set the default layer radio check to true
    this.setDefaultBackgroundLayer();

    // Add layers to the map
    if (this.mapService.getBackgroundLayersMapControl()) {
      L.control.layers(this.baseMaps).addTo(this.mainMap);
    }

    this.mainMap.on('baselayerchange', (backgroundLayer: any) => {
      this.setBackgroundLayer(backgroundLayer.name);
    });

    // Get the map name from the config file.
    let mapName: string = this.mapService.getName();
    /* Add a title to the map */
    let mapTitle = L.control({position: 'topleft'});
    mapTitle.onAdd = function () {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
    mapTitle.update = function (props: any) {
        this._div.innerHTML = ('<div id="title-card"><h4>' + mapName + '</h4>');
    };
    mapTitle.addTo(this.mainMap);

    // Add home and zoom in/zoom out control to the top right corner
    L.Control.zoomHome({
      position: 'topright',
      zoomHomeTitle: 'Zoom to initial extent'
    }).addTo(this.mainMap);

    // Show the lat and lang of mouse position in the bottom left corner
    L.control.mousePosition({position: 'bottomleft',
      lngFormatter: (num: any) => {
          let direction = (num < 0) ? 'W' : 'E';
          let formatted = Math.abs(L.Util.formatNum(num, 6)) + '&deg ' + direction;
          return formatted;
      },
      latFormatter: (num: any) => {
          let direction = (num < 0) ? 'S' : 'N';
          let formatted = Math.abs(L.Util.formatNum(num, 6)) + '&deg ' + direction;
          return formatted;
      }}).addTo(this.mainMap);

    /* Bottom Right corner. This shows the scale in km and miles of
    the map. */
    L.control.scale({position: 'bottomleft',imperial: true}).addTo(this.mainMap);

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

          // Displays a raster layer on the Leaflet map by using the third-party package 'georaster-layer-for-leaflet'
          if (geoLayer.layerType.toUpperCase().includes('RASTER')) {
            this.createRasterLayer(geoLayer, symbol);
            // Since a raster was already created for the layer, we can skip doing anything else and go to the next geoLayerView
            continue;
          }

          if (geoLayer.layerType.toUpperCase().includes('VECTOR')) {
            asyncData.push(this.appService.getJSONData(this.appService.buildPath('geoLayerGeoJsonPath', [geoLayer.sourcePath])));
          }
          // Push each event handler onto the async array if there are any
          if (eventHandlers.length > 0) {            
            eventHandlers.forEach((event: any) => {
              if (event.properties.popupConfigPath) {
                asyncData.push(
                  this.appService.getJSONData(this.appService.buildPath('popupConfigPath', [event.properties.popupConfigPath]))
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
            var allFeatures: any = results[0];
            var eventObject: any = {};
            var ogLayerStyleObject: any;

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
              
              var data = L.geoJson(allFeatures, {
                  onEachFeature: onEachFeature,
                  style: this.addStyle(allFeatures, geoLayer)
              }).addTo(this.mainMap);

              this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data._leaflet_id);              

              this.mapLayers.push(data);
              this.mapLayerIds.push(geoLayer.geoLayerId);

              this.mapService.setLayerOrder(this.mainMap, L);
            } 
            // If the layer is a CATEGORIZED POLYGON, create it here
            else if (geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
              symbol.classificationType.toUpperCase().includes('CATEGORIZED')) {
              // TODO: jpkeahey 2020.05.01 - This function is inline. Using addStyle does
              // not work. Try to fix later. This is if a classificationFile property exists

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
                      this.addCategorizedLayer(allFeatures, geoLayerViewGroup.geoLayerViewGroupId,
                                              this.mapService.getLayerViewFromId(geoLayer.geoLayerId),
                                              result.data, i);
                    }
                  });
                
              } else {                
                // Default color table is made here
                let colorTable = this.assignColor(allFeatures.features, symbol);
                this.categorizedLayerColor[geoLayer.geoLayerId] = colorTable;
                
                // If there is no classificationFile, create a default colorTable
                let data = L.geoJson(allFeatures, {
                  onEachFeature: onEachFeature,
                  style: (feature: any, layerData: any) => {                    
                    let classificationAttribute: any = feature['properties'][symbol.classificationAttribute];
                      return {
                        color: this.mapService.verify(this.getColor(layerData, symbol, classificationAttribute, colorTable), 'color'),
                        fillOpacity: this.mapService.verify(symbol.properties.fillOpacity, 'fillOpacity'),
                        opacity: this.mapService.verify(symbol.properties.opacity, 'opacity'),
                        stroke: symbol.properties.outlineColor == "" ? false : true,
                        weight: this.mapService.verify(parseInt(symbol.properties.weight), 'weight')
                      }
                  }
                }).addTo(this.mainMap);

                this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data._leaflet_id);
                this.mapLayers.push(data);
                this.mapLayerIds.push(geoLayer.geoLayerId);

                this.mapService.setLayerOrder(this.mainMap, L);
              }
            }
            // Display a leaflet marker or custom point/SHAPEMARKER
            else {
              
              var data = L.geoJson(allFeatures, {
                pointToLayer: (feature: any, latlng: any) => {
                  // Create a shapemarker layer
                  if (geoLayer.geometryType.includes('Point') &&
                      !symbol.properties.symbolImage &&
                      !symbol.properties.builtinSymbolImage) {

                    return L.shapeMarker(latlng,
                    this.addStyle(feature, geoLayer));
                  }
                  // Create a user-provided marker image layer
                  else if (symbol.properties.symbolImage) {
                    let markerIcon = L.icon({
                      iconUrl: this.appService.getAppPath() + this.mapService.formatPath(symbol.properties.symbolImage, 'symbolImage')
                    });
                    return L.marker(latlng, { icon: markerIcon });
                  }
                  // Create a built-in (default) marker image layer
                  else if (symbol.properties.builtinSymbolImage) {
             
                    // TODO: jpkeahey 2020.07.09 - This successfully creates results after waiting for the image dimensions from
                    // window.onload, but making this pointToLayer function asynchronous creates issues for the onEachFeature
                    // function for some reason.
                    // let results = await test();
                    // console.log(results);
                    

                    let markerIcon = new L.icon({
                      iconUrl: this.mapService.formatPath(symbol.properties.builtinSymbolImage, 'builtinSymbolImage')
                      // iconAnchor: [13, 41]
                    });
                    return L.marker(latlng, { icon: markerIcon })
                  }
                },
                onEachFeature: onEachFeature 
              }).addTo(this.mainMap);
              
              this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data._leaflet_id);
              this.mapLayers.push(data);
              this.mapLayerIds.push(geoLayer.geoLayerId);
              
              this.mapService.setLayerOrder(this.mainMap, L);
            }
            // Check if refresh
            // let refreshTime: string[] = this.mapService.getRefreshTime(geoLayer.geoLayerId ? geoLayer.geoLayerId : geoLayer.geoLayerId)
            // if (!(refreshTime.length == 1 && refreshTime[0] == "")) {
            //   this.addRefreshDisplay(refreshTime, geoLayer.geoLayerId);
            // }

            function test() {
              
              return new Promise(function(resolve, reject) {
                var height: number, width: number;
                var path = 'assets/app-default/' +
                                symbol.properties.builtinSymbolImage.substring(1);

                var markerImage = new Image();
                markerImage.name = path;              
                markerImage.onload = function findHeightWidth() {
                  height = markerImage.height;
                  width = markerImage.width;
                  resolve({height: height, width: width});
                  reject('Uh oh! Something went wrong with the asynchronous call');
                };
                markerImage.src = path;
              });
                      
            }

            /**
             * While the end of the value string from the graph template file hasn't ended yet, look for the '${' start
             * that we need and build the property, adding it to the propertyArray when we've detected the end of the
             * property. Find each one in the value until the value line is done.
             * @param key In order to provide a better console warning, we bring the key from replaceProperties()
             * @param value The line being read from the graph template file that contains the ${ } property.
             * @param featureProperties 
             */
            function obtainPropertiesFromLine(key: any, value: string, featureProperties: Object): string {

              var propertyString = '';
              var valueLength = 0;
              var formattedValue = '';

              while (valueLength < value.length) {
                if (value[valueLength] && value[valueLength + 1] && value[valueLength] === '$' && value[valueLength + 1] === '{') {
                  valueLength = valueLength + 2;
                  for (let i = valueLength; i < value.length; i++) {
                    if (value[i] !== '}') {
                      propertyString += value[i];
                      valueLength++;
                    } else if (value[i] === '}') {
                      valueLength++;
                      break;
                    }
                  }
                  // You have gone through everything inside the ${property} format and gotten the string. Split
                  // by the colon and now we have our true property. I might have to use the throwaway variable later
                  let throwaway = propertyString.split(':')[0];
                  let prop = propertyString.split(':')[1];
                  
                  if (prop === undefined) {
                    console.warn('A property of the [' + key + '] attribute in the graph template file is incorrectly formatted. ' +
                    'This might cause an error in retrieving the graph, or other unintended output on the graph.');
                  }
                  formattedValue += featureProperties[prop];
                  propertyString = '';
                }
                if (value[valueLength] !== undefined) {
                  formattedValue += value[valueLength];
                  valueLength++;
                }
                
              }
              return formattedValue;
            }

            /**
             * This is a recursive function that goes through an object and replaces any value in
             * it that contain the ${property} notation with the actual property needed.
             * @param templateObject The object that will translate from the StateMod file to Chart.js
             * @param featureProperties The properties in the selected feature on the map layer.
             */
            function replaceProperties(templateObject: Object, featureProperties: Object): Object {

              for (var key in templateObject) {
                var value = templateObject[key];
                if (typeof value === 'object') {
                  replaceProperties(value, featureProperties);
                } else {
                  if (value.includes("${")) {
                    let formattedValue = obtainPropertiesFromLine(key, value, featureProperties);
                    
                    try {
                      templateObject[key] = formattedValue;
                    } catch ( e ) {
                      templateObject[key] = value;
                    }
                  }
                }
              }
              if (templateObject['product'] || templateObject['id'])
                return templateObject;
            }

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
                        mouseover: updateTitleCard,
                        mouseout: removeTitleCard,
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
                          var popupTemplateId = eventObject[eventHandler.eventType + '-popupConfigPath'].id;
                          
                          // Replaces any properties in ${featureAttribute:} notation
                          replaceProperties(eventObject[eventHandler.eventType + '-popupConfigPath'], featureProperties);                          

                          for (let action of eventObject[eventHandler.eventType + '-popupConfigPath'].actions) { 
                            
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
                                console.log(fullResourcePath);

                                _this.appService.getPlainText(fullResourcePath, 'resourcePath').subscribe((text: any) => {
                                  showText(dialog, text);
                                });
                              } 
                              // Display a Time Series graph in a Dialog popup
                              else if (actionArray[i] === 'displayTimeSeries') {
                                
                                let fullResourcePath = _this.appService.buildPath('resourcePath', [resourcePathArray[i]]);
                                console.log(fullResourcePath);
                                
                                _this.appService.getJSONData(fullResourcePath).subscribe((graphTemplateObject: Object) => {
                                  
                                  replaceProperties(graphTemplateObject, featureProperties);

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

                                  showGraph(dialog, graphTemplateObject, graphFilePath, TSID_Location, chartPackageArray[i]);
                                });
                              }
                              // If the attribute is neither displayTimeSeries nor displayText
                              else {
                                console.error('Action attribute is not supplied or incorrect. Please specify either "displayText" or "displayTimeSeries" as the action.')
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
                            mouseover: updateTitleCard,
                            mouseout: removeTitleCard
                          });
                          break;
                      }
                      break;
                    default:
                      layer.on({
                        mouseover: updateTitleCard,
                        mouseout: removeTitleCard
                      });
                      break;
                  }  
                });
              } else {
                ogLayerStyleObject = layer.options.style;

                  // If the map config does NOT have any event handlers, use a default
                  layer.on({
                  mouseover: updateTitleCard,
                  mouseout: removeTitleCard,
                  click: ((e: any) => {
                    
                    // TODO: jpkeahey 2020.07.09 - Find a way to keep highlighted yellow on click.
                    // if (geoLayer.geometryType.includes('LineString')) {
                    //   let layer = e.target;
                    //   layer.setStyle({
                    //     color: 'yellow'
                    //   });
                    // }

                    var divContents: string = '';
                    // Go through each property and write the correct html for displaying
                    for (let property in e.target.feature.properties) {
                      if (typeof e.target.feature.properties[property] == 'string') {
                        if (e.target.feature.properties[property].startsWith("http://") ||
                            e.target.feature.properties[property].startsWith("https://")) {
                          // If the value is a http or https link, convert it to one
                          divContents += '<b>' + property + ':</b> ' +
                          "<a href='" +
                          encodeURI(e.target.feature.properties[property]) + "' target=_blank'" +
                          "'>" +
                          truncateURL(e.target.feature.properties[property]) +
                          "</a>" +
                          "<br>";
                          
                        } else { // Display a regular non-link string in the popup
                            divContents += '<b>' + property + ':</b> ' +
                                    e.target.feature.properties[property] + '<br>';
                        }
                      } else { // Display a non-string in the popup
                        divContents += '<b>' + property + ':</b> ' +
                                    e.target.feature.properties[property] + '<br>';
                      }         
                    }
                    // class="btn btn-light btn-sm btn-block" <- Nicer buttons

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

              function truncateURL(url: string): string {
                var truncatedURL = '';

                // This puts the three periods in the URL. Not used at the moment
                // // Return the entire URL if it's shorter than 25 letters; That should be short enough
                // if (url.length < 31) return url;

                // for (let letter of url) {
                //   if (truncatedURL.length < 26)
                //     truncatedURL += letter;
                // }
                // // Add the three periods, and then the last three letters in the original URL
                // truncatedURL += '...';
                // for (let i = 10; i > 0; i--) {
                //   truncatedURL += url[url.length - i]
                // }
                // return truncatedURL;

                // This adds an arbitrary break after the 45th letter in the URL.
                for (let i = 0; i < url.length; i++) {
                  if (i == 45) {
                    truncatedURL += '<br>';
                    truncatedURL += url[i];
                  } else {
                    truncatedURL += url[i];
                  }
                }
                return truncatedURL;
              }
            }

            /**
             * Creates the Dialog object to show the graph in and passes the info needed for it.
             * @param dialog The dialog object needed to create the Dialog popup
             * @param graphTemplateObject The template config object of the current graph being shown
             * @param graphFilePath The file path to the current graph that needs to be read
             */
            function showGraph(dialog: any, graphTemplateObject: any, graphFilePath: string, TSID_Location: string, chartPackage: string): void {
              // Create and use a MatDialogConfig object to pass the data we need for the graph that will be shown
              const dialogConfig = new MatDialogConfig();
              dialogConfig.data = {
                chartPackage: chartPackage,
                graphTemplate: graphTemplateObject,
                graphFilePath: graphFilePath,
                TSID_Location: TSID_Location
              }
              const dialogRef = dialog.open(DialogContent, {
                data: dialogConfig,
                panelClass: 'custom-dialog-container'
              });
            }

            /**
             * Creates a Dialog object to show a plain text file and passes the info needed for it.
             * @param dialog The dialog object needed to create the Dialog popup
             * @param text The text retrieved from the text file to display in the Dialog Content popup
             */
            function showText(dialog: any, text: any): void {

              const dialogConfig = new MatDialogConfig();
              dialogConfig.data = {
                text: text
              }
              const dialogRef = dialog.open(DialogContent, {
                data: dialogConfig,
                panelClass: 'custom-dialog-container'
              });
            }

            function updateTitleCard(e: any) {      
              if (geoLayer.geometryType.toUpperCase().includes('LINESTRING')) {
                let layer = e.target;
                layer.setStyle({
                  color: 'yellow'
                });
              }
                  
              // // These lines bold the outline of a selected feature
              // if (geoLayer.geometryType.toUpperCase().includes('POLYGON')) {
                
              //   let layer = e.target;
              //   layer.setStyle({
              //     weight: 2.5
              //   });
              //   layer.bringToFront();
              // }
              

              // Update the main title name up top by using the geoLayerView name
              let div = document.getElementById('title-card');

              let featureProperties: any = e.target.feature.properties;
              let instruction = "Click on a feature for more information";

              let divContents = '<h4 id="geoLayerView">' + geoLayerViewGroup.geoLayerViews[i].name + '</h4>' + '<p id="point-info"></p>';

              for (let prop in featureProperties) {
                divContents += '<b>' + prop + '</b>' + ': ' + featureProperties[prop] + '<br>';
              }
              if (instruction != "") {
                divContents += ('<hr/>' + '<p><i>' + instruction + '</i></p>');
              }
              // Once all properties are added to divContents, display them
              div.innerHTML = divContents;
              
            }

            function removeTitleCard(e: any) {
              
              if (geoLayer.geometryType.includes('LineString')) {
                let layer = e.target;
                layer.setStyle(ogLayerStyleObject);
              }
              // TODO: jpkeahey 2020.05.18 - This tries to de-bold the outline of a feature
              // when a user hovers away to restore the style to its previous state
              // e.target.setStyle({
              //   weight: 1.5
              // });
              let div = document.getElementById('title-card');
              let instruction: string = "Move over or click on a feature for more information";
              let divContents: string = "";
            
              divContents = ('<h4 id="geoLayerView">' + _this.mapService.getName() + '</h4>' + '<p id="point-info"></p>');
              if (instruction != "") {
                divContents += ('<hr/>' + '<p><i>' + instruction + '</i></p>');
              }
              div.innerHTML = divContents;
            }
          });
        }
      }
    });

    // If the sidebar has not already been initialized once then do so.
    if (this.sidebar_initialized == false) { this.createSidebar(); }
  }

  /**
   * Asynchronously creates a raster layer on the Leaflet map.
   * @param geoLayer The geoLayer object from the map configuration file
   * @param symbol The Symbol data object from the geoLayerView
   */
  private createRasterLayer(geoLayer: any, symbol: any, ): void {
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
                var _this = this;

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
                        let conversion = hexToRGB(line.fillColor);
                        
                        return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
                      }
                    }

                    for (let line of result.data) {
                      if (line.value === '*') {
                        if (line.fillColor && !line.fillOpacity) {
                          let conversion = hexToRGB(line.fillColor);
                        
                          return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, 0.7)`;
                        } else if (!line.fillColor && line.fillOpacity) {
                          return `rgba(0, 0, 0, ${line.fillOpacity})`;
                        } else
                        return `rgba(0, 0, 0, 0.6)`;
                      }
                    }
                  }
                });

                // Code from user Tim Down @ https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
                // Takes a hex string ('#b30000') and converts to rgb (179, 0, 0)
                function hexToRGB(hex: string) {
                  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
                  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                    return r + r + g + g + b + b;
                  });

                  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                  return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                  } : null;

                }

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

  // Get the color for the symbolShape
  private getColor(layerData: any, symbol: any, strVal: string, colorTable: any) {
    
    switch (symbol.classificationType.toUpperCase()) {
      case "SINGLESYMBOL":
        return symbol.color;
      // TODO: jpkeahey 2020.04.29 - Categorized might be hard-coded
      case "CATEGORIZED":
        var color: string = 'gray';      
          for(let i = 0; i < colorTable.length; i++) {
            if (colorTable[i] == strVal) {                                                              
              color = colorTable[i+1];
            }
          }
        return color;
      // TODO: jpkeahey 2020.07.07 - This has not yet been implemented
      case "GRADUATED":
        return;
    } 
    return symbol.color;
  }

  /**
   * @returns the geometryType of the current geoLayer to determine what shape should be drawn in the legend
   * @param geoLayerId The id of the current geoLayer
   */
  public getGeometryType(geoLayerId: string): any { return this.mapService.getGeometryType(geoLayerId); }

  /**
   * This is called by the map.component.html template file so it knows the path to the given imageSymbol
   * or builtinImageSymbol so it can display it in the legend
   * @param symbol The geoLayerSymbol object from the current geoLayer
   */
  public imageSrc(symbol: any): string {
    
    if (symbol.properties.symbolImage) {
      return this.appService.buildPath('symbolImage', [symbol.properties.symbolImage]);
    }
    if (symbol.properties.builtinSymbolImage) {
      return this.appService.buildPath('builtinSymbolImage', [symbol.properties.builtinSymbolImage]);
    }
  }

  /**
   * This function is called on initialization of the map component.
   */
  public ngAfterViewInit() {
    // When the parameters in the URL are changed the map will refresh and load
    // according to new configuration data
    this.routeSubscription$ = this.activeRoute.params.subscribe(() => {

      this.resetMapVariables();

      let id: string = this.route.snapshot.paramMap.get('id');
      
      // TODO: jpkeahey 2020.05.13 - This helps show how the map config path isn't set on a hard refresh because of async issues
      // Loads data from config file and calls loadComponent when the mapConfig is defined
      // The path plus the file name 
      setTimeout(() => {
        
        this.mapConfigSubscription$ = this.appService.getJSONData(this.appService.getAppPath() +
                                                                  this.mapService.getFullMapConfigPath(id))
                                                                  .subscribe(
          (mapConfig: any) => {
            // Set the configuration file class variable for the map service
            this.mapService.setMapConfig(mapConfig);
            // Add components to the sidebar
            this.addLayerToSidebar(mapConfig);
            // Create the map.
            this.buildMap();
          }
        );
      }, 350);
    });

  }

  public ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.routeSubscription$.unsubscribe();
    this.forkJoinSubscription$.unsubscribe();
    this.mapConfigSubscription$.unsubscribe();
  }

  /**
   * Refreshes and/or reinitializes map global variables when a new map component instance is created
   */
  private resetMapVariables(): void {

      // First clear the map
      if (this.mapInitialized === true) this.mainMap.remove();

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
  public showLayerDoc(docPath: string): void {
    // Needed so the scope of the map component reference can be used in the jquery code
    var _this = this;
    var text: boolean, markdown: boolean, html: boolean;
    // This is needed to unbind the click handler from the div, or else events will be added every time the doc button is pressed
    $('.doc-button').unbind('click');
    // Adds the event for clicking, and depending on whether it was normal or ctl-click, do different things
    $( '.doc-button' ).on( 'click', function( event ) {
      if ( event.ctrlKey ) {
        // Ctrl + click
        console.log('Ctl-click');
          
      } else {
        // Normal click

        if (docPath.includes('.txt')) text = true;
        else if (docPath.includes('.md')) markdown = true;
        else if (docPath.includes('.html')) html = true;

        _this.appService.getPlainText(_this.appService.buildPath('docPath', [docPath]), 'Documentation')
        .pipe(take(1))
        .subscribe((doc: any) => {

          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = {
            doc: doc,
            docText: text,
            docMarkdown: markdown,
            docHtml: html
          }
          
          _this.route.queryParams
          .pipe(take(1))
          .subscribe((params) => {
            
            var dialogRef: any;
            if (params['dialog']) {
              dialogRef = _this.dialog.open(DialogContent, {
                data: dialogConfig,
                panelClass: 'custom-dialog-container'
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
   * Style's the current legend object in the sidebar legend.
   * @param symbolData The display data for the current legend object
   * @param styleType A string or character differentiating between single symbol, categorized, and graduated style legend objects
   */
  public styleObject(symbolData: any, styleType: string): Object {

    switch(styleType) {
      case 'ss':
        return {
          fill: this.mapService.verify(symbolData.properties.fillColor, 'fillColor'),
          fillOpacity: this.mapService.verify(symbolData.properties.fillOpacity, 'fillOpacity'),
          stroke: this.mapService.verify(symbolData.properties.color, 'color')
        }
      case 'c':
        return;
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
