import { Component,
          OnInit,
          ViewChild,
          ComponentFactoryResolver,
          ViewContainerRef,
          ViewEncapsulation}        from '@angular/core';

import { ActivatedRoute }           from '@angular/router';

import * as $                       from "jquery";
import * as Papa                    from 'papaparse';
import * as moment                  from 'moment';
import                                   'chartjs-plugin-zoom';

import { StateMod, TS,
         MonthTS, YearTS }          from './statemod-classes/StateMod';

import { Chart }                    from 'chart.js';
import { forkJoin }                 from 'rxjs';
import { MatDialog, MatDialogRef }  from '@angular/material/dialog';

import { BackgroundLayerComponent } from './background-layer-control/background-layer.component';
import { MapLayerComponent }        from './map-layer-control/map-layer.component';
import { SidePanelInfoComponent }   from './sidepanel-info/sidepanel-info.component';

import { BackgroundLayerDirective } from './background-layer-control/background-layer.directive';
import { LegendSymbolsDirective }   from './legend-symbols/legend-symbols.directive'
import { MapLayerDirective }        from './map-layer-control/map-layer.directive';
import { SidePanelInfoDirective }   from './sidepanel-info/sidepanel-info.directive';

import { AppService }               from '../app.service';
import { MapService }               from './map.service';
import { resolve } from 'url';


// Needed to use leaflet L class
declare var L: any;
// Needed to use Rainbow class
declare var Rainbow: any;

var buttonSubmit = 'buttonSubmit';


@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

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
  @ViewChild(MapLayerDirective) LayerComp: MapLayerDirective;
  // This provides a reference to <ng-template side-panel-info-host></ng-template>
  // in map.component.html
  @ViewChild(SidePanelInfoDirective) InfoComp: SidePanelInfoDirective;
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


  /* The map component constructor parameters are as follows:
  * route - used for getting the parameter 'id' passed in by the url and from the router.
  * componentFactoryResolver - add components dynamically
  * mapService - reference to map.service.ts
  * activatedRoute - not currently being used
  * router - used to direct to error page in handle error function
  */
  constructor(private route: ActivatedRoute, 
              private componentFactoryResolver: ComponentFactoryResolver,
              private appService: AppService,
              public mapService: MapService, 
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog) { }


  // Add the categorized layer to the map by reading in a CSV file as the colorTable
  addCategorizedLayer(allFeatures: any, mapLayerData: any,
                      symbol: any, layerView: any, results: any) {

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
        // The classification file property 'classificationAttribute' value 'DIVISION' was not found. Confirm that the specified attribute exists in the layer attribute table.
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

    this.mapLayers.push(data);
    this.mapLayerIds.push(mapLayerData.geoLayerId);

    this.appService.setLayerOrder(this.mainMap, L);
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

    viewGroups.forEach((group: any) => {
      if (group.properties.isBackground == undefined ||
          group.properties.isBackground == "false") {
            mapGroups.push(group);
          }
      if (group.properties.isBackground == "true")
        backgroundMapGroups.push(group);
    });
    
    setTimeout(() => {
      mapGroups.forEach((mapGroup: any) => {
        mapGroup.geoLayerViews.forEach((geoLayerView: any) => {
          
          // Create the View Layer Component
          let componentFactory = this.componentFactoryResolver.resolveComponentFactory(MapLayerComponent);
          // This lists all of the components in the factory, AKA all app components
          // console.log(this.componentFactoryResolver['_factories'].values());
          
          this.layerViewContainerRef = this.LayerComp.viewContainerRef;
          let componentRef = this.layerViewContainerRef.createComponent(componentFactory);
          
          // Initialize data for the map layer component.
          let component = <MapLayerComponent>componentRef.instance;
          component.layerViewData = geoLayerView;
          component.mapComponentReference = this;

          let id: string = geoLayerView.geoLayerId;
          component.geometryType = this.mapService.getGeometryType(id);
          // Save the reference to this component so it can be removed when resetting the page.
          this.sidebar_layers.push(componentRef);
        });
        // this.mapService.setContainerViews(this.LayerComp.viewContainerRef); 
        // this.LayerComp.viewContainerRef.clear();
      });
          
    }, 750);

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

  /*
   * This function adds either a popup to the 
   */
  addPopup(URL: string, featureProperties: any, layerViewId: string): void {
    let _this = this;
    URL = encodeURI(this.expandParameterValue(URL, featureProperties, layerViewId));
    /* Add a title to the map */
    let popup = L.control({ position: 'bottomright' });
    popup.onAdd = function (map: any) {
        this._div = L.DomUtil.create('div', 'popup resizable');
        this.update();
        return this._div;
    };
    popup.update = function (props: any) {
      this._div.innerHTML = ("<div class='resizers'>" +
                                "<div class='resizer top-left'></div>" +
                                "<div id='popup-tools'>" +
                                "<i id='exit' class='fa fa-times fa-sm' style='float:right;'></i></div>" + 
                                "<i id='open-window' class='fa fa-external-link fa-xs' style='float:right;margin-right:5px;'></i>" +
                                "<iframe id='popup-iframe' src='" + URL + "'></iframe>" +
                              "</div>");
    };
    popup.addTo(this.mainMap);
    document.getElementById('exit').onclick = exit;
    document.getElementById('open-window').onclick = openWindow;

    this.makeResizableDiv(".popup")

    // Disable dragging when user's cursor enters the element
    popup.getContainer().addEventListener('mouseover',  () => {
        _this.mainMap.dragging.disable();
    });

    // Re-enable dragging when user's cursor leaves the element
    popup.getContainer().addEventListener('mouseout',  () => {
        _this.mainMap.dragging.enable();
    });

    function exit(): void {
      popup.remove();
    }

    function openWindow(): void {
      window.open(document.getElementById('popup-iframe').getAttribute('src'))
    }
  }

  // If there is a refresh component on the map then add a display that shows time
  // since last refresh
  addRefreshDisplay(refreshTime: string[], id: string) : void {
    let _this = this;
    let seconds: number = this.getSeconds(+refreshTime[0], refreshTime[1]);
    let refreshIndicator = L.control({position: 'topleft'});
    refreshIndicator.onAdd = function (map: any) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    refreshIndicator.update = function(props: any) {
      this._div.innerHTML = '<p id="refresh-display"> Time since last refresh: ' +
                            new Date(0).toISOString().substr(11, 8) + '</p>';
    };
    refreshIndicator.addTo(this.mainMap);
    this.refreshMap(seconds, id);
    let refreshIcon = L.control({position: 'topleft'})
    refreshIcon.onAdd = function(map: any) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    }
    refreshIcon.update = function(props: any) {
      this._div.innerHTML = "<p id='refresh-icon' class='fa fa-clock-o'></p>";
    }
    $("#refresh-display").on('click', () => {
      _this.openCloseRefreshDisplay(refreshIndicator, refreshIcon);
    });
    $("#refresh-icon").on('click', () => {
      _this.openCloseRefreshDisplay(refreshIndicator, refreshIcon);
    });
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
    let colors: any[] = [first, second, third, fourth, fifth, sixth, seventh,
    eighth, ninth, tenth, eleventh, twelfth, thirteen, fourteen, fifteen,
    sixteen];
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

  buildPopupHTML(action: any, featureProperties: any, firstAction: boolean, actionNumber?: number): string {

    var divContents = '';
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
      // Create the action button
      divContents += '<br><button id="internal-graph1" (click)="showGraph()">' + action.label + '</button>';
    }
    // The features have already been created, so just add another button.. for now.
    else {      
      divContents += '&nbsp&nbsp<button id="internal-graph' + actionNumber + '" (click)="showGraph()">' + action.label + '</button>';
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
              
              this.mapService.setLayerToOrder(geoLayerViewGroup.geoLayerViewGroupId, i);
              
              var data = L.geoJson(allFeatures, {
                  onEachFeature: onEachFeature,
                  style: this.addStyle(allFeatures, mapLayerData)
              }).addTo(this.mainMap);

              this.mapLayers.push(data);
              this.mapLayerIds.push(mapLayerData.geoLayerId);

              _this.appService.setLayerOrder(this.mainMap, L);
            } 
            // If the layer is a CATEGORIZED POLYGON, create it here
            else if (mapLayerData.geometryType.includes('Polygon') &&
              symbol.classificationType.toUpperCase().includes('CATEGORIZED')) {
              // TODO: jpkeahey 2020.05.01 - This function is inline. Using addStyle does
              // not work. Try to fix later. This is if a classificationFile property exists

              this.mapService.setLayerToOrder(geoLayerViewGroup.geoLayerViewGroupId, i);
              
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
                      this.addCategorizedLayer(allFeatures, mapLayerData, symbol,
                                              this.mapService.getLayerViewFromId(mapLayerData.geoLayerId),
                                              result.data);
                    }
                  });
                
              } else {
                this.mapService.setLayerToOrder(geoLayerViewGroup.geoLayerViewGroupId, i);

                // Default color table is made here
                let colorTable = this.assignColor(allFeatures.features, symbol);
                
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

                this.mapLayers.push(data);
                this.mapLayerIds.push(mapLayerData.geoLayerId);

                _this.appService.setLayerOrder(this.mainMap, L);
              }
            }
            // Display a leaflet marker or custom point/SHAPEMARKER
            else {
              this.mapService.setLayerToOrder(geoLayerViewGroup.geoLayerViewGroupId, i);

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
                    return L.marker(latlng, { icon: markerIcon });
                  }
                },
                onEachFeature: onEachFeature 
              }).addTo(this.mainMap);

              this.mapLayers.push(data);
              this.mapLayerIds.push(mapLayerData.geoLayerId);
              
              _this.appService.setLayerOrder(this.mainMap, L);
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
                formattedValue += value[valueLength];
                valueLength++;
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
                        click: ((e: any) => {                          
                          // Feature Properties is an object with all of the clicked
                          // feature properties. We obtain the graphTemplateObject, which
                          // is the configPath property in the map configuration file event
                          // handler. This is the actual TS graph template file with ${ }
                          // properties that need to be replaced. They are replaced in the
                          // replace Properties function above.
                          var marker = e.target;

                          if (marker.hasOwnProperty('_popup')) {
                            marker.unbindPopup();
                          }
                          
                          var featureProperties: Object = e.target.feature.properties;
                          var firstAction = true;
                          var numberOfActions = eventObject[eventHandler.eventType + '-popupConfigPath'].actions.length;
                          var actionNumber = 0;
                          var divContents = '';

                          for (let action of eventObject[eventHandler.eventType + '-popupConfigPath'].actions) {
                            _this.mapService.getJSONData(_this.mapService.getAppPath() +
                                                          _this.mapService.getMapConfigPath() +
                                                          action.productPath).subscribe((graphTemplateObject: Object) => {

                              actionNumber++;
                              graphTemplateObject = replaceProperties(graphTemplateObject, featureProperties);
                                                            
                              if (graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID) {
                                // Get the entire graph file path
                                let graphFilePath: string = graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID;
                                // Split on the ~ and set the actual file path we want to use so our dialog-content component
                                // can determine what kind of file was given.
                                _this.mapService.setTSID(graphFilePath.split("~")[0]);
                                // If the TSID has one tilde (~), set the path using the correct index compared to if the 
                                // TSID contains two tildes.
                                if (graphFilePath.split('~').length === 2) {
                                  _this.mapService.setGraphFilePath(graphFilePath.split("~")[1]);
                                } else if (graphFilePath.split('~').length === 3) {
                                  _this.mapService.setGraphFilePath(graphFilePath.split("~")[2]);
                                }
                              } else console.error('The TSID has not been set in the graph template file');

                              _this.mapService.setChartTemplateObject(graphTemplateObject);
                              
                              // TODO: jpkeahey 2020.06.18 - Should this be default? Also maybe make a build interface to pass
                              // as an argument if lots of choices pop up?
                              if (firstAction) {                                
                                divContents += _this.buildPopupHTML(action, featureProperties, true);
                                firstAction = false;
                              } else {                                                           
                                divContents += _this.buildPopupHTML(action, featureProperties, false, actionNumber);
                              }
                              // Only create the buttons for the popup if we have asynchronously read all actions
                              if (actionNumber === numberOfActions) {
                                marker.bindPopup(divContents, {
                                  maxHeight: 300,
                                  maxWidth: 300
                                });
                                marker.openPopup();
  
                                // TODO jpkeahey 2020.06.19 - Look at this again and see if you can't create the variables by
                                // putting them in an array and go though it assigning each one
                                for (let i = 0; i < numberOfActions; i++) {
                                  if (i === 0) {
                                    window['buttonSubmit' + (i + 1)] = L.DomUtil.get('internal-graph1');                          
                                    L.DomEvent.on(window['buttonSubmit' + (i + 1)], 'click', function (e: any) {
                                      showGraph(dialog);
                                    });
                                  } else {                                                             
                                    window['buttonSubmit' + i + 1] = L.DomUtil.get('internal-graph' + (i + 1));                        
                                    L.DomEvent.on(window['buttonSubmit' + i + 1], 'click', function (e: any) {
                                      showGraph(dialog);
                                    });
                                  }
                                }
                              }
                            });
                          }
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

            function showGraph(dialog: any): void {
              const dialogRef = dialog.open(DialogContent);
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

  expandParameterValue(parameterValue: string, properties: {}, layerViewId: string): string{
    let mapService = this.mapService;
    let searchPos: number = 0,
        delimStart: string = "${",
        delimEnd: string = "}";
    let b: string = "";
    while(searchPos < parameterValue.length) {
      let foundPosStart: number = parameterValue.indexOf(delimStart),
          foundPosEnd: number = parameterValue.indexOf(delimEnd),
          propVal: string = "",
          propertySearch: string = parameterValue.substr((foundPosStart + 2), ((foundPosEnd - foundPosStart) - 2));

      let propValues: string[] = propertySearch.split(":");
      let propType: string = propValues[0];
      let propName: string = propValues[1];

      // Use feature properties
      if (propType == "feature") {
        propVal = properties[propName];
      }
      else if (propType == "map") {
        let mapProperties: any = mapService.getProperties();
        let propertyLine: string[] = propName.split(".");
        propVal = mapProperties;
        propertyLine.forEach((property) => {
          propVal = propVal[property];
        })
      }
      else if (propType == "layer") {
        let layerProperties: any = mapService.getLayerFromId(layerViewId);
        let propertyLine: string[] = propName.split(".");
        propVal = layerProperties;
        propertyLine.forEach((property) => {
          propVal = propVal[property];
        })
      }
      else if (propType == "layerview") {
        let layerViewProperties = mapService.getLayerViewFromId(layerViewId);
        let propertyLine: string[] = propName.split(".");
        propVal = layerViewProperties;
        propertyLine.forEach((property) => {
          propVal = propVal[property];
        })
      }
      // How to handle if not found?
      if (propVal == undefined) {
        propVal = propertySearch;
      }
      if (foundPosStart == -1) {
        return b;
      }

      propVal = String(propVal);

      b = parameterValue.substr(0, foundPosStart) +
          propVal +
          parameterValue.substr(foundPosEnd + 1, parameterValue.length);

      searchPos = foundPosStart + propVal.length;
      parameterValue = b;
    }
    return b;
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
      case "GRADUATED":
        let colors = new Rainbow();
        let colorRampMin: number = 0;
        let colorRampMax: number = 100
        if (symbol.colorRampMin != "") { colorRampMin = symbol.colorRampMin; }
        if (symbol.colorRampMax != "") { colorRampMax = symbol.colorRampMax; }
        colors.setNumberRange(colorRampMin, colorRampMax);

        switch (layerData.symbol.colorRamp.toLowerCase()) {
          case 'blues': // white, light blue, blue
              colors.setSpectrum('#f7fbff','#c6dbef','#6baed6','#2171b5','#08306b');
              break;
          case 'brbg': // brown, white, green
              colors.setSpectrum('#a6611a','#dfc27d','#f5f5f5','#80cdc1','#018571');
              break;
          case 'bugn': // light blue, green
              colors.setSpectrum('#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c');
              break;
          case 'bupu': // light blue, purple
              colors.setSpectrum('#edf8fb','#b3cde3','#8c96c6','#8856a7','#810f7c');
              break;
          case 'gnbu': // light green, blue
              colors.setSpectrum('#f0f9e8','#bae4bc','#7bccc4','#43a2ca','#0868ac');
              break;
          case 'greens': // white, light green, green
              colors.setSpectrum('#f7fcf5','#c7e9c0','#74c476','#238b45','#00441b');
              break;
          case 'greys': // white, grey
              colors.setSpectrum('#fafafa','#050505');
              break;
          case 'inferno': // black, purple, red, yellow
              colors.setSpectrum('#400a67','#992766','#df5337','#fca60c','#fcffa4');
              break;
          case 'magma': // black, purple, orange, yellow
              colors.setSpectrum('#000000','#390f6e','#892881','#d9466b','#fea16e','#fcfdbf');
              break;
          case 'oranges': // light orange, dark orange
              colors.setSpectrum('#fff5eb','#fdd0a2','#fd8d3c','#d94801','#7f2704');
              break;
          case 'orrd': // light orange, red
              colors.setSpectrum('#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000');
              break;
          case 'piyg': // pink, white, green
              colors.setSpectrum('#d01c8b','#f1b6da','#f7f7f7','#b8e186','#4dac26');
              break;
          case 'plasma': // blue, purple, orange, yellow
              colors.setSpectrum('#0d0887','#6900a8','#b42e8d','#e26660','#fca835', '#f0f921');
              break;
          case 'prgn': // purple, white, green
              colors.setSpectrum('#0d0887','#6900a8','#b42e8d','#e26660','#fca835');
              break;
          case 'pubu': // white, blue
              colors.setSpectrum('#f1eef6','#bdc9e1','#74a9cf','#2b8cbe','#045a8d');
              break;
          case 'pubugn': // white, blue, green
              colors.setSpectrum('#f6eff7','#bdc9e1','#67a9cf','#1c9099','#016c59');
              break;
          case 'puor': // orange, white, purple
              colors.setSpectrum('#e66101','#fdb863','#f7f7f7','#b2abd2','#5e3c99');
              break;
          case 'purd': // white, pink, purple
              colors.setSpectrum('#f1eef6','#d7b5d8','#df65b0','#dd1c77','#980043');
              break;
          case 'purples': // white, purple
              colors.setSpectrum('#fcfbfd','#dadaeb','#9f9bc9','#6a51a3','#3f007d');
              break;
          case 'rdbu': // red, white, blue
              colors.setSpectrum('#ca0020','#f4a582','#f7f7f7','#92c5de','#0571b0');
              break;
          case 'rdgy': // red, white, grey
              colors.setSpectrum('#ca0020','#f4a582','#ffffff','#bababa','#404040');
              break;
          case 'rdpu': // pink, purple
              colors.setSpectrum('#feebe2','#fbb4b9','#f768a1','#c51b8a','#7a0177');
              break;
          case 'rdylbu': // red, yellow, blue
              colors.setSpectrum('#d7191c','#fdae61','#ffffbf','#abd9e9','#2c7bb6');
              break;
          case 'rdylgn': // red, yellow, green
              colors.setSpectrum('#d7191c','#fdae61','#ffffc0','#a6d96a','#1a9641');
              break;
          case 'reds': // light red, dark red
              colors.setSpectrum('#fff5f0','#fcbba1','#fb6a4a','#cb181d','#67000d');
              break;
          case 'spectral': // red, orange, yellow, green, blue
              colors.setSpectrum('#d7191c','#fdae61','#ffffbf','#abdda4','#2b83ba');
              break;
          case 'viridis': // blue, light blue, green, yellow
              colors.setSpectrum('#3a004f','#414287','#297b8e','#24aa83','#7cd250','#fde725');
              break;
          case 'ylgn': // yellow, blue-green
              colors.setSpectrum('#ffffcc','#c2e699','#78c679','#31a354','#7cd250','#006837');
              break;
          case 'ylgnbu': // yellow, light blue, blue
              colors.setSpectrum('#ffffcc','#a1dab4','#41b6c4','#2c7fb8','#253494');
              break;
          case 'ylorbr': // yellow, orange, brown
              colors.setSpectrum('#ffffd4','#fed98e','#fe9929','#d95f0e','#993404');
              break;
          case 'ylorrd': //yellow, orange, red
              colors.setSpectrum('#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026');
              break;
          default:
            let colorsArray = symbol.colorRamp.substr(1, symbol.colorRamp.length - 2).split(/[\{\}]+/);
            for(let i = 0; i < colorsArray.length; i++) {
              if (colorsArray[i].charAt(0) == 'r') {
                let rgb = colorsArray[i].substr(4, colorsArray[i].length-1).split(',');
                let r = (+rgb[0]).toString(16);
                let g = (+rgb[1]).toString(16);
                let b = (+rgb[2]).toString(16);
                if (r.length == 1)
                    r = "0" + r;
                if (g.length == 1)
                    g = "0" + g;
                if (b.length == 1)
                    b = "0" + b;
                colorsArray[i] = "#" + r + g + b;
              }
            }
            colors.setSpectrum(...colorsArray);
          }
          return '#' + colors.colorAt(strVal);
    } 
    return symbol.color;
  }

  // Get the number of seconds from a time interval specified in the configuration file
  getSeconds(timeLength: number, timeInterval: string): number{
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

  /*Make resizable div by Hung Nguyen*/
  /*https://codepen.io/anon/pen/OKXNGL*/
  makeResizableDiv(div: any): void {
    const element = document.querySelector(div);
    const resizers = document.querySelectorAll(div + ' .resizer')
    const minimum_size = 20;
    let original_width = 0;
    let original_height = 0;
    let original_x = 0;
    let original_y = 0;
    let original_mouse_x = 0;
    let original_mouse_y = 0;
    let currentResizer;
    for (let i = 0;i < resizers.length; i++) {
      currentResizer = resizers[i];
      currentResizer.addEventListener('mousedown', (e: any) => {
        e.preventDefault()
        original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
        original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
        original_x = element.getBoundingClientRect().left;
        original_y = element.getBoundingClientRect().top;
        original_mouse_x = e.pageX;
        original_mouse_y = e.pageY;
        window.addEventListener('mousemove', resize)
        window.addEventListener('mouseup', stopResize)
      })
    }

    function resize(e: any) {
      if (currentResizer.classList.contains('bottom-right')) {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
      }
      else if (currentResizer.classList.contains('bottom-left')) {
        const height = original_height + (e.pageY - original_mouse_y)
        const width = original_width - (e.pageX - original_mouse_x)
        if (height > minimum_size) {
          element.style.height = height + 'px'
        }
        if (width > minimum_size) {
          element.style.width = width + 'px'
          element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
        }
      }
      else if (currentResizer.classList.contains('top-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
          element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
        }
      }
      else {
        const width = original_width - (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          element.style.width = width + 'px'
          element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
        }
        if (height > minimum_size) {
          element.style.height = height + 'px'
          element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
        }
      }
    }
  
    function stopResize() { window.removeEventListener('mousemove', resize) }
  }

  // This function is called on initialization of the component
  ngOnInit() {
    // When the parameters in the URL are changed the map will refresh and load
    // according to new configuration data
    this.activeRoute.params.subscribe((routeParams) => {
      // First clear the map
      if (this.mapInitialized == true) this.mainMap.remove();

      this.mapInitialized = false;
      this.mapLayers = [];
      this.mapLayerIds = [];

      clearInterval(this.interval);

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

  // processData(allText: any) {
  //   var allTextLines = allText.split(/\r\n|\n/);
  //   var headers = allTextLines[0].split(',');
  //   var lines = [];

  //   for (var i=1; i<allTextLines.length; i++) {
  //       var data = allTextLines[i].split(',');
  //       if (data.length == headers.length) {

  //           var tarr = [];
  //           for (var j=0; j<headers.length; j++) {
  //               tarr.push(headers[j]+":"+data[j]);
  //           }
  //           lines.push(tarr);
  //       }
  //   }
  // }

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

  // Refresh the map according to the configuration file
  refreshMap(seconds: number, id: string) : void {
    let startTime: number = seconds;
    let secondsSinceRefresh: number = 0;
    let minutesSinceRefresh: number = 0;
    let hoursSinceRefresh: number = 0;
    let date = new Date(null);
    date.setSeconds(secondsSinceRefresh);
    date.setMinutes(minutesSinceRefresh);
    date.setHours(hoursSinceRefresh);
    this.interval = setInterval(() => {
      if (seconds > 0) {
        if (this.showRefresh) {
          document.getElementById('refresh-display').innerHTML = "Time since last refresh: " + 
                                                                  date.toString().substr(16, 8);
        }
        secondsSinceRefresh ++;
        if (secondsSinceRefresh == 60) {
          secondsSinceRefresh = 0
          minutesSinceRefresh ++;
        }
        if (minutesSinceRefresh == 60) {
          minutesSinceRefresh = 0;
          hoursSinceRefresh ++;
        }
        date.setSeconds(secondsSinceRefresh);
        date.setMinutes(minutesSinceRefresh);
        date.setHours(hoursSinceRefresh); 
        seconds --;
      }
      else {
        if (this.showRefresh) {
          document.getElementById('refresh-display').innerHTML = "Time since last refresh: " +
                                                                  date.toString().substr(16, 8);
        }
        secondsSinceRefresh = 0;
        minutesSinceRefresh = 0;
        hoursSinceRefresh = 0;
        date.setSeconds(0)
        date.setMinutes(0)
        date.setHours(0)
        seconds = startTime;
        this.refreshLayer(id);
      }
    }, 1000);
  }

  // Clears the current data displayed in the sidebar. This makes sure that the
  // sidebar is cleared when adding new components due to a page refresh.
  resetSidebarComponents(): void {
    let _this = this;
    this.sidebar_layers.forEach((layerComponent: any) => {
      _this.layerViewContainerRef.remove(_this.layerViewContainerRef.indexOf(layerComponent));
    })
    this.sidebar_background_layers.forEach((layerComponent: any) => {
      _this.backgroundViewContainerRef.remove(_this.backgroundViewContainerRef.indexOf(layerComponent));
    })
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
  toggleLayer(id: string): void {    
    let index = this.mapLayerIds.indexOf(id);    
    
    let checked = (<HTMLInputElement>document.getElementById(id + "-slider")).checked;
    
    if (!checked) {      
      for (let i = 0; i < this.mapLayers[0].length; i++) {
        this.mainMap.removeLayer(this.mapLayers[0][i]);
      }
      this.mainMap.removeLayer(this.mapLayers[index]);      
      (<HTMLInputElement>document.getElementById(id + "-slider")).checked = false;
      let description = $("#description-" + id);
      description.css('visibility', 'hidden');
      description.css('height', 0);
      let symbols = $("#symbols-" + id);
      symbols.css('visibility', 'hidden');
      symbols.css('height', 0);
    }
    // If checked
    else {      
      for (let i = 0; i < this.mapLayers[0]; i++) {
        console.log(this.mapLayers[0][i]);
        
        this.mainMap.addLayer(this.mapLayers[0][i]);
      }
      this.mainMap.addLayer(this.mapLayers[index]);
      (<HTMLInputElement>document.getElementById(id + "-slider")).checked = true;
      let description = $("#description-" + id)
      if (!this.hideAllDescription) {
        description.css('visibility', 'visible');
        description.css('height', '100%');
      }
      let symbols = $("#symbols-" + id);
      if (!this.hideAllSymbols) {
        symbols.css('visibility', 'visible');
        symbols.css('height', '100%');
      }
      // When the slider is checked again, resort the layers so layer
      // order is preserved.
      this.appService.setLayerOrder(this.mainMap, L);
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

@Component({
  selector: 'dialog-content',
  styleUrls: ['./dialog-content/dialog-content.css'],
  templateUrl: './dialog-content/dialog-content.html'
})
export class DialogContent {

  constructor(public dialogRef: MatDialogRef<DialogContent>,
              public mapService: MapService) { }


  mainTitleString: string;

  createGraph(config: PopulateGraph): void {

    // Typescript does not support dynamic invocation, so instead of creating ctx
    // on one line, we can cast the html element to a canvas element. Then we can
    // create the ctx variable by using getContext() on the canvas variable.
    var canvas = <HTMLCanvasElement> document.getElementById('myChart');
    var ctx = canvas.getContext('2d');    

    // TODO: jpkeahey 2020.06.03 - Maybe use a *ngFor loop in the DialogContent
    // template file to create as many charts as needed. As well as a for loop
    // here obviously for going through subProducts?
    var myChart = new Chart(ctx, {
      type: validate(config.chartType, 'GraphType'),
      data: {
        labels: validate(config.dataLabels, 'xAxisDataLabels'),                       // X-axis labels
        datasets: [
          {
            label: config.mainTitle,
            data: config.datasetData,                    // Y-axis data
            backgroundColor: 'rgba(33, 145, 81, 0)',     // The graph fill color, with a = 'alpha' = 0 being 0 opacity
            borderColor: config.datasetBackgroundColor ? config.datasetBackgroundColor : 'black', // Color of the border or line of the graph
            borderWidth: 1,
            spanGaps: false,
            lineTension: 0
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          xAxes: [
            {
              display: true,
              distribution: 'linear',
              ticks: {
                min: config.xAxesTicksMin,
                max: config.xAxesTicksMax,
                maxTicksLimit: 10,                       // No more than 10 ticks
                maxRotation: 0                           // Don't rotate labels
              }
            }
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: config.yAxesLabelString
              }
            }
          ]
        },
        elements: {                                      // Show each element on the
          point: {                                       // graph with a small circle
            radius: 1
          }
        },
        plugins: {                                       // Extra plugin for zooming
          zoom: {                                        // and panning.
            pan: {
              enabled: true,
              mode: 'x',
              rangeMin: {
                x: config.panRangeMin
              },
              rangeMax: {
                x: config.panRangeMax
              }
            },
            zoom: {
              enabled: true,
              drag: false,
              mode: 'x',
              rangeMin: {
                x: config.zoomRangeMin
              },
              rangeMax: {
                x: config.zoomRangeMax
              },
              sensitivity: 0.0001
            }
          }
        }
      }
    });

    // This helper function decides if the given property in the chart config object above
    // is defined. If it isn't, an error message is created with a detailed description of
    // which graph template attribute was incorrect. It will also let the user know a default
    // will be used instead.
    function validate(property: any, templateAttribute: string): any {

      if (!property) {
        switch(templateAttribute) {
          case 'GraphType':
            console.error('[' + templateAttribute + '] not defined or incorrectly set. Using the default "line"');
            return 'line';
          case 'xAxisDataLabels':
            throw new Error('Fatal Error: [' + templateAttribute + '] not set. Needed for chart creation. Check graph template file and graph data file.');
        }
      }
      // TODO: jpkeahey 2020.06.12 - If the property exists, just return it for now. Can check if it's legit later
      else {
        return property;
      }
    }
  }

  createCSVGraph(results: any): void {

    var graphType: string = '';
    var templateYAxisTitle: string = '';
    var backgroundColor: string = '';
    var mainTitle = '';
    var chartConfig: Object = this.mapService.getChartTemplateObject();

    // This main title string is used in the Dialog Content template file
    if (chartConfig['product']['properties'].MainTitleString) {
      this.mainTitleString = chartConfig['product']['properties'].MainTitleString;
      mainTitle = chartConfig['product']['properties'].MainTitleString;
    }

    let x_axis = Object.keys(results[0])[0];
    let y_axis = Object.keys(results[0])[1];
    // Populate the arrays needed for the x- and y-axes
    var x_axisLabels: string[] = [];
    var y_axisData: number[] = [];
    for (let resultObj of results) {      
      x_axisLabels.push(resultObj[x_axis]);
      y_axisData.push(parseFloat(resultObj[y_axis]));
    }
    // Populate various other chart properties. They will be checked for validity in createGraph()
    graphType = chartConfig['product']['subProducts'][0]['properties'].GraphType.toLowerCase();
    templateYAxisTitle = chartConfig['product']['subProducts'][0]['properties'].LeftYAxisTitleString;
    backgroundColor = chartConfig['product']['subProducts'][0]['data'][0]['properties'].Color;
    
    var config: PopulateGraph = {
      mainTitle: mainTitle,
      chartType: graphType,
      dataLabels: x_axisLabels,
      datasetData: y_axisData,
      datasetBackgroundColor: backgroundColor,
      xAxesTicksMin: x_axisLabels[0],
      xAxesTicksMax: x_axisLabels[x_axisLabels.length - 1],
      yAxesLabelString: templateYAxisTitle,
      panRangeMin: x_axisLabels[0],
      panRangeMax: x_axisLabels[x_axisLabels.length - 1],
      zoomRangeMin: x_axisLabels[0],
      zoomRangeMax: x_axisLabels[x_axisLabels.length - 1]
    }

    this.createGraph(config);
  }

  /**
   * Sets up properties for, and creates the configuration object for
   * the Chart.js graph
   * @param results The Time Series object retrieved from the StateMod code
   */
  createTSGraph(results: any): void {
    
    var graphType: string = '';
    var templateYAxisTitle: string = '';
    var backgroundColor: string = '';
    var mainTitle = '';
    var chartConfig: Object = this.mapService.getChartTemplateObject();

    // This main title string is used in the Dialog Content template file
    if (chartConfig['product']['properties'].MainTitleString) {
      this.mainTitleString = chartConfig['product']['properties'].MainTitleString;
      mainTitle = chartConfig['product']['properties'].MainTitleString;
    }    
    
    var x_axisLabels: string[] = new Array<string>();
    var y_axisData: number[] = new Array<number>();
    var xAxisDates: any;
    
    if (results instanceof MonthTS) {
      xAxisDates = this.getDates(new Date(String(results._date1.__year) + ", Jan"),
                                (new Date(String(results._date2.__year) + ", Dec")),
                                'months');
      x_axisLabels = xAxisDates;
    } else {
      // This is a placeholder for the x axis labels right now.
      for (let i = 0; i < results._data.length; i++) {
        for (let j = 0; j < results._data[i].length; j++) {
          x_axisLabels.push('Y:' + (i + 1) + ' M:' + (j + 1));
        }
      }
    }

    

    // This is NOT a placeholder. It goes through the array of arrays and
    // populates one array with all the data to show on the graph.
    for (let i = 0; i < results._data.length; i++) {
      for (let j = 0; j < results._data[i].length; j++) {
        y_axisData.push(results._data[i][j]);
      }
    }
    // Populate the rest of the properties. Validity will be check in createGraph()
    graphType = chartConfig['product']['subProducts'][0]['properties'].GraphType.toLowerCase();
    templateYAxisTitle = chartConfig['product']['subProducts'][0]['properties'].LeftYAxisTitleString;
    backgroundColor = chartConfig['product']['subProducts'][0]['data'][0]['properties'].Color;
    
    var config: PopulateGraph = {
      mainTitle: mainTitle,
      chartType: graphType,
      dataLabels: x_axisLabels,
      datasetData: y_axisData,
      datasetBackgroundColor: backgroundColor,
      xAxesTicksMin: x_axisLabels[0],
      xAxesTicksMax: x_axisLabels[x_axisLabels.length - 1],
      yAxesLabelString: templateYAxisTitle,
      panRangeMin: x_axisLabels[0],
      panRangeMax: x_axisLabels[x_axisLabels.length - 1],
      zoomRangeMin: x_axisLabels[0],
      zoomRangeMax: x_axisLabels[x_axisLabels.length - 1]
    }

    this.createGraph(config);
  }

  // Returns an array of dates between the two dates given, per day
  // https://gist.github.com/miguelmota/7905510
  private getDates(startDate: any, endDate: any, interval: string): any[] {

    var dates = [];
    var currentDate: any;

    switch (interval) {
      case 'days':
        currentDate = startDate;

        let addDays = function(days) {
          let date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        };
        while (currentDate <= endDate) {
          dates.push(currentDate);
          currentDate = addDays.call(currentDate, 1);
        }        
        return dates;
      case 'months':
        currentDate = moment(startDate);
        var stopDate = moment(endDate);        
        while (currentDate <= stopDate) {
            dates.push( moment(currentDate).format('MMM YYYY') )
            currentDate = moment(currentDate).add(1, 'months');
        }
        return dates;
    }
    
  };

  ngOnInit(): void {

    let graphFilePath = this.mapService.getGraphFilePath();
    
    if (graphFilePath.includes('.csv'))
      this.parseCSVFile();
    else if (graphFilePath.includes('.stm'))
      this.parseStateModFile();
  }

  onClose(): void { this.dialogRef.close(); }

  parseCSVFile(): void {

    Papa.parse(this.mapService.getAppPath() +
                this.mapService.getGraphFilePath(),
              {
                delimiter: ",",
                download: true,
                comments: "#",
                skipEmptyLines: true,
                header: true,
                complete: (result: any, file: any) => {
                  this.createCSVGraph(result.data);
                }
              });

  }

  parseStateModFile(): void {
    let stateMod = new StateMod(this.mapService);
    stateMod.readTimeSeries(this.mapService.getTSID(),
                      this.mapService.getAppPath() + this.mapService.getGraphFilePath().substring(1),
                      null,
                      null,
                      null,
                      true).subscribe((results: any) => {
                        this.createTSGraph(results);
                      });

    
  }

}

/**
 * Passes an interface as an argument instead of many 
 * arguments when a graph object is created
 */
interface PopulateGraph {
  mainTitle: string;
  chartType: string;
  dataLabels?: string[];
  datasetData: number[];
  datasetBackgroundColor?: string;
  xAxesTicksMin: string;
  xAxesTicksMax: string;
  yAxesLabelString: string;
  panRangeMin: string;
  panRangeMax: string;
  zoomRangeMin: string;
  zoomRangeMax: string;
}
