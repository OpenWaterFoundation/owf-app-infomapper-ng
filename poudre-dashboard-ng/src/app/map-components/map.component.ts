import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver,  ViewContainerRef }  from '@angular/core';
import { HttpClient }                from '@angular/common/http';
import { ActivatedRoute, Router }    from '@angular/router';

import { Observable, of }            from 'rxjs';
import { catchError }                from 'rxjs/operators';

import * as $                        from "jquery";

import { MapService }                from './map.service';
import { MapDirective }              from './map.directive';

import { LayerItemComponent }        from './layer/layer-item.component';
import { LayerComponent }            from './layer/layer.component';

import { SidePanelInfoComponent }    from './sidepanel-info/sidepanel-info.component';
import { SidePanelInfoDirective }    from './sidepanel-info/sidepanel-info.directive';

import '../../assets/leaflet/javascript/leaflet.zoomhome.min.js';
import '../../assets/leaflet/javascript/L.Control.MousePosition.js';
import '../../assets/leaflet/javascript/papaparse.js';
import '../../assets/leaflet/javascript/L.Control.MousePosition.js';
import '../../assets/leaflet/css/L.Control.MousePosition.css';

declare var L;
declare var feature;

let myLayers = [];
let ids = [];

@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.css', '../../assets/leaflet/css/leaflet.zoomhome.css', '../../assets/leaflet/css/L.Control.MousePosition.css', '../../assets/leaflet/css/style1.css'],
  templateUrl: './map.component.html'
})

export class MapComponent implements OnInit {

  @Input() layers: LayerItemComponent[];

  // Used as insertion point into template for componentFactoryResolver to create component dynamically
  @ViewChild(MapDirective) MapHost: MapDirective;
  // Used as insertion point into template for Information tab
  @ViewChild(SidePanelInfoDirective) InfoComp: SidePanelInfoDirective;

  mymap; // The leaflet map
  style_index: number = 0; // Used as a bit of a workaround for loading style information for data layers
  sidebar_initialized: boolean = false; // Boolean to indicate whether the sidebar has been initialized. 
                                        // Don't need to waste time initializing sidebar twice, but rather edit
                                        // information in the sidebar.
  sidebar_layers: any[] = []; // An array to hold sidebar layer components to easily remove later.
  public mapConfig: string;
  viewContainerRef: ViewContainerRef; // Global value to access container ref in order to add and remove 
                                      // components dynamically
  mapInitialized: boolean = false;

  toggle: boolean = false;

  interval: any = null; // Time interval for potentially refreshing layers

  displayAllLayers: boolean = true; // Boolean to know if all layers are currently displayed or not

  showRefresh: boolean = true; // Boolean of whether or not refresh is displayed

  /*
  * http - using http resources
  * route - used for getting the parameter 'id' passed in by the url and from the router.
  * componentFactoryResolver - add components dynamically
  * mapService - reference to map.service.ts
  * activeRoute - not currently being used
  * router - used to direct to error page in handle error function
  */
  constructor(private http: HttpClient, private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver, private mapService: MapService, private activeRoute: ActivatedRoute, private router: Router) {
    //pass a reference to this map component to the mapService, so functions here can be called from the layer component
    mapService.saveMapReference(this);
  }

  // Add content to the info tab of the sidebar
  addInfoToSidebar(properties: any): void {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(SidePanelInfoComponent);
    let viewContainerRef = this.InfoComp.viewContainerRef;
    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<SidePanelInfoComponent>componentRef.instance).properties = properties;
  }

  // Dynamically add the layer information to the sidebar coming in from the ts configuration file
  addLayerToSidebar(tsfile) {
    // reset the sidebar components so elements are added on top of each other
    this.resetSidebarComponents();
    let _this = this;
    //creates new layerToggle component in sideBar for each layer specified in the config file, sets data based on map service
    for (var i = 0; i < tsfile.layers.length; i++) {
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(LayerComponent);
      _this.viewContainerRef = this.MapHost.viewContainerRef;
      let componentRef = _this.viewContainerRef.createComponent(componentFactory);
      (<LayerComponent>componentRef.instance).data = _this.layers[i].data;
      this.sidebar_layers.push(componentRef);
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
  buildMap(mapConfigFileName: string): void {
    $(document).ready(function() {
      if ( $('#sidebar').css('visibility') == 'hidden' ) {
        $('#sidebar').css('visibility','visible');
        $('#errorPage').css('visibility','hidden');
        $('#errorPage').css('height','0');
        $('#mapid').css('visibility','visible');
        $('#mapid').css('height','100%');
      }
    });
    // First load the configuration data for the map
    this.getMyJSONData('assets/map-configuration-files/' + mapConfigFileName + '.json').subscribe(
      mapConfigFile => {

        this.mapInitialized = true;

        this.mapService.setMapConfigFile(mapConfigFile)

        // Create 4 separate types of background layers for the map. None of this is customized by config file. 
        // 1. Topographic
        // 2. Satellite
        // 3. Streets
        // 4. Streets & Satellite
        let topographic = L.tileLayer('https://api.mapbox.com/styles/v1/masforce/cjs108qje09ld1fo68vh7t1he/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFzZm9yY2UiLCJhIjoiY2pzMTA0bmR5MXAwdDN5bnIwOHN4djBncCJ9.ZH4CfPR8Q41H7zSpff803g', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'firstMap'
        }),
        satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoia3Jpc3RpbnN3YWltIiwiYSI6ImNpc3Rjcnl3bDAzYWMycHBlM2phbDJuMHoifQ.vrDCYwkTZsrA_0FffnzvBw', {
            maxZoom: 18,
            attribution: 'Created by the <a href="http://openwaterfoundation.org">Open Water Foundation. </a>' + 
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery Â© <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.satellite'
        }),
        streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia3Jpc3RpbnN3YWltIiwiYSI6ImNpc3Rjcnl3bDAzYWMycHBlM2phbDJuMHoifQ.vrDCYwkTZsrA_0FffnzvBw', {
            maxZoom: 18,
            attribution: 'Created by the <a href="http://openwaterfoundation.org">Open Water Foundation. </a>' + 
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery Â© <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        }),
        streetsatellite = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia3Jpc3RpbnN3YWltIiwiYSI6ImNpc3Rjcnl3bDAzYWMycHBlM2phbDJuMHoifQ.vrDCYwkTZsrA_0FffnzvBw', {
            maxZoom: 18,
            attribution: 'Created by the <a href="http://openwaterfoundation.org">Open Water Foundation. </a>' + 
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery Â© <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets-satellite'
        });

        // Get the zoomInfo as array from the config file.
        // [initialExtent, minumumExtent, maxiumumExtent]
        let zoomInfo = this.mapService.getZoomInfo();
        // Get the center from the config file.
        let center = this.mapService.getCenter();

        // Create a Leaflet Map. Center on Fort Collins and set zoom level to 12
        // Set the default layers that appear on initialization
        this.mymap = L.map('mapid', {
            center: center,
            zoom: zoomInfo[0],
            minZoom: zoomInfo[1],
            maxZoom: zoomInfo[2],
            layers: [topographic],
            zoomControl: false
        });

        let baseMaps = {
            "Satellite": satellite,
            "Streets": streets,
            "Streets & Satellite": streetsatellite,
            "Topographical": topographic
        };

        /* Add layers to the map */
        L.control.layers(baseMaps).addTo(this.mymap);

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
          this.getMyJSONData("assets/leaflet/data-files/" + mapLayerFileName).subscribe (
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
              propVal = mapProperties[propName];
            }
            else if(propType == "layer"){
              let layerProperties: any = mapService.getLayerFromId(layerViewId);
              let propertyLine: string[] = propName.split(".");
              propVal = layerProperties[propName];
            }
            else if(propType == "layerview"){
              let layerViewProperties = mapService.getLayerViewFromId(layerViewId);
              let propertyLine: string[] = propName.split(".");
              propVal = layerViewProperties[propName];
            }
            // How to handle if not found?
            // if(propVal == ""){
            //   //propVal = "${" + propertySearch + "}";
            //   propVal = "";
            // }
            if(foundPosStart == -1){
              return b;
            }
      
            propVal = String(propVal);

            b = parameterValue.substr(0, foundPosStart) + propVal + parameterValue.substr(foundPosEnd + 1, parameterValue.length);
            searchPos = foundPosStart + propVal.length;
            parameterValue = b;
          }
          return checkNewLine(b);
        }

      //});
      }
    )
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
      console.log("Show all layers");
      for(var i = 0; i < myLayers.length; i++){
        console.log(ids[i]);
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
            tsfile => {
              this.mapService.clearLayerArray();
              this.mapService.setTSFile(tsfile);
              this.mapService.saveLayerConfig();
              this.layers = this.mapService.getLayers();
              this.addLayerToSidebar(tsfile);
              this.buildMap(this.mapConfig);
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
    this.getMyJSONData("assets/leaflet/data-files/" + mapLayerFileName).subscribe (
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
      _this.viewContainerRef.remove(_this.viewContainerRef.indexOf(layerComponent));
    })
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
