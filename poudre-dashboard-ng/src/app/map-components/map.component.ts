import { Component, OnInit, AfterViewInit, Input, ViewChild, ComponentFactoryResolver,  ViewContainerRef, ViewEncapsulation }  from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { ActivatedRoute, Router }       from '@angular/router';

import { Observable, of }               from 'rxjs';
import { catchError }                   from 'rxjs/operators';

import * as $                           from "jquery";

import { MapService }                   from './map.service';
import { MapLayerDirective }            from './map-layer-control/map-layer.directive';

import { BackgroundLayerItemComponent } from './background-layer-control/background-layer-item.component';
import { BackgroundLayerComponent }     from './background-layer-control/background-layer.component';

import { MapLayerItemComponent }        from './map-layer-control/map-layer-item.component';
import { MapLayerComponent }            from './map-layer-control/map-layer.component';

import { SidePanelInfoComponent }       from './sidepanel-info/sidepanel-info.component';
import { SidePanelInfoDirective }       from './sidepanel-info/sidepanel-info.directive';
import { BackgroundLayerDirective }     from './background-layer-control/background-layer.directive';

//

import { LegendSymbolsComponent }       from './legend-symbols/legend-symbols.component'
import { LegendSymbolsDirective }       from './legend-symbols/legend-symbols.directive'


declare var L;
declare var feature;
declare var Rainbow;

let myLayers = [];
let ids = [];

let baseMaps = {};


@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None
})

export class MapComponent implements OnInit, AfterViewInit{

  // ViewChild is used to inject a reference to components.
  // This provides a reference to the html element <ng-template background-layer-hook></ng-template>
  // found in map.component.html
  @ViewChild(BackgroundLayerDirective) backgroundLayerComp: BackgroundLayerDirective;
  // This provides a reference to <ng-template map-layer-hook></ng-template> in map.component.html
  @ViewChild(MapLayerDirective) LayerComp: MapLayerDirective;
  // This provides a reference to <ng-template side-panel-info-host></ng-templae> in map.component.html
  @ViewChild(SidePanelInfoDirective) InfoComp: SidePanelInfoDirective;

  //

  @ViewChild(LegendSymbolsDirective) LegendSymbolsComp: LegendSymbolsDirective;

  infoViewContainerRef: ViewContainerRef; // Global value to access container ref in order to add and remove
                                      // sidebar info components dynamically.
  layerViewContainerRef: ViewContainerRef; // Global value to access container ref in order to add and remove 
                                      // map layer components dynamically.
  backgroundViewContainerRef: ViewContainerRef; // Global value to access container ref in order to add and remove
                                      // background layer components dynamically.

  //

  legendSymbolsViewContainerRef: ViewContainerRef;

  mymap; // The leaflet map
  sidebar_initialized: boolean = false; // Boolean to indicate whether the sidebar has been initialized. 
                                        // Don't need to waste time initializing sidebar twice, but rather edit
                                        // information in the sidebar.
  sidebar_layers: any[] = []; // An array to hold sidebar layer components to easily remove later.
  sidebar_background_layers: any[] = [];
  public mapConfig: string;
  mapInitialized: boolean = false;
  toggle: boolean = false;
  interval: any = null; // Time interval for potentially refreshing layers
  displayAllLayers: boolean = true; // Boolean to know if all layers are currently displayed or not
  showRefresh: boolean = true; // Boolean of whether or not refresh is displayed

  currentBackgroundLayer: string;



  /**
  * Used to hold names of the data classified as 'singleSymbol'. Will be used for the map legend/key.
  * @type {string[]}
  */
  singleSymbolKeyNames = [];
  /**
 * Used to hold colors of the data classified as 'singleSymbol'. Will be used for the map legend/key.
 * @type {string[]}
 */
  singleSymbolKeyColors = [];
  /**
 * Used to hold names of the data classified as 'categorized'. Will be used for the map legend/key.
 * @type {string[]}
 */
  categorizedKeyNames = [];
  /**
 * Used to hold colors of the data classified as 'categorized'. Will be used for the map legend/key.
 * @type {string[]}
 */
  categorizedKeyColors = [];
  categorizedClassificationField = [];
  /**
 * Used to hold the name of the data classified as 'graduated'. Will be used for the map legend/key.
 * @type {string[]}
 */
  graduatedKeyNames = [];
  /**
 * Used to hold colors of the data classified as 'graduated'. Will be used for the map legend/key.
 * @type {string[]}
 */
  graduatedKeyColors = [];

  graduatedClassificationField = [];

  /*
  * http - using http resources
  * route - used for getting the parameter 'id' passed in by the url and from the router.
  * componentFactoryResolver - add components dynamically
  * mapService - reference to map.service.ts
  * activeRoute - not currently being used
  * router - used to direct to error page in handle error function
  */
  constructor(private http: HttpClient, 
    private route: ActivatedRoute, 
    private componentFactoryResolver: ComponentFactoryResolver, 
    private mapService: MapService, 
    private activeRoute: ActivatedRoute, 
    private router: Router) {
  }

  // Add content to the info tab of the sidebar
  addInfoToSidebar(properties: any): void {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(SidePanelInfoComponent);
    let infoViewContainerRef = this.InfoComp.viewContainerRef;
    let componentRef = infoViewContainerRef.createComponent(componentFactory);
    (<SidePanelInfoComponent>componentRef.instance).properties = properties;
  }

  // Dynamically add the layer information to the sidebar coming in from the ts configuration file
  addLayerToSidebar(configFile) {
    // reset the sidebar components so elements are added on top of each other
    this.resetSidebarComponents();
    //creates new layerToggle component in sideBar for each layer specified in the config file, sets data based on map service
    let dataLayers: any = configFile.dataLayers;
    dataLayers.forEach((dataLayer) => {
      // Create the Map Layer Component
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(MapLayerComponent);
      this.layerViewContainerRef = this.LayerComp.viewContainerRef;
      let componentRef = this.layerViewContainerRef.createComponent(componentFactory);

      // Initialize data for the map layer component.
      let component = <MapLayerComponent>componentRef.instance;
      component.layerData = dataLayer;
      component.mapReference = this;
      let id: string = dataLayer.geolayerId;
      component.layerViewConfiguration = this.mapService.getLayerViewFromId(id);

      // Save the reference to this component so it can be removed when resetting the page.
      this.sidebar_layers.push(componentRef);
    })
    let backgroundMapLayers: any = configFile.backgroundLayers[0].mapLayers;
    backgroundMapLayers.forEach((backgroundLayer) => {
      // Create the background map layer component
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(BackgroundLayerComponent);
      this.backgroundViewContainerRef = this.backgroundLayerComp.viewContainerRef;
      let componentRef = this.backgroundViewContainerRef.createComponent(componentFactory);

      //Intialize the data for the background map layer component
      let component = <BackgroundLayerComponent>componentRef.instance;
      component.data = backgroundLayer;
      component.mapReference = this;

      // Save the reference to this component so it can be removed when resetting the page.
      this.sidebar_background_layers.push(componentRef);
    })
  }

  addPopup(URL: string, featureProperties: any, layerViewId: string): void {
    let _this = this;
    URL = encodeURI(this.expandParameterValue(URL, featureProperties, layerViewId));
    /* Add a title to the map */
    let popup = L.control({position: 'bottomright'});
    popup.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'popup resizable');
        this.update();
        return this._div;
    };
    popup.update = function (props) {
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
    popup.getContainer().addEventListener('mouseover', function () {
        _this.mymap.dragging.disable();
    });

    // Re-enable dragging when user's cursor leaves the element
    popup.getContainer().addEventListener('mouseout', function () {
        _this.mymap.dragging.enable();
    });

    function exit(): void {
      popup.remove();
    }

    function openWindow(): void {
      window.open(document.getElementById('popup-iframe').getAttribute('src'))
    }
  }

  // If there is a refresh component on the map then add a display that shows time since last refresh
  addRefreshDisplay(refreshTime: string[], id: string) : void {
    let _this = this;
    let seconds: number = this.getSeconds(+refreshTime[0], refreshTime[1]);
    let refreshIndicator = L.control({position: 'topleft'});
    refreshIndicator.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    refreshIndicator.update = function(props) {
      this._div.innerHTML = '<p id="refresh-display"> Time since last refresh: ' + new Date(0).toISOString().substr(11, 8) + '</p>';
    };
    refreshIndicator.addTo(this.mymap);
    this.refreshMap(seconds, id);
    let refreshIcon = L.control({position: 'topleft'})
    refreshIcon.onAdd = function(map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    }
    refreshIcon.update = function(props){
      this._div.innerHTML = "<p id='refresh-icon' class='fa fa-clock-o'></p>";
    }
    $("#refresh-display").on('click', function(){
      _this.openCloseRefreshDisplay(refreshIndicator, refreshIcon);
    });
    $("#refresh-icon").on('click', function(){
      _this.openCloseRefreshDisplay(refreshIndicator, refreshIcon);
    });
  }

  // Add the style to the features
  addStyle(layerName: string, mapLayerViewGroups: any, marker: boolean, feature: any): {}{
    let symbolData: any = this.mapService.getSymbolDataFromID(layerName);

    let style: {} = {};

    // TODO @jurentie 05-16-2019 - what to do if symbolData.var is not found?
    if(marker){
      style = { 
          weight: symbolData.weight,
          opacity: symbolData.opacity,
          stroke: symbolData.outlineColor == "" ? false : true,
          color: symbolData.outlineColor,
          fillOpacity: symbolData.fillOpacity,
          fillColor: this.getColor(symbolData, feature['properties'][symbolData.classificationField]),
          shape: symbolData.marker,
          radius: symbolData.size,
          dashArray: symbolData.dashArray,
          lineCap: symbolData.lineCap,
          lineJoin: symbolData.lineJoin
        }
    }else{
      style = {
        "color": symbolData.color,
        "size": symbolData.size,
        "fillOpacity": symbolData.fillOpacity,
        "weight": symbolData.lineWidth, 
        "dashArray": symbolData.linePattern
      }
    }
    return style
  }

  // Build the map using leaflet and configuartion data
  buildMap(): void {

    let _this = this;

    this.mapInitialized = true;

    // Get the zoomInfo as array from the config file.
    // [initialExtent, minumumExtent, maxiumumExtent]
    let zoomInfo = this.mapService.getZoomInfo();
    // Get the center from the config file.
    let center = this.mapService.getCenter();

    // Create background layers dynamically from the congiguration file.
    let backgroundLayers: any[] = this.mapService.getBackgroundLayers();
    backgroundLayers.forEach((backgroundLayer) => {
      let tempBgLayer = L.tileLayer(backgroundLayer.tileLayer, {
        attribution: backgroundLayer.attribution,
        id: backgroundLayer.id
      })
      baseMaps[backgroundLayer.name] = tempBgLayer;
    })

    // Create a Leaflet Map.
    // Set the default layers that appear on initialization
    this.mymap = L.map('mapid', {
        center: center,
        zoom: zoomInfo[0],
        minZoom: zoomInfo[1],
        maxZoom: zoomInfo[2],
        layers: [baseMaps[this.mapService.getDefaultBackgroundLayer()]],
        zoomControl: false
    });

    // Set the default layer radio check to true
    this.setDefaultBackgroundLayer();

    /* Add layers to the map */
    if(this.mapService.getBackgroundLayersMapControl()){
      L.control.layers(baseMaps).addTo(this.mymap);
    }

    this.mymap.on('baselayerchange', (d) => {
      _this.setBackgroundLayer(d.name);
    });

    // Get the map name from the config file.
    let mapName: string = this.mapService.getName();
    /* Add a title to the map */
    let mapTitle = L.control({position: 'topleft'});
    mapTitle.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
    mapTitle.update = function (props) {
        this._div.innerHTML = ('<div id="title-card"><h4>' + mapName + '</h4>');
    };
    mapTitle.addTo(this.mymap);

    // Add home and zoom in/zoom out control to the top right corner
    L.Control.zoomHome({position: 'topright'}).addTo(this.mymap);

    // Show the lat and lang of mouse position in the bottom left corner
    L.control.mousePosition({position: 'bottomleft',lngFormatter: function(num) {
        let direction = (num < 0) ? 'W' : 'E';
        let formatted = Math.abs(L.Util.formatNum(num, 6)) + '&deg ' + direction;
        return formatted;
    },
    latFormatter: function(num) {
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
    let mapLayers= this.mapService.getDataLayers();
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
      let mouseover: boolean = false;
      let click: boolean = false;
      let instruction: string = "";
      allLayerViewUIEventHandlers.forEach((handler) => {
        let eventType = handler.eventType;
        switch(eventType.toUpperCase()){
          case "MOUSEOVER":
            mouseover = true;
            if (click){
              instruction = "Mouse over or click on a feature for more information";
            }else{
              instruction = "Mouse over a feature for more infromation";
            }
            break;
          case "CLICK":
            click = true;
            if (mouseover) {
              instruction = "Mouse over or click on a feature for more information";
            }else{
              instruction = "Click on a feature for more information";
            }
            break;
        }
      })
      let divContents: string = "";
      divContents = ('<h4>' + mapName + '</h4>' +
                    '<p id="point-info"></p>');
      if(instruction != ""){
        divContents += ('<hr/>' +
                        '<p><i>' + instruction + '</i></p>');
      }
      div.innerHTML = divContents;
    }

    //Dynamically load layers into array
    for (var i = 0; i < mapLayers.length; i++){
      let mapLayerData = mapLayers[i];
      let mapLayerFileName = mapLayerData.source;
      let symbol = this.mapService.getSymbolDataFromID(mapLayerData.geolayerId);
      this.getMyJSONData(mapLayerFileName).subscribe (
        tsfile => {
          layerViewUIEventHandlers = this.mapService.getLayerViewUIEventHandlersFromId(mapLayerData.geolayerId);
          if (mapLayerData.featureType == "line"
              || mapLayerData.featureType == "polygon"){
            let data = L.geoJson(tsfile, {
                onEachFeature: onEachFeature,
                style: this.addStyle(mapLayerData.geolayerId, mapLayerViewGroups, false, null)
            }).addTo(this.mymap);
            myLayers.push(data)
            ids.push(mapLayerData.geolayerId)
          }else{
            let data = L.geoJson();
            if(symbol.classification.toUpperCase() != "DEFAULTMARKER"){
              data = L.geoJson(tsfile, {
                pointToLayer: (feature, latlng) => {
                  return L.shapeMarker(latlng, 
                    _this.addStyle(mapLayerData.geolayerId, mapLayerViewGroups, true, feature));
                  },
                  onEachFeature: onEachFeature
                }).addTo(this.mymap);
            }else{
              data = L.geoJson(tsfile, { onEachFeature: onEachFeature }).addTo(this.mymap);
            }
            
            myLayers.push(data)
            ids.push(mapLayerData.geolayerId)
          }
          // Check if refresh
          let refreshTime: string[] = this.mapService.getRefreshTime(mapLayerData.geolayerId)
          if(!(refreshTime.length == 1 && refreshTime[0] == "")){
            this.addRefreshDisplay(refreshTime, mapLayerData.geolayerId);
          }
        }
      );
    }

    // The following map var needs to be able to access globally for onEachFeature();
    let map: any = this.mymap;
    // This function will add UI functionatily to the map that allows the user to
    // click on a feauture or hover over a feature to get more information. 
    // This information comes from the map configuration file
    function onEachFeature(feature, layer): void {
      let featureProperties: string = feature.properties;
      layerViewUIEventHandlers.forEach((handler) => {
        let layerViewId = handler.layerViewId;
        let eventType = handler.eventType;
        let eventAction = handler.eventAction;
        let propertiesText = handler.properties.text;
        let linkProperties = handler.properties.link;
        switch(eventType.toUpperCase()){
          case "MOUSEOVER": 
            layer.on({
              mouseover: (e) => {
                let divContents: string = "";
                divContents += _this.checkNewLine(_this.expandParameterValue(propertiesText, featureProperties, layerViewId));
                switch(eventAction.toUpperCase()){
                  case "TRANSIENTPOPUP":
                    layer.bindPopup(divContents);
                    var popup = e.target.getPopup();
                    popup.setLatLng(e.latlng).openOn(map);
                    break;
                  case "POPUP":
                    layer.bindPopup(divContents);
                    var popup = e.target.getPopup();
                    popup.setLatLng(e.latlng).openOn(map);
                    break;
                  case "TRANSIENTUPDATETITLECARD":
                    document.getElementById('point-info').innerHTML = divContents;
                  case "UPDATETITLECARD":
                    document.getElementById("point-info").innerHTML = divContents;
                    break;
                  default:
                    break;
                }
              },
              mouseout: (e) => {
                if(eventAction.toUpperCase() == "TRANSIENTPOPUP"){
                  e.target.closePopup();
                }
                if(eventAction.toUpperCase() == "TRANSIENTUPDATETITLECARD"){
                  updateTitleCard();
                }
              }
            })
            break;
          case "CLICK":
            layer.on({
              click: (e) => {
                let divContents: string = "";
                divContents += _this.checkNewLine(_this.expandParameterValue(propertiesText, featureProperties, layerViewId));
                let linkPopup: boolean = false;
                if(linkProperties && linkProperties.type != ""){
                  divContents += "Link:<br>";
                  let target = "";
                  if(linkProperties.action == "newTab" || linkProperties.action == "newWindow"){
                    target = "_blank"
                    divContents += "<a href='" + encodeURI(_this.expandParameterValue(linkProperties.URL, featureProperties, layerViewId)) + "' target='" + target + "'>" + linkProperties.name +"</a>";
                  }
                  if(linkProperties.action == "popup"){
                    linkPopup = true;
                  } 
                }
                switch(eventAction.toUpperCase()){
                  case "POPUP":
                    if(linkPopup){
                      divContents += "<span id='externalLink'>Open Water Foundation Site</span>"
                    }
                    layer.bindPopup(divContents);
                    var popup = e.target.getPopup();
                    popup.setLatLng(e.latlng).openOn(map);
                    if(linkPopup){
                      $("#externalLink").click(() => {
                          _this.addPopup(linkProperties.URL, featureProperties, layerViewId);
                      });
                    }
                    break;
                  case "UPDATETITLECARD":
                    document.getElementById("point-info").innerHTML = divContents;
                  default:
                    break;
                }
              }
            });
          default:
            break;
        }
      })
    }

    // If the sidebar has not already been initialized once then do so.
    if (this.sidebar_initialized == false){
      this.createSidebar();
    }
  }

  checkNewLine(text: string): string{

    let formattedText: string = "<p>";
    // Search for new line character:
    for(var i = 0; i < text.length; i++){
      let char: string = text.charAt(i);
      if(char == "\n"){
        formattedText += '<br/>';
      }
      else {
        formattedText += char;
      }
    }
    formattedText += "</p>";
    return formattedText;
  }

  expandParameterValue(parameterValue: string, properties: {}, layerViewId: string): string{
    let mapService = this.mapService;
    let searchPos: number = 0,
        delimStart: string = "${",
        delimEnd: string = "}";
    let b: string = "";
    while(searchPos < parameterValue.length){
      let foundPosStart: number = parameterValue.indexOf(delimStart),
          foundPosEnd: number = parameterValue.indexOf(delimEnd),
          propVal: string = "",
          propertySearch: string = parameterValue.substr((foundPosStart + 2), ((foundPosEnd - foundPosStart) - 2));

      let propValues: string[] = propertySearch.split(":");
      let propType: string = propValues[0];
      let propName: string = propValues[1];

      // Use feature properties
      if(propType == "feature"){
        propVal = properties[propName];
      }
      else if(propType == "map"){
        let mapProperties: any = mapService.getProperties();
        let propertyLine: string[] = propName.split(".");
        propVal = mapProperties;
        propertyLine.forEach((property) => {
          propVal = propVal[property];
        })
      }
      else if(propType == "layer"){
        let layerProperties: any = mapService.getLayerFromId(layerViewId);
        let propertyLine: string[] = propName.split(".");
        propVal = layerProperties;
        propertyLine.forEach((property) => {
          propVal = propVal[property];
        })
      }
      else if(propType == "layerview"){
        let layerViewProperties = mapService.getLayerViewFromId(layerViewId);
        let propertyLine: string[] = propName.split(".");
        propVal = layerViewProperties;
        propertyLine.forEach((property) => {
          propVal = propVal[property];
        })
      }
      // How to handle if not found?
      if(propVal == undefined){
        propVal =  propertySearch;
      }
      if(foundPosStart == -1){
        return b;
      }

      propVal = String(propVal);

      b = parameterValue.substr(0, foundPosStart) + propVal + parameterValue.substr(foundPosEnd + 1, parameterValue.length);
      searchPos = foundPosStart + propVal.length;
      parameterValue = b;
    }
    return b;
  }

  test(): void {
    console.log("here");
  }

  // Create the sidebar on the left side of the map
  createSidebar(): void {
    this.sidebar_initialized = true;
    // create the sidebar instance and add it to the map
    let sidebar = L.control.sidebar({ container: 'sidebar' })
        .addTo(this.mymap)
        .open('home');
    // add panels dynamically to the sidebar
    sidebar.addPanel({
        id:   'testPane',
        tab:  '<i class="fa fa-gear"></i>',
        title: 'JS API',
        pane: '<div class="leaflet-sidebar-pane" id="home"></div>'
    })
    this.addInfoToSidebar(this.mapService.getProperties())
  }

  // Show all the layers on the map if Show All Layers is clicked
  displayAll() : void{
    if (!this.displayAllLayers) {
      for(var i = 0; i < myLayers.length; i++){
        this.mymap.addLayer(myLayers[i]);
        document.getElementById(ids[i] + "-slider").setAttribute("checked", "checked");
      }
      document.getElementById("display-button").innerHTML = "Hide All Layers";
      this.displayAllLayers = true;
    }
    else {
      for(var i = 0; i < myLayers.length; i++){
        this.mymap.removeLayer(myLayers[i]);
        document.getElementById(ids[i] + "-slider").removeAttribute("checked");
      }
      document.getElementById("display-button").innerHTML = "Show All Layers";
      this.displayAllLayers = false;
    }
  }

  // get the color for the marker
  getColor(symbol: any, strVal: string){
    switch(symbol.classification.toUpperCase()){
      case "SINGLESYMBOL":
        return symbol.color;
      case "CATEGORIZED":
        let tableHolder = symbol.colorTable;
        let colorTable = tableHolder.substr(1, tableHolder.length - 2).split(/[\{\}]+/);
        for(var i = 0; i < colorTable.length; i++){
          if(colorTable[i] == strVal){
            return colorTable[i+1]
          }
        }
        break;
      case "GRADUATED":
        let colors = new Rainbow();
        let colorRampMin: number = 0;
        let colorRampMax: number = 100
        if(symbol.colorRampMin != ""){
          colorRampMin = symbol.colorRampMin;
        }
        if(symbol.colorRampMax != ""){
          colorRampMax = symbol.colorRampMax;
        }
        colors.setNumberRange(colorRampMin, colorRampMax);
        switch(symbol.colorRamp.toLowerCase()){
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
            for(var i = 0; i < colorsArray.length; i++){
              if(colorsArray[i].charAt(0) == 'r'){
                let rgb = colorsArray[i].substr(4, colorsArray[i].length-1).split(',');
                let r = (+rgb[0]).toString(16);
                let g = (+rgb[1]).toString(16);
                let b = (+rgb[2]).toString(16);
                if(r.length == 1)
                    r = "0" + r;
                if(g.length == 1)
                    g = "0" + g;
                if(b.length == 1)
                    b = "0" + b;
                colorsArray[i] = "#" + r + g + b;
              }
            }
            colors.setSpectrum(...colorsArray);
          }
          return '#' + colors.colorAt(strVal);
          break;
    } 
    return symbol.color;
  }

  // Read data from a json file
  getMyJSONData(path_to_json): Observable<any> {
    return this.http.get<any>(path_to_json)
    .pipe(
      catchError(this.handleError<any>(path_to_json, []))
    );
  }

  // Get the number of seconds from a time interval specified in the configuraiton file
  getSeconds(timeLength: number, timeInterval: string): number{
    if (timeInterval == "seconds"){
      return timeLength;
    }
    else if (timeInterval == "minutes"){
      return timeLength * 60;
    }
    else if (timeInterval == "hours"){
      return timeLength * 60 * 60;
    }
  }

  // Handle error if the json file cannot be read properly
  private handleError<T>(path: string, result?: T) {
    return (error: any): Observable<T>  => {
        console.error("The JSON File '" + path + "' could not be read");
        this.router.navigateByUrl('map-error');
        return of(result as T);
    };
  }

  /*Make resizable div by Hung Nguyen*/
  /*https://codepen.io/anon/pen/OKXNGL*/
  makeResizableDiv(div): void {
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
    currentResizer.addEventListener('mousedown', function(e) {
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

  function resize(e) {
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
  
    function stopResize() {
      window.removeEventListener('mousemove', resize)
    }
  }

  // This function is called on initialization of the component
  ngOnInit() {
    // When the parameters in the URL are changed the map will refresh and load according to new 
    // configuration data
    this.activeRoute.params.subscribe(routeParams => {

    //   // First clear map.
      if(this.mapInitialized == true){
        this.mymap.remove(); 
      }

      this.mapInitialized = false;

      myLayers = [];
      ids = [];

      clearInterval(this.interval);

      this.mapConfig = this.route.snapshot.paramMap.get('id');
      var configFile = "assets/map-configuration-files/" + this.mapConfig + ".json";
      // loads data from config file and calls loadComponent when tsfile is defined
      this.getMyJSONData(configFile).subscribe (
        mapConfigFile => {
          // assign the configuration file for the map service
          this.mapService.setMapConfigFile(mapConfigFile);
          // add components dynamically to sidebar 
          this.addLayerToSidebar(mapConfigFile);
          // create the map.
          setTimeout(()=> {
            this.buildMap();
          }, 100);
        }
      );
    });
  }

  ngAfterViewInit(){
    // setTimeout(()=> {
    //   this.addSymbolDataToLegendComponent();
    // }, 500)
  }

  // Either open or close the refresh display if the refresh icon is set from the configuration file
  openCloseRefreshDisplay(refreshIndicator: any, refreshIcon: any){
    let _this = this;
    if(this.showRefresh){
      refreshIndicator.remove();
      refreshIcon.addTo(this.mymap);
      this.showRefresh = false;
    }else{
      refreshIcon.remove();
      refreshIndicator.addTo(this.mymap);
      this.showRefresh = true;
    }
    $("#refresh-display").on('click', function(){
      _this.openCloseRefreshDisplay(refreshIndicator, refreshIcon);
    });
    $("#refresh-icon").on('click', function(){
      _this.openCloseRefreshDisplay(refreshIndicator, refreshIcon);
    });
  }

  // Refresh a layer on the map
  refreshLayer(id: string): void {
    let index = ids.indexOf(id);
    let layer: any = myLayers[index];
    let mapLayerData: any = this.mapService.getLayerFromId(id);
    let mapLayerFileName: string = mapLayerData.source;
    this.getMyJSONData(mapLayerFileName).subscribe (
        tsfile => {
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
      if(seconds > 0){
        if(this.showRefresh){
          document.getElementById('refresh-display').innerHTML = "Time since last refresh: " + date.toString().substr(16, 8);
        }
        secondsSinceRefresh ++;
        if(secondsSinceRefresh == 60){
          secondsSinceRefresh = 0
          minutesSinceRefresh ++;
        }
        if(minutesSinceRefresh == 60){
          minutesSinceRefresh = 0;
          hoursSinceRefresh ++;
        }
        date.setSeconds(secondsSinceRefresh);
        date.setMinutes(minutesSinceRefresh);
        date.setHours(hoursSinceRefresh); 
        seconds --;
      }
      else {
        if(this.showRefresh){
          document.getElementById('refresh-display').innerHTML = "Time since last refresh: " + date.toString().substr(16, 8);
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
    }, 1000)
  }

  // Clears the current data displayed in the sidebar
  // This makes sure that the sidebar is cleared when adding new components due to a page refresh.
  resetSidebarComponents(): void {
    let _this = this;
    this.sidebar_layers.forEach(function(layerComponent){
      _this.layerViewContainerRef.remove(_this.layerViewContainerRef.indexOf(layerComponent));
    })
    this.sidebar_background_layers.forEach(function(layerComponent){
      _this.backgroundViewContainerRef.remove(_this.backgroundViewContainerRef.indexOf(layerComponent));
    })
  }

  setDefaultBackgroundLayer(): void {
    let defaultName: string = this.mapService.getDefaultBackgroundLayer();
    this.currentBackgroundLayer = defaultName;
    let radio: any = document.getElementById(defaultName + "-radio");
    radio.checked = "checked";
  }

  selectBackgroundLayer(id: string): void {
    console.log(this.currentBackgroundLayer);
    this.mymap.removeLayer(baseMaps[this.currentBackgroundLayer]);
    this.mymap.addLayer(baseMaps[id]);
    this.currentBackgroundLayer = id;
  }

  setBackgroundLayer(id: string): void {
    console.log('here')
    this.currentBackgroundLayer = id;
    let radio: any = document.getElementById(id + "-radio");
    radio.checked = "checked"
  }

  // NOT CURRENTLY IN USE:
  toggleDescriptions() {
    $(document).ready(function() {
      if ( $('.description').css('visibility') == 'hidden' ) {
        $('.description').css('visibility','visible');
        $('.description').css('height', '100%');
      }
      else {
        $('.description').css('visibility','hidden');
        $('.description').css('height', 0);
      }
    });
  }

  //triggers showing and hiding layers from sidebar controls
  toggleLayer(id: string): void {
    let index = ids.indexOf(id);

    let checked = document.getElementById(id + "-slider").getAttribute("checked");

    if(checked == "checked") {
      this.mymap.removeLayer(myLayers[index]);
      document.getElementById(id + "-slider").removeAttribute("checked");
    } else {
      this.mymap.addLayer(myLayers[index]);
      document.getElementById(id + "-slider").setAttribute("checked", "checked");
    }
  }

  // NOT CURRENTLY IN USE:
  toggleSymbols() {
    $(document).ready(function() {
      if ( $('.symbols').css('visibility') == 'hidden' ) {
        $('.symbols').css('visibility','visible');
        $('.symbols').css('height', '100%');
      }
      else {
        $('.symbols').css('visibility','hidden');
        $('.symbols').css('height', 0);
      }
    });
  }
}
