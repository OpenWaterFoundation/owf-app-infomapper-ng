import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver,  ViewContainerRef, ViewEncapsulation }  from '@angular/core';
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


declare var L;
declare var feature;

let myLayers = [];
let ids = [];

let baseMaps = {};



@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None
})

export class MapComponent implements OnInit {

  // ViewChild is used to inject a reference to components.
  // This provides a reference to the html element <ng-template background-layer-hook></ng-template>
  // found in map.component.html
  @ViewChild(BackgroundLayerDirective) backgroundLayerComp: BackgroundLayerDirective;
  // This provides a reference to <ng-template map-layer-hook></ng-template> in map.component.html
  @ViewChild(MapLayerDirective) LayerComp: MapLayerDirective;
  // This provides a reference to <ng-template side-panel-info-host></ng-templae> in map.component.html
  @ViewChild(SidePanelInfoDirective) InfoComp: SidePanelInfoDirective;
  infoViewContainerRef: ViewContainerRef; // Global value to access container ref in order to add and remove
                                      // sidebar info components dynamically.
  layerViewContainerRef: ViewContainerRef; // Global value to access container ref in order to add and remove 
                                      // map layer components dynamically.
  backgroundViewContainerRef: ViewContainerRef; // Global value to access container ref in order to add and remove
                                      // background layer components dynamically.

  mymap; // The leaflet map
  style_index: number = 0; // Used as a bit of a workaround for loading style information for data layers
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
  addStyle(layerName, mapLayerViewGroups): {}{
    let testing: boolean = false;
    let symbolData: any = null;

    if (testing) {
      symbolData = mapLayerViewGroups[0].symbol;
    }else{
      symbolData = this.mapService.getSymbolDataFromID(layerName);
    }

    // TODO @jurentie 05-16-2019 - what to do if symbolData.var is not found?
    //let symbolData: any = mapLayerViewGroups[this.style_index].symbol;
    let style = {
      "color": symbolData.color,
      "size": symbolData.size,
      "fillOpacity": symbolData.fillOpacity,
      "weight": symbolData.lineWidth, 
      "dashArray": symbolData.linePattern
    }
    this.style_index += 1;
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

    // Get the map layers files:
    let mapLayers= this.mapService.getLayerFiles();
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
      this.getMyJSONData(mapLayerFileName).subscribe (
        tsfile => {
          layerViewUIEventHandlers = this.mapService.getLayerViewUIEventHandlersFromId(mapLayerData.geolayerId);
          if (mapLayerData.featureType == "line"
              || mapLayerData.featureType == "polygon"){
            let data = L.geoJson(tsfile, {
                onEachFeature: onEachFeature,
                style: this.addStyle(mapLayerData.geolayerId, mapLayerViewGroups)
            }).addTo(this.mymap);
            myLayers.push(data)
            ids.push(mapLayerData.geolayerId)
          }else{
            let data = L.geoJson(tsfile, {onEachFeature: onEachFeature}).addTo(this.mymap);
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
        switch(eventType.toUpperCase()){
          case "MOUSEOVER": 
            layer.on({
              mouseover: (e) => {
                let divContents: string = "";
                divContents += expandParameterValue(propertiesText, featureProperties, layerViewId);
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
                divContents += expandParameterValue(propertiesText, featureProperties, layerViewId);
                switch(eventAction.toUpperCase()){
                  case "POPUP":
                    layer.bindPopup(divContents);
                    var popup = e.target.getPopup();
                    popup.setLatLng(e.latlng).openOn(map);
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

    /* This function is also called by the onEachFeature function. It is used
    once a basin has been highlighted over, then the user moves the mouse it will
    reset the layer back to the original state. */
    function resetHighlight(e) {
      //  data1.setStyle({
      //      weight: 6,
      //      color: 'blue',
      //      dashArray: '',
      //  });
        let layer = e.target;
        layer.setStyle({
            weight: 2,
            color: '#666',
            dashArray: '',

        });

    }

    function onEachFeatureStation(feature, layer) {

        let popupContent = '<table>';

        for (var p in feature.properties) {
            //creates link for website
            if (p == 'Website'){
                popupContent += '<tr><td>' + (p) + '</td><td>'+ '<a href="' + feature.properties[p] + '">' + feature.properties[p] + '</td></tr>';
            }
            //removes all flag properties from table
            else if ((p.substr(p.length-4) != 'Flag')){
                //if (feature.properties[p] =! ''){
                    popupContent += '<tr><td>' + (p) + '</td><td>'+ feature.properties[p] + '</td></tr>';
                //}
            }
        }
        popupContent += '</table>';

        var myPopup = L.popup({maxHeight: 200, minWidth: '0%'}).setContent(popupContent);

        layer.bindPopup(myPopup);
    }

    function whenClicked(e) {
        console.log(feature.properties);
        //window.open("https://www.google.com");
    }

    function checkNewLine(text: string): string{

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

    let mapService = this.mapService;
    function expandParameterValue(parameterValue: string, properties: {}, layerViewId: string): string{
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
          console.log("here")
          return checkNewLine(b);
        }
  
        propVal = String(propVal);

        b = parameterValue.substr(0, foundPosStart) + propVal + parameterValue.substr(foundPosEnd + 1, parameterValue.length);
        searchPos = foundPosStart + propVal.length;
        parameterValue = b;
      }
      return checkNewLine(b);
    }

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
        this.router.navigateByUrl('error');
        return of(result as T);
    };
  }

  // This function is called on initialization of the component
  ngOnInit() {
    // When the parameters in the URL are changed the map will refresh and load according to new 
    // configuration data
    this.activeRoute.params.subscribe(routeParams => {
      // First clear map.
      if(this.mapInitialized == true){
        this.mymap.remove(); 
      }
      // Reset style index
      this.style_index = 0;

      this.mapInitialized = false;

      myLayers = [];
      ids = [];

      clearInterval(this.interval);

      this.mapConfig = this.route.snapshot.paramMap.get('id');
      var configFile = "assets/map-configuration-files/" + this.mapConfig + ".json";
      //loads data from config file and calls loadComponent when tsfile is defined
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
}
