import { Component, OnInit, ViewChild,
          ComponentFactoryResolver,
          ViewContainerRef,
          ViewEncapsulation }       from '@angular/core';
import { ActivatedRoute }           from '@angular/router';

import * as $                       from "jquery";

import * as Papa                    from 'papaparse';

import { Globals }                      from '../globals';

import { LegendSymbolsDirective }   from './legend-symbols/legend-symbols.directive'

import { MapService }               from './map.service';
import { MapLayerDirective }        from './map-layer-control/map-layer.directive';

import { BackgroundLayerComponent } from './background-layer-control/background-layer.component';

import { MapLayerComponent }        from './map-layer-control/map-layer.component';

import { SidePanelInfoComponent }   from './sidepanel-info/sidepanel-info.component';
import { SidePanelInfoDirective }   from './sidepanel-info/sidepanel-info.directive';
import { BackgroundLayerDirective } from './background-layer-control/background-layer.directive';


// Needed to use leaflet L class.
declare var L: any;
// Needed to use Rainbow class from 
declare var Rainbow: any;


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
  mymap: any;
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
  baseMaps = {};

  dataList: any[];


  /* The map component constructor parameters are as follows:
  * route - used for getting the parameter 'id' passed in by the url and from the router.
  * componentFactoryResolver - add components dynamically
  * mapService - reference to map.service.ts
  * activatedRoute - not currently being used
  * router - used to direct to error page in handle error function
  */
  constructor(private route: ActivatedRoute, 
              private componentFactoryResolver: ComponentFactoryResolver, 
              private mapService: MapService, 
              private activeRoute: ActivatedRoute,
              private globals: Globals) { }


  // Add the categorized layer to the map by reading in a CSV file as the colorTable
  addCategorizedLayer(tsfile: any, mapLayerData: any,
                      symbol: any, colorTable: any, results: any) {
    
    let data = L.geoJson(tsfile, {
      onEachFeature: (feature: any, layer: any) => {
        layer.on({
          mouseover: showPopup,
          mouseout: removePopup
        });
        function showPopup(e: any) {
          let divContents: string = '';
          let divProperties: any = e.target.feature.properties;
          for (let prop in divProperties) {
            divContents += '<b>' + prop + '</b>' + ': ' + divProperties[prop] + '<br>';
          }
          document.getElementById('point-info').innerHTML = divContents;
        }
  
        function removePopup(e: any) {
          // this.updateTitleCard();
        }
      },
      style: (feature: any, layerData: any) => {
        for (let i = 0; i < results.length; i++) {
          if (feature['properties'][symbol.classificationAttribute] == results[i]['value']) {
            return {
              color: results[i]['color'],
              dashArray: symbol.properties.dashArray,
              fillOpacity: results[i]['fillOpacity'],
              lineCap: symbol.properties.lineCap,
              lineJoin: symbol.properties.lineJoin,
              opacity: results[i]['opacity'],
              stroke: symbol.properties.outlineColor == "" ? false : true,
              weight: results[i]['weight']
            }
          }          
        }
      }
    }).addTo(this.mymap);
    this.mapLayers.push(data);
    this.mapLayerIds.push(mapLayerData.geoLayerId);
  }

  // Add content to the info tab of the sidebar. Following the example from Angular's
  // documentation found here: https://angular.io/guide/dynamic-component-loader
  addInfoToSidebar(properties: any): void {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(SidePanelInfoComponent);
    let infoViewContainerRef = this.InfoComp.viewContainerRef;
    let componentRef = infoViewContainerRef.createComponent(componentFactory);
    (<SidePanelInfoComponent>componentRef.instance).properties = properties;
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

    geoLayers.forEach((geoLayer: any) => {
      if (geoLayer.layerType != 'Raster') {
        // Create the Map Layer Component
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(MapLayerComponent);
        this.layerViewContainerRef = this.LayerComp.viewContainerRef;
        let componentRef = this.layerViewContainerRef.createComponent(componentFactory);

        // Initialize data for the map layer component.
        let component = <MapLayerComponent>componentRef.instance;
        component.layerData = geoLayer;
        component.mapComponentReference = this;
        let id: string = geoLayer.geoLayerId;

        component.layerViewConfiguration = this.mapService.getLayerViewFromId(id);      

        // Save the reference to this component so it can be removed when resetting the page.
        this.sidebar_layers.push(componentRef);
      }
    });

    let backgroundMapLayers: any = [];
    let viewGroups: any = configFile.geoMaps[0].geoLayerViewGroups;

    viewGroups.forEach((group: any) => {
      if (group.properties.isBackground == "true")
        backgroundMapLayers.push(group);
    });

    backgroundMapLayers.forEach((backgroundGroup: any) => {
      backgroundGroup.geoLayerViews.forEach((backgroundGeoLayerView: any) => {
      // Create the background map layer component
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(BackgroundLayerComponent);
      this.backgroundViewContainerRef = this.backgroundLayerComp.viewContainerRef;
      let componentRef = this.backgroundViewContainerRef.createComponent(componentFactory);
      //Initialize the data for the background map layer component
      let component = <BackgroundLayerComponent>componentRef.instance;
      component.data = backgroundGeoLayerView;
      component.mapComponentReference = this;

      // Save the reference to this component so it can be removed when resetting the page.
      this.sidebar_background_layers.push(componentRef);
      });
    });
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
    popup.addTo(this.mymap);
    document.getElementById('exit').onclick = exit;
    document.getElementById('open-window').onclick = openWindow;

    this.makeResizableDiv(".popup")

    // Disable dragging when user's cursor enters the element
    popup.getContainer().addEventListener('mouseover',  () => {
        _this.mymap.dragging.disable();
    });

    // Re-enable dragging when user's cursor leaves the element
    popup.getContainer().addEventListener('mouseout',  () => {
        _this.mymap.dragging.enable();
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
    refreshIndicator.addTo(this.mymap);
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
  addStyle(feature: any, layerData: any, mapLayerViewGroups: any,
            marker: boolean, colorTable: any): {} {
    
    let symbolData: any = this.mapService.getSymbolDataFromID(layerData.geoLayerId);
    
    let style: {} = {};

    if (layerData.geometryType.includes('Point') &&
          symbolData.classificationType.toUpperCase() == 'SINGLESYMBOL') {                      
      style = {
        color: symbolData.properties.color,
        dashArray: symbolData.properties.dashArray,
        fillOpacity: symbolData.properties.fillOpacity,
        fillColor: symbolData.properties.fillColor,
        lineCap: symbolData.properties.lineCap,
        lineJoin: symbolData.properties.lineJoin,
        opacity: symbolData.properties.opacity,
        radius: symbolData.properties.size,
        stroke: symbolData.properties.outlineColor == "" ? false : true,
        shape: symbolData.properties.marker,
        weight: symbolData.properties.weight
      }
    } else if (layerData.geometryType.includes('Point') &&
                  symbolData.classificationType.toUpperCase() == 'CATEGORIZED') {      
      style = {
        color: symbolData.properties.color,
        dashArray: symbolData.properties.dashArray,
        fillOpacity: symbolData.properties.fillOpacity,
        lineCap: symbolData.properties.lineCap,
        lineJoin: symbolData.properties.lineJoin,
        opacity: symbolData.properties.opacity,
        radius: symbolData.properties.size,
        stroke: symbolData.properties.outlineColor == "" ? false : true,
        shape: symbolData.properties.marker,
        weight: symbolData.properties.weight
      }
    }
    else if (layerData.geometryType.includes('LineString')) { 
      return symbolData.properties;
    }
    // TODO: jpkeahey 2020.05.01 - This is the conditional for a categorized
    // polygon that is not being used right now, as it's inline in builMap()
    else if (layerData.geometryType.includes('Polygon') &&
                symbolData.classificationType.toUpperCase() == 'CATEGORIZED') {      
      let classificationAttribute: any = feature['properties'][symbolData.classificationAttribute]
      
      style = {
        color: this.getColor(layerData, symbolData, classificationAttribute, colorTable),
        dashArray: symbolData.properties.dashArray,
        fillOpacity: symbolData.properties.fillOpacity,
        lineCap: symbolData.properties.lineCap,
        lineJoin: symbolData.properties.lineJoin,
        opacity: symbolData.properties.opacity,
        stroke: symbolData.properties.outlineColor == "" ? false : true,
        radius: symbolData.properties.size,
        weight: symbolData.properties.weight
      }
      
    } else if (layerData.geometryType.includes('Polygon')) {
      style = {
        color: symbolData.properties.color,
        dashArray: symbolData.properties.dashArray,
        fillOpacity: symbolData.properties.fillOpacity,
        lineCap: symbolData.properties.lineCap,
        lineJoin: symbolData.properties.lineJoin,
        opacity: symbolData.properties.opacity,
        radius: symbolData.properties.size,
        stroke: symbolData.properties.outlineColor == "" ? false : true,
        shape: symbolData.properties.marker,
        weight: symbolData.properties.weight
      }
    }
    return style;
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

    // TODO: jpkeahey 2020.04.30 - Let people know that no more than 16 default
    // colors can be used
    for (let i = 0; i < features.length; i++) {        
      colorTable.push(features[i]['properties'][symbol.classificationAttribute]);
      colorTable.push(colors[i]);
    }    
    return colorTable;
  }

  // Build the map using leaflet and configuration data
  buildMap(): void {
    let _this = this;

    this.mapInitialized = true;

    // Get the zoomInfo as array from the config file.
    // [initialExtent, minimumExtent, maximumExtent]
    let zoomInfo = this.mapService.getZoomInfo();    

    // Create background layers dynamically from the configuration file.
    let backgroundLayers: any[] = this.mapService.getBackgroundLayers();
    backgroundLayers.forEach((backgroundLayer) => {
      let tempBgLayer = L.tileLayer(backgroundLayer.sourcePath, {
        attribution: backgroundLayer.properties.attribution,
      });
      this.baseMaps[backgroundLayer.geoLayerId] = tempBgLayer;
    });

    // Create a Leaflet Map; set the default layers that appear on initialization
    this.mymap = L.map('mapid', {
        center: this.mapService.getCenter(),
        zoom: zoomInfo[0],
        minZoom: zoomInfo[1],
        maxZoom: zoomInfo[2],
        layers: [this.baseMaps[this.mapService.getDefaultBackgroundLayer()]],
        zoomControl: false
    });
    // Set the default layer radio check to true
    this.setDefaultBackgroundLayer();

    /* Add layers to the map */
    if (this.mapService.getBackgroundLayersMapControl()) {
      L.control.layers(this.baseMaps).addTo(this.mymap);
    }

    this.mymap.on('baselayerchange', (backgroundLayer: any) => {      
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
    mapTitle.addTo(this.mymap);

    // Add home and zoom in/zoom out control to the top right corner
    L.Control.zoomHome({position: 'topright'}).addTo(this.mymap);

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
      }}).addTo(this.mymap);

    /* Bottom Right corner. This shows the scale in km and miles of
    the map. */
    L.control.scale({position: 'bottomleft',imperial: true}).addTo(this.mymap);

    // Get data from configuration file:
    /* The following gets the data layers which contains general information 
       regarding each layer on the map. */
    let mapLayers = this.mapService.getDataLayers();    
    
    // Get the map layer view groups
    let mapLayerViewGroups = this.mapService.getLayerGroups();

    let layerViewUIEventHandlers: any[];

    let allLayerViewUIEventHandlers = this.mapService.getLayerViewUIEventHandlers();
    updateTitleCard();
    // needed for the following function
    // This function will update the title card in the top left corner of the map
    // If there are configurations to allow UI interaction via mouse over or
    // clicking on a feature then the title card will show some instruction for 
    // how to do so.
    function updateTitleCard(): void {
      let div = document.getElementById('title-card')
      let instruction: string = "Hover on a feature for more information";
      let divContents: string = "";

      divContents = ('<h4>' + mapName + '</h4>' + '<p id="point-info"></p>');
      if (instruction != "") {
        divContents += ('<hr/>' + '<p><i>' + instruction + '</i></p>');
      }
      div.innerHTML = divContents;
    }

    // Dynamically load layers into array. VERY IMPORTANT
    for (let i = 0; i < mapLayers.length; i++) {
      let mapLayerData = mapLayers[i];
      
      let mapLayerFileName = mapLayerData.sourcePath;
      let symbol = this.mapService.getSymbolDataFromID(mapLayerData.geoLayerId);

      this.mapService.getJSONdata(mapLayerFileName).subscribe((tsfile) => {
        
        // Default color table is made here
        let colorTable = this.assignColor(tsfile.features, symbol);
        layerViewUIEventHandlers = this.mapService.getLayerViewUIEventHandlersFromId(mapLayerData.geolayerId);  
        
        // If the layer is a LineString or singleSymbol Polygon, create it here
        if (mapLayerData.geometryType.includes('LineString') ||
            mapLayerData.geometryType.includes('Polygon') &&
            symbol.classificationType.toUpperCase().includes('SINGLESYMBOL')) {
          
          var data = L.geoJson(tsfile, {              
              onEachFeature: onEachFeature,
              style: this.addStyle(tsfile, mapLayerData, mapLayerViewGroups, false, colorTable)
          }).addTo(this.mymap);          
          this.mapLayers.push(data);
          this.mapLayerIds.push(mapLayerData.geoLayerId);
        } 
        // If the layer is a Categorized Polygon, create it here
        else if (mapLayerData.geometryType.includes('Polygon') &&
          symbol.classificationType.toUpperCase().includes('CATEGORIZED')) {
          // TODO: jpkeahey 2020.05.01 - This function is inline. Using addStyle does
          // not work. Try to fix later. This is if a classificationFile exists

          if (symbol.properties.classificationFile) {            
            Papa.parse(symbol.properties.classificationFile,
              {
                delimiter: ",",
                download: true,
                header: true,
                complete: (result: any, file: any) => {
                  this.addCategorizedLayer(tsfile, mapLayerData, symbol, colorTable, result.data);
                }
              });
            
          } else {
            // If there is no classificationFile, create a default colorTable
            let data = L.geoJson(tsfile, {
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
                    weight: symbol.properties.weight
                  }
              }
            }).addTo(this.mymap);
            this.mapLayers.push(data);
            this.mapLayerIds.push(mapLayerData.geoLayerId);
            // this.addStyle(feature, mapLayerData, mapLayerViewGroups, false, colorTable)  
          }
        }
        // Display a custom point e.g. a shapemarker
        else {          
          var data = L.geoJson();
          if (mapLayerData.geometryType.includes('Point') && symbol.properties.isDefaultMarker == 'false') {
            data = L.geoJson(tsfile, {
              pointToLayer: (feature: any, latlng: any) => {                
                return L.shapeMarker(latlng, 
                  _this.addStyle(feature, mapLayerData, mapLayerViewGroups, true, colorTable));
                },
                onEachFeature: onEachFeature
              }).addTo(this.mymap);
          } else {
            // Display the default point marker and shadow
            let markerIcon = L.icon({
              iconUrl: 'assets/leaflet/css/images/marker-icon-2x.png',
              shadowUrl: 'assets/leaflet/css/images/marker-shadow.png',

              iconSize: [15, 25],
              shadowSize: [0, 0]
            });

            data = L.geoJson(tsfile, {
              pointToLayer: (geoJSONPoint: any, latlng: any) => {
                return L.marker(latlng, { icon: markerIcon });
              },
              onEachFeature: onEachFeature 
            }).addTo(this.mymap);
          }
          this.mapLayers.push(data)
          this.mapLayerIds.push(mapLayerData.geoLayerId)
        }
        // Check if refresh
        let refreshTime: string[] = this.mapService.getRefreshTime(mapLayerData.geolayerId ? mapLayerData.geolayerId : mapLayerData.geoLayerId)
        if (!(refreshTime.length == 1 && refreshTime[0] == "")) {
          this.addRefreshDisplay(refreshTime, mapLayerData.geolayerId);
        }

        // This function will add UI functionality to the map that allows the user to
        // click on a feature or hover over a feature to get more information. 
        // This information comes from the map configuration file
        function onEachFeature(feature: any, layer: any): void {

          layer.on({
            mouseover: showPopup,
            mouseout: removePopup
          });

        }

        function showPopup(e: any) {
          // let layer = e.target;
          // layer.setStyle({
          //   weight: 4,
          //   color: '#252525',
          //   dashArray: '',
          //   fillOpacity: 0.7
          // });

          let divContents: string = '';
          let divProperties: any = e.target.feature.properties;
          for (let prop in divProperties) {
            divContents += '<b>' + prop + '</b>' + ': ' + divProperties[prop] + '<br>';
          }
          document.getElementById('point-info').innerHTML = divContents;
        }

        function removePopup(e: any) {
          // data.resetStyle(e.target)
          updateTitleCard();
        }
      });
    }

    // The following map var needs to be able to access globally for onEachFeature();
    let map: any = this.mymap;
    

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
        .addTo(this.mymap)
        .open('home');

    // Add panels dynamically to the sidebar
    // sidebar.addPanel({
    //     id:   'testPane',
    //     tab:  '<i class="fa fa-gear"></i>',
    //     title: 'JS API',
    //     pane: '<div class="leaflet-sidebar-pane" id="home"></div>'
    // });    
    this.addInfoToSidebar(this.mapService.getProperties());
  }

  // Show all the layers on the map if Show All Layers is clicked
  displayAll() : void{
    if (!this.displayAllLayers) {
      for(let i = 0; i < this.mapLayers.length; i++) {
        this.mymap.addLayer(this.mapLayers[i]);
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
        this.mymap.removeLayer(this.mapLayers[i]);
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

  // Get the color for the marker
  getColor(layerData: any, symbol: any, strVal: string, colorTable: any) {
    
    switch(symbol.classificationType.toUpperCase()) {
      case "SINGLESYMBOL":
        return symbol.color;
      // TODO: jpkeahey 2020.04.29 - Categorized might be hard-coded
      case "CATEGORIZED":
        var color: string = 'black';      
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

        switch(layerData.symbol.colorRamp.toLowerCase()) {
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
      if (this.mapInitialized == true) this.mymap.remove();

      this.mapInitialized = false;

      this.mapLayers = [];
      this.mapLayerIds = [];

      clearInterval(this.interval);

      let mapConfig: string = this.route.snapshot.paramMap.get('id');
      
      // TODO: jpkeahey 2020.05.04 - DataPath might go here
      let configFile: string = 'assets/data-maps/map-configuration-files/' +
                                mapConfig + '.json';
      
      // loads data from config file and calls loadComponent when tsfile is defined
      this.mapService.urlExists(configFile).subscribe(() => {
        this.mapService.getJSONdata(configFile).subscribe(
          (mapConfigFile: string) => {
            // assign the configuration file for the map service
            this.mapService.setMapConfigFile(mapConfigFile);
            // add components dynamically to sidebar 
            this.addLayerToSidebar(mapConfigFile);
            // create the map.
            setTimeout(() => {
              this.buildMap();
            }, 100);
          }
        );
      }, (err: any) => {        
        configFile = 'assets/data-maps-default/map-configuration-files/' +
                      mapConfig + '.json';
        this.mapService.getJSONdata(configFile).subscribe(
          (mapConfigFile: string) => {
            // assign the configuration file for the map service
            this.mapService.setMapConfigFile(mapConfigFile);
            // add components dynamically to sidebar 
            this.addLayerToSidebar(mapConfigFile);
            // create the map.
            setTimeout(() => {
              this.buildMap();
            }, 100);
          }
        );
      });
      
    });    
  }

  // Either open or close the refresh display if the refresh icon is set from the
  // configuration file
  openCloseRefreshDisplay(refreshIndicator: any, refreshIcon: any) {
    let _this = this;
    if (this.showRefresh) {
      refreshIndicator.remove();
      refreshIcon.addTo(this.mymap);
      this.showRefresh = false;
    } else {
      refreshIcon.remove();
      refreshIndicator.addTo(this.mymap);
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
    this.mapService.getJSONdata(mapLayerFileName).subscribe (
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
    this.mymap.removeLayer(this.baseMaps[this.currentBackgroundLayer]);
    this.mymap.addLayer(this.baseMaps[id]);
    this.currentBackgroundLayer = id;
  }

  setBackgroundLayer(id: string): void {
    this.currentBackgroundLayer = id;
    let radio: any = document.getElementById(id + "-radio");
    radio.checked = "checked"
  }

  setDefaultBackgroundLayer(): void {
    let defaultName: string = this.mapService.getDefaultBackgroundLayer();
    this.currentBackgroundLayer = defaultName;
    let radio: any = document.getElementById(defaultName + "-radio");
    radio.checked = "checked";
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
  // TODO: jpkeahey 2020.04.30 - This does not work with categorized polygon yet
  toggleLayer(id: string): void {    
    let index = this.mapLayerIds.indexOf(id);    
    
    let checked = (<HTMLInputElement>document.getElementById(id + "-slider")).checked;
    
    if (!checked) {
      for (let i = 0; i < this.mapLayers[0].length; i++) {
        this.mymap.removeLayer(this.mapLayers[0][i]);
      }
      this.mymap.removeLayer(this.mapLayers[index]);      
      (<HTMLInputElement>document.getElementById(id + "-slider")).checked = false;
      let description = $("#description-" + id);
      description.css('visibility', 'hidden');
      description.css('height', 0);
      let symbols = $("#symbols-" + id);
      symbols.css('visibility', 'hidden');
      symbols.css('height', 0);
    } else {
      for (let i = 0; i < this.mapLayers[0]; i++) {
        console.log(this.mapLayers[0][i]);
        
        this.mymap.addLayer(this.mapLayers[0][i]);
      }
      this.mymap.addLayer(this.mapLayers[index]);
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
