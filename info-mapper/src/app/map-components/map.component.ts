import { Component,
          ComponentFactoryResolver,
          OnInit,
          QueryList,
          ViewChild,
          ViewChildren,
          ViewContainerRef,
          ViewEncapsulation,
          AfterViewInit}        from '@angular/core';

import { ActivatedRoute }           from '@angular/router';

import * as $                       from "jquery";
import * as Papa                    from 'papaparse';
import                                   'chartjs-plugin-zoom';

import { forkJoin }                 from 'rxjs';
import { MatDialog,
          MatDialogConfig }         from '@angular/material/dialog';

import { BackgroundLayerComponent } from './background-layer-control/background-layer.component';
import { DialogContent }            from './dialog-content/dialog-content.component';
import { MapLayerComponent }        from './map-layer-control/map-layer.component';
import { SidePanelInfoComponent }   from './sidepanel-info/sidepanel-info.component';

import { BackgroundLayerDirective } from './background-layer-control/background-layer.directive';
import { LegendSymbolsDirective }   from './legend-symbols/legend-symbols.directive'
import { MapLayerDirective }        from './map-layer-control/map-layer.directive';
import { SidePanelInfoDirective }   from './sidepanel-info/sidepanel-info.directive';

import { AppService }               from '../app.service';
import { MapService }               from './map.service';


// Needed to use leaflet L class
declare var L: any;
// Needed to use Rainbow class
// declare var Rainbow: any;


@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit {

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
  // A global reference for the leaflet map.
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

  // Time interval used for resetting the map after a specified time, if defined in
  // configuration file.
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

  // A variable to indicate which background layer is currently displayed on the map.
  currentBackgroundLayer: string;

  // A list of map layer objects for ease of adding or removing the layers on the map.
  mapLayers = [];
  // A list of the id's associated with each map layer
  mapLayerIds = [];
  // The object that holds the base maps that populates the leaflet sidebar
  baseMaps: any = {};

  dataList: any[];

  mapConfigFile: any;

  realLayerViews: any;

  graphCSVFilePath: string = '';

  // Used to hold names of the data classified as 'categorized'. Will be used for the map legend/key.
  categorizedKeyNames: string[] = [];
  // Used to hold colors of the data classified as 'categorized'. Will be used for the map legend/key.
  categorizedKeyColors = [];

  categorizedClassificationField = [];

  categorizedLayerColor = {};


  /**
   * 
   * @param route Used for getting the parameter 'id' passed in by the url and from the router
   * @param componentFactoryResolver Adding components dynamically
   * @param appService A reference to the top level application service
   * @param mapService A reference to the map service, for sending data
   * @param activeRoute Used for routing in the app
   * @param dialog A reference to the MatDialog for creating and displaying a popup with a chart
   */
  constructor(private route: ActivatedRoute, 
              private componentFactoryResolver: ComponentFactoryResolver,
              private appService: AppService,
              public mapService: MapService, 
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog) { }


  /**
   * Add the categorized layer to the map by reading in a CSV file as the colorTable
   * @param allFeatures 
   * @param mapLayerData 
   * @param symbol 
   * @param layerView 
   * @param results 
   */
  addCategorizedLayer(allFeatures: any, mapLayerData: any, geoLayerViewGroupId: string,
                      symbol: any, layerView: any, results: any, layerIndex: number) {

    var mapService = this.mapService;
    
    let data = L.geoJson(allFeatures, {
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
          let div = document.getElementById('title-card');
          let featureProperties: any = e.target.feature.properties;
          let instruction: string = "Click on a feature for more information";

          let divContents = '<h4 id="geoLayerView">' + layerView.name + '</h4>' + '<p id="point-info"></p>';

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
      style: (feature: any, layerData: any) => {

        // Before the classification attribute is used, check to see if it exists,
        // and complain if it doesn't.
        if (!feature['properties'][symbol.classificationAttribute]) {
          console.error("The classification file property 'classificationAttribute' value '" +
          symbol.classificationAttribute +
          "' was not found. Confirm that the specified attribute exists in the layer attribute table.");
        }
        // The classification file property 'classificationAttribute' value 'DIVISION' was not found. Confirm that the specified
        // attribute exists in the layer attribute table.
        for (let i = 0; i < results.length; i++) {
          // If the classificationAttribute is a string, check to see if it's the same as the variable returned
          // from Papaparse. 
          if (typeof feature['properties'][symbol.classificationAttribute] == 'string' &&
              feature['properties'][symbol.classificationAttribute].toUpperCase() == results[i]['value'].toUpperCase()) {
            return {
              color: results[i]['color'],
              fillOpacity: results[i]['fillOpacity'],
              opacity: results[i]['opacity'],
              stroke: symbol.properties.outlineColor == "" ? false : true,
              weight: results[i]['weight']
            }
          }
          // If the classificationAttribute is a number, compare it with the results
          else if (feature['properties'][symbol.classificationAttribute] == results[i]['value']) {
            return {
              color: results[i]['color'],
              fillOpacity: results[i]['fillOpacity'],
              opacity: results[i]['opacity'],
              stroke: symbol.properties.outlineColor == "" ? false : true,
              weight: results[i]['weight']
            }
          }
        }
      }
    }).addTo(this.mainMap);

    this.mapService.addInitLayerToDrawOrder(geoLayerViewGroupId, layerIndex, data._leaflet_id);
    this.mapLayers.push(data);
    this.mapLayerIds.push(mapLayerData.geoLayerId);

    this.mapService.setLayerOrder(this.mainMap, L);
  }

  // Add content to the info tab of the sidebar. Following the example from Angular's
  // documentation found here: https://angular.io/guide/dynamic-component-loader
  addInfoToSidebar(): void {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(SidePanelInfoComponent);
    let infoViewContainerRef = this.InfoComp.viewContainerRef;
    let componentRef = infoViewContainerRef.createComponent(componentFactory);

    (<SidePanelInfoComponent>componentRef.instance).properties = this.mapService.getProperties();
    (<SidePanelInfoComponent>componentRef.instance).appVersion = this.mapService.appConfig.version;
  }

  // Dynamically add the layer information to the sidebar coming in from the map
  // configuration file
  addLayerToSidebar(configFile: any) {
    // reset the sidebar components so elements are added on top of each other
    this.resetSidebarComponents();

    var geoLayers: any;
    // Creates new layerToggle component in sideBar for each layer specified in
    // the config file, sets data based on map service.
    geoLayers = configFile.geoMaps[0].geoLayers;

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

    // This timeout is a band-aid for making sure the backgroundLayerComp.viewContainerRef
    // isn't undefined when creating the background layer components

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
    }, 750);
  }

  // Add the style to the features
  addStyle(feature: any, layerData: any): Object {
    
    let symbolData: any = this.mapService.getSymbolDataFromID(layerData.geoLayerId);

    if (symbolData.properties.symbolShape) {        
      symbolData.properties.symbolShape =
                              symbolData.properties.symbolShape.toLowerCase();        
    }
    
    let style: {} = {};

    if (layerData.geometryType.includes('Point') &&
                symbolData.classificationType.toUpperCase() == 'SINGLESYMBOL') {
      style = {
        color: validate(symbolData.properties.color, 'color'),
        fillColor: validate(symbolData.properties.fillColor, 'fillColor'),
        fillOpacity: validate(symbolData.properties.fillOpacity, 'fillOpacity'),
        opacity: validate(symbolData.properties.opacity, 'opacity'),
        radius: validate(parseInt(symbolData.properties.symbolSize), 'size'),
        stroke: symbolData.properties.outlineColor == "" ? false : true,
        shape: validate(symbolData.properties.symbolShape, 'shape'),
        weight: validate(parseInt(symbolData.properties.weight), 'weight')
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
        color: validate(symbolData.properties.color, 'color'),
        fillColor: validate(symbolData.properties.fillColor, 'fillColor'),
        fillOpacity: validate(symbolData.properties.fillOpacity, 'fillOpacity'),
        opacity: validate(symbolData.properties.opacity, 'opacity'),
        weight: validate(parseInt(symbolData.properties.weight), 'weight')
      }
    } else if (layerData.geometryType.includes('Polygon')) {      
      style = {
        color: validate(symbolData.properties.color, 'color'),
        fillColor: validate(symbolData.properties.fillColor, 'fillColor'),
        fillOpacity: validate(symbolData.properties.fillOpacity, 'fillOpacity'),
        opacity: validate(symbolData.properties.opacity, 'opacity'),
        stroke: symbolData.properties.outlineColor == "" ? false : true,
        weight: validate(parseInt(symbolData.properties.weight), 'weight')
      }
    }
    return style;

    function validate(styleProperty: any, styleType: string): any {
      // The property exists, so return it to be used in the style
      // TODO: jpkeahey 2020.06.15 - Maybe check to see if it's a correct property?
      if (styleProperty) {
        return styleProperty;
      } 
      // The property does not exist, so return a default value.
      else {
        switch (styleType) {
          case 'color': return 'gray';
          case 'fillOpacity': return '0.2';
          case 'fillColor': return 'gray';
          case 'opacity': return '1.0';
          case 'size': return 6;
          case 'shape': return 'circle';
          case 'weight': return 3;
        }
      }
    }

  }

  assignColor(features: any[], symbol: any) {
    let first: any = "#b30000";
    let second: any = "#ff6600";
    let third: any = "#ffb366";
    let fourth: any = "#ffff00";
    let fifth: any = "#59b300";
    let sixth: any = "#33cc33";
    let seventh: any = "#b3ff66";
    let eighth: any = "#00ffff";
    let ninth: any = "#66a3ff";
    let tenth: any = "#003cb3";
    let eleventh: any = "#3400b3";
    let twelfth: any = "#6a00b3";
    let thirteen: any = "#9b00b3";
    let fourteen: any = "#b30092";
    let fifteen: any = "#b30062";
    let sixteen: any = "#b30029";
    let colors: any[] = [first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth, eleventh, twelfth,
      thirteen, fourteen, fifteen, sixteen];
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
   * A color table CSV is given
   * @param results 
   */
  assignFileColor(results: any, geoLayerId: string) {
    let colorTable: any[] = [];
    for (let i = 0; i < results.length; i++) {
      colorTable.push(results[i]['label']);
      colorTable.push(results[i]['color']);
    }

    if (this.categorizedLayerColor[geoLayerId]) {
      this.categorizedLayerColor[geoLayerId] = colorTable;      
    }    
    this.categorizedKeyColors.push(colorTable);    
  }

  // If no color table is given, create your own
  assignLegendColor(features: any[], symbolData: any) {
    let first: any = "#b30000";
    let second: any = "#ff6600";
    let third: any = "#ffb366";
    let fourth: any = "#ffff00";
    let fifth: any = "#59b300";
    let sixth: any = "#33cc33";
    let seventh: any = "#b3ff66";
    let eighth: any = "#00ffff";
    let ninth: any = "#66a3ff";
    let tenth: any = "#003cb3";
    let eleventh: any = "#3400b3";
    let twelfth: any = "#6a00b3";
    let thirteen: any = "#9b00b3";
    let fourteen: any = "#b30092";
    let fifteen: any = "#b30062";
    let sixteen: any = "#b30029";
    let colors: any[] = [first, second, third, fourth, fifth, sixth, seventh,
    eighth, ninth, tenth, eleventh, twelfth, thirteen, fourteen, fifteen,
    sixteen];
    let colorTable: any[] = [];
    // TODO: jpkeahey 2020.04.30 - Make sure you take care of more than 16
    for (let i = 0; i < features.length; i++) {
      colorTable.push(symbolData.classificationAttribute + ' ' +
                      features[i]['properties'][symbolData.classificationAttribute]);
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
   * @param actionNumber 
   */
  buildPopupHTML(popupTemplateId: string, action: any, featureProperties: any, firstAction: boolean): string {

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

  // Build the map using leaflet and configuration data
  buildMap(): void {
    
    let _this = this;

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
    

    /* Add layers to the map */
    if (this.mapService.getBackgroundLayersMapControl()) {
      L.control.layers(this.baseMaps).addTo(this.mainMap);
    }

    this.mainMap.on('baselayerchange', (backgroundLayer: any) => {
      _this.setBackgroundLayer(backgroundLayer.name);
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
    L.Control.zoomHome({position: 'topright'}).addTo(this.mainMap);

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
      if (geoLayerViewGroup.properties.isBackground == undefined ||
          geoLayerViewGroup.properties.isBackground == 'false') {
        
        for (let i = 0; i < geoLayerViewGroup.geoLayerViews.length; i++) {
          // Obtain the geoLayer
          let mapLayerData: any = this.mapService.getGeoLayerFromId(geoLayerViewGroup.geoLayerViews[i].geoLayerId);
          
          // Obtain the symbol data
          let symbol: any = this.mapService.getSymbolDataFromID(mapLayerData.geoLayerId);
          // Obtain the event handler information from the geoLayerView      
          let eventHandlers: any = this.mapService.getGeoLayerViewEventHandler(mapLayerData.geoLayerId);
          
          var asyncData: any[] = [];
          // Push the retrieval of layer data onto the async array by appending the
          // appPath with the GeoJSONBasePath and the sourcePath to find where the
          // geoJSON file is to read.
          asyncData.push(this.mapService.getJSONData(this.mapService.getAppPath() +
                                                  this.mapService.getGeoJSONBasePath() +
                                                  mapLayerData.sourcePath));
          // Push each event handler onto the async array if there are any
          if (eventHandlers.length > 0) {            
            eventHandlers.forEach((eventHandler: any) => {
              if (eventHandler.properties.popupConfigPath) {
                asyncData.push(
                  this.mapService.getJSONData(this.mapService.getAppPath() +
                                              this.mapService.getMapConfigPath() +
                                              eventHandler.properties.popupConfigPath)
                );
              }
            });
          }
          
          // Use forkJoin to go through the array and be able to subscribe to every
          // element and get the response back in the results array when finished.
          forkJoin(asyncData).subscribe((results) => {

            // The scope of keyword this does not reach some of the leaflet functions
            // in functions. The new variable _this is created so we can still have a
            // reference to our service deeper into the leaflet layer.
            var _this = this;
            // Similarly, we create the 

            // The first element in the results array will always be the features
            // returned from the geoJSON file.
            var allFeatures: any = results[0];
            var eventObject: any = {};

            // Go through each event and assign the retrieved template output to each
            // event type in an eventObject
            if (eventHandlers.length > 0) {
              for (let i = 0; i < eventHandlers.length; i++) {
                eventObject[eventHandlers[i].eventType + '-popupConfigPath'] = results[i + 1];
              }
            }
                   
            // If the layer is a LINESTRING or SINGLESYMBOL POLYGON, create it here
            if (mapLayerData.geometryType.includes('LineString') ||
                mapLayerData.geometryType.includes('Polygon') &&
                symbol.classificationType.toUpperCase().includes('SINGLESYMBOL')) {
              
              var data = L.geoJson(allFeatures, {
                  onEachFeature: onEachFeature,
                  style: this.addStyle(allFeatures, mapLayerData)
              }).addTo(this.mainMap);

              this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data._leaflet_id);              

              this.mapLayers.push(data);
              this.mapLayerIds.push(mapLayerData.geoLayerId);

              _this.mapService.setLayerOrder(this.mainMap, L);
            } 
            // If the layer is a CATEGORIZED POLYGON, create it here
            else if (mapLayerData.geometryType.includes('Polygon') &&
              symbol.classificationType.toUpperCase().includes('CATEGORIZED')) {
              // TODO: jpkeahey 2020.05.01 - This function is inline. Using addStyle does
              // not work. Try to fix later. This is if a classificationFile property exists

              this.categorizedLayerColor[mapLayerData.geoLayerId] = [];
              
              if (symbol.properties.classificationFile) {

                Papa.parse(this.mapService.getAppPath() +
                            this.mapService.getMapConfigPath() +
                            symbol.properties.classificationFile,
                  {
                    delimiter: ",",
                    download: true,
                    comments: "#",
                    skipEmptyLines: true,
                    header: true,
                    complete: (result: any, file: any) => {
                      this.assignFileColor(result.data, mapLayerData.geoLayerId);
                      this.addCategorizedLayer(allFeatures, mapLayerData, geoLayerViewGroup.geoLayerViewGroupId, symbol,
                                              this.mapService.getLayerViewFromId(mapLayerData.geoLayerId),
                                              result.data, i);
                    }
                  });
                
              } else {
                // Default color table is made here
                let colorTable = this.assignColor(allFeatures.features, symbol);
                this.categorizedLayerColor[mapLayerData.geoLayerId] = colorTable;
                
                // If there is no classificationFile, create a default colorTable
                let data = L.geoJson(allFeatures, {
                  onEachFeature: onEachFeature,
                  style: (feature: any, layerData: any) => {
                    let classificationAttribute: any = feature['properties'][symbol.classificationAttribute];
                      return {
                        color: this.getColor(layerData, symbol, classificationAttribute, colorTable),
                        dashArray: symbol.properties.dashArray,
                        fillOpacity: symbol.properties.fillOpacity,
                        lineCap: symbol.properties.lineCap,
                        lineJoin: symbol.properties.lineJoin,
                        opacity: symbol.properties.opacity,
                        stroke: symbol.properties.outlineColor == "" ? false : true,
                        weight: parseInt(symbol.properties.weight)
                      }
                  }
                }).addTo(this.mainMap);

                this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data._leaflet_id);
                this.mapLayers.push(data);
                this.mapLayerIds.push(mapLayerData.geoLayerId);

                this.mapService.setLayerOrder(this.mainMap, L);
              }
            }
            // Display a leaflet marker or custom point/SHAPEMARKER
            else {

              var formattedSymbolImageURL: string;
              if (symbol.properties.builtinSymbolImage) {
                if (symbol.properties.builtinSymbolImage.startsWith('/')) {
                  formattedSymbolImageURL = symbol.properties.builtinSymbolImage.substring(1);
                } else
                    formattedSymbolImageURL = symbol.properties.builtinSymbolImage;
              }
              
              if (symbol.properties.symbolImage) {
                if (symbol.properties.symbolImage.startsWith('/')) {
                  formattedSymbolImageURL = symbol.properties.symbolImage.substring(1);
                } else {                      
                  formattedSymbolImageURL = symbol.properties.symbolImage;        
                }
              }
              
              var data = L.geoJson(allFeatures, {
                pointToLayer: (feature: any, latlng: any) => {
                  // Create a shapemarker layer
                  if (mapLayerData.geometryType.includes('Point') &&
                      !symbol.properties.symbolImage &&
                      !symbol.properties.builtinSymbolImage) {

                    return L.shapeMarker(latlng,
                    _this.addStyle(feature, mapLayerData));
                  }
                  // Create a user-provided marker image layer
                  else if (symbol.properties.symbolImage) {
                    let markerIcon = L.icon({
                      iconUrl: this.mapService.getAppPath() + formattedSymbolImageURL
                    });
                    return L.marker(latlng, { icon: markerIcon });
                  }
                  // Create a built-in (default) marker image layer
                  else if (symbol.properties.builtinSymbolImage) {
             
                    // TODO: jpkeahey 2020.06.17 - This test function tries to get the size
                    // of the marker image for offsetting its position, but there are async issues with it.
                    // test();

                    let markerIcon = L.icon({
                      iconUrl: 'assets/app-default/' + formattedSymbolImageURL
                    });
                    return L.marker(latlng, { icon: markerIcon })
                  }
                },
                onEachFeature: onEachFeature 
              }).addTo(this.mainMap);
              
              this.mapService.addInitLayerToDrawOrder(geoLayerViewGroup.geoLayerViewGroupId, i, data._leaflet_id);
              this.mapLayers.push(data);
              this.mapLayerIds.push(mapLayerData.geoLayerId);
              
              _this.mapService.setLayerOrder(this.mainMap, L);
            }
            // Check if refresh
            // let refreshTime: string[] = this.mapService.getRefreshTime(mapLayerData.geolayerId ? mapLayerData.geolayerId : mapLayerData.geoLayerId)
            // if (!(refreshTime.length == 1 && refreshTime[0] == "")) {
            //   this.addRefreshDisplay(refreshTime, mapLayerData.geoLayerId);
            // }

            async function test() {
              
              var height: number, width: number;
              var path = 'assets/app-default/' +
                              symbol.properties.builtinSymbolImage.substring(1);

              var markerImage = new Image();
              markerImage.name = path;              
              markerImage.onload = findHeightWidth;
              markerImage.src = path;

              function findHeightWidth() {
                height = markerImage.height;
                width = markerImage.width;  
                console.log(height);
                console.log(width);
                
                
                return new Promise(function(resolve, reject) {
                  resolve({height: height, width: width});
                });
              }
                      
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
             * it that contain the ${property} notation  with the actual property needed.
             * @param graphTemplateObject The object that will translate from the StateMod file to Chart.js
             * @param featureProperties The properties in the selected feature on the map layer.
             */
            function replaceProperties(graphTemplateObject: Object,
                                      featureProperties: Object): Object {

              for (var key in graphTemplateObject) {
                var value = graphTemplateObject[key];
                if (typeof value === 'object') {
                  replaceProperties(value, featureProperties);
                } else {
                  if (value.includes("${")) {
                    let formattedValue = obtainPropertiesFromLine(key, value, featureProperties);
                    
                    try {
                      graphTemplateObject[key] = formattedValue;
                    } catch ( e ) {
                      graphTemplateObject[key] = value;
                    }
                  }
                }
              }
              if (graphTemplateObject['product'])
                return graphTemplateObject;
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
                          var firstAction = true;
                          var numberOfActions = eventObject[eventHandler.eventType + '-popupConfigPath'].actions.length;
                          var actionNumber = 0;
                          var actionLabelArray = new Array<string>();
                          var graphFilePath: string;
                          var divContents = '';
                          var TSID_Location: string;
                          var productPathArray = new Array<string>();
                          var popupTemplateId = eventObject[eventHandler.eventType + '-popupConfigPath'].id;

                          for (let action of eventObject[eventHandler.eventType + '-popupConfigPath'].actions) { 
                            
                            productPathArray.push(action.productPath.startsWith('/') ? action.productPath.substring(1) : action.productPath);
                            actionLabelArray.push(action.label);
                            actionNumber++;

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

                              _this.mapService.getJSONData(_this.mapService.getAppPath() +
                                                            _this.mapService.getMapConfigPath() +
                                                            productPathArray[i]).subscribe((graphTemplateObject: Object) => {

                                graphTemplateObject = replaceProperties(graphTemplateObject, featureProperties);
                                                          
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

                                showGraph(dialog, graphTemplateObject, graphFilePath, TSID_Location);
                              });
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
                var ogLayerStyleObject = layer.options.style;

                  // If the map config does NOT have any event handlers, use a default
                  layer.on({
                  mouseover: updateTitleCard,
                  mouseout: removeTitleCard,
                  click: ((e: any) => {
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
                    popup.setLatLng(e.latlng).openOn(map);
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

                // This adds an arbitrary break after the 31st letter in the URL.
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
            function showGraph(dialog: any, graphTemplateObject: any, graphFilePath: string, TSID_Location: string): void {
              // Create and use a MatDialogConfig object to pass the data we need for the graph that will be shown
              const dialogConfig = new MatDialogConfig();
              dialogConfig.data = {
                graphTemplate: graphTemplateObject,
                graphFilePath: graphFilePath,
                TSID_Location: TSID_Location
              }
              const dialogRef = dialog.open(DialogContent, dialogConfig);
            }

            function updateTitleCard(e: any) {      
              // if (mapLayerData.geometryType.includes('LineString')) {
              //   let layer = e.target;
              //   layer.setStyle({
              //     color: 'yellow'
              //   });
              // }
                  
              // These lines bold the outline of a selected feature
              // let layer = e.target;
              // layer.setStyle({
              //   weight: 2.5
              // });

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
              
              // if (mapLayerData.geometryType.includes('LineString')) {
              //   let layer = e.target;
              //   layer.setStyle(ogLayerStyleObject);
              // }
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
    // The following map var needs to be able to access globally for onEachFeature();
    let map: any = this.mainMap;

    // If the sidebar has not already been initialized once then do so.
    if (this.sidebar_initialized == false) { this.createSidebar(); }    
  }

  checkNewLine(text: string): string{

    let formattedText: string = "<p>";
    // Search for new line character:
    for(let i = 0; i < text.length; i++) {
      let char: string = text.charAt(i);
      if (char == "\n") {
        formattedText += '<br/>';
      }
      else {
        formattedText += char;
      }
    }
    formattedText += "</p>";
    return formattedText;
  }

  // Create the sidebar on the left side of the map
  createSidebar(): void {
    this.sidebar_initialized = true;
    // create the sidebar instance and add it to the map
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

  // Show all the layers on the map if Show All Layers is clicked
  displayAll() : void{
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

  // Get the color for the symbolShape
  getColor(layerData: any, symbol: any, strVal: string, colorTable: any) {
    
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

  getGeometryType(id: string): any { return this.mapService.getGeometryType(id); }

  // Get the number of seconds from a time interval specified in the configuration file
  getSeconds(timeLength: number, timeInterval: string): number {
    if (timeInterval == "seconds") {
      return timeLength;
    }
    else if (timeInterval == "minutes") {
      return timeLength * 60;
    }
    else if (timeInterval == "hours") {
      return timeLength * 60 * 60;
    }
  }

  imageSrc(symbolData: any): string {
    
    if (symbolData.properties.symbolImage) {
      if (symbolData.properties.symbolImage.startsWith('/')) {
        return symbolData.properties.symbolImage.substring(1);
      } else return symbolData.properties.symbolImage;        
    }
    if (symbolData.properties.builtinSymbolImage) {
      if (symbolData.properties.builtinSymbolImage.startsWith('/')) {
        return symbolData.properties.builtinSymbolImage.substring(1);
      } else return symbolData.properties.builtinSymbolImage;
    }
    return 'img/default-marker.png';
  }

  isObject(val: any) {
    return typeof val === 'object';
  }

  /**
   * This function is called on initialization of the map component.
   */
  ngAfterViewInit() {
    // When the parameters in the URL are changed the map will refresh and load
    // according to new configuration data
    this.activeRoute.params.subscribe(() => {

      this.resetMapVariables();

      let id: string = this.route.snapshot.paramMap.get('id');
      
      // TODO: jpkeahey 2020.05.13 - This helps show how the map config path isn't set on a hard refresh because of async issues
      // console.log(this.mapService.getFullMapConfigPath());
      // Loads data from config file and calls loadComponent when the mapConfigFile is defined
      // The path plus the file name 
      setTimeout(() => {
        
        this.mapService.getJSONData(this.mapService.getAppPath() +
                                this.mapService.getFullMapConfigPath(id))
                                .subscribe(
          (mapConfigFile: any) => {
            // assign the configuration file for the map service
            this.mapService.setMapConfigFile(mapConfigFile);
            
            this.mapConfigFile = mapConfigFile;            
            // add components dynamically to sidebar
              this.addLayerToSidebar(mapConfigFile);
            // create the map.
              this.buildMap();
          }
        );
      }, 350);
    });

  }

  // Either open or close the refresh display if the refresh icon is set from the
  // configuration file
  openCloseRefreshDisplay(refreshIndicator: any, refreshIcon: any) {
    let _this = this;
    if (this.showRefresh) {
      refreshIndicator.remove();
      refreshIcon.addTo(this.mainMap);
      this.showRefresh = false;
    } else {
      refreshIcon.remove();
      refreshIndicator.addTo(this.mainMap);
      this.showRefresh = true;
    }
    $("#refresh-display").on('click', () => {
      _this.openCloseRefreshDisplay(refreshIndicator, refreshIcon);
    });
    $("#refresh-icon").on('click', () => {
      _this.openCloseRefreshDisplay(refreshIndicator, refreshIcon);
    });
  }

  // Refresh a layer on the map
  refreshLayer(id: string): void {
    let index = this.mapLayerIds.indexOf(id);
    let layer: any = this.mapLayers[index];
    let mapLayerData: any = this.mapService.getLayerFromId(id);
    let mapLayerFileName: string = mapLayerData.source;
    this.mapService.getJSONData(mapLayerFileName).subscribe (
        (tsfile) => {
            layer.clearLayers();
            layer.addData(tsfile);
        }
    );
  }

  /**
   * Refreshes and/or reinitializes map global variables when a new map component instance is created
   */
  resetMapVariables(): void {

      // First clear the map
      if (this.mapInitialized === true) this.mainMap.remove();

      this.mapInitialized = false;
      this.mapLayers = [];
      this.mapLayerIds = [];
      this.categorizedClassificationField = [];
      this.categorizedKeyColors = [];
      this.categorizedKeyNames = [];

      clearInterval(this.interval);
  }

  // Clears the current data displayed in the sidebar. This makes sure that the
  // sidebar is cleared when adding new components due to a page refresh.
  resetSidebarComponents(): void {
    if (this.layerViewContainerRef && this.backgroundViewContainerRef) {
      if (this.layerViewContainerRef.length > 1 || this.backgroundViewContainerRef.length > 1) {
        this.layerViewContainerRef.clear();
        this.backgroundViewContainerRef.clear();
      }
    }
  }

  selectedInitial(): string {      
    // if (this.layerViewData.properties.selectedInitial === undefined ||
    //     this.layerViewData.properties.selectedInitial === 'true') {

    //   return 'checked';
    // } else if (this.layerViewData.properties.selectedInitial === 'false') {
    //   this.toggleLayer();
    //   return '';
    // }
    return 'checked';
  }

  selectBackgroundLayer(id: string): void {
    this.mainMap.removeLayer(this.baseMaps[this.currentBackgroundLayer]);
    this.mainMap.addLayer(this.baseMaps[id]);
    this.currentBackgroundLayer = id;
  }

  setBackgroundLayer(id: string): void {
    this.currentBackgroundLayer = id;
    let radio: any = document.getElementById(id + "-radio");
    radio.checked = "checked";
  }

  setDefaultBackgroundLayer(): void {

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
   * Style's the current legend object in the sidebar legend.
   * @param symbolData The display data for the current legend object
   * @param styleType A string or character differentiating between single symbol, categorized, and graduated style legend objects
   */
  styleObject(symbolData: any, styleType: string): Object {

    switch(styleType) {
      case 'ss':
        return {
          fill: validate(symbolData.properties.fillColor, 'fillColor'),
          fillOpacity: validate(symbolData.properties.fillOpacity, 'fillOpacity'),
          stroke: validate(symbolData.properties.color, 'color')
        }
      case 'c':
        return;
    }

    function validate(styleProperty: any, styleType: string): any {
      // The property exists, so return it to be used in the style
      // TODO: jpkeahey 2020.06.15 - Maybe check to see if it's a correct property?
      if (styleProperty) {
        return styleProperty;
      } 
      // The property does not exist, so return a default value.
      else {
        switch (styleType) {
          case 'color': return 'gray';
          case 'fillOpacity': return '0.2';
          case 'fillColor': return 'gray';
        }
      }
    }

  }

  toggleDescriptions() {
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

  // Toggles showing and hiding layers from sidebar controls
  toggleLayer(geoLayerId: string): void {
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

  // Toggle the visibility of the symbols in the legend
  toggleSymbols() {
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
