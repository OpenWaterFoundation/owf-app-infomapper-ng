import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver, Inject, ViewContainerRef, ɵConsole } from '@angular/core';
import {  Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';


import { ActivatedRoute } from '@angular/router';

import { mapService }         from './map.service';
import { MapDirective } from './map.directive';
import { SidePanelInfoDirective } from './sidepanel-info.directive';
import { layerItem }      from './layer-item';

import { LayerComponent } from './layer.component';

import * as $ from "jquery";

import { map } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import '../../assets/leaflet/javascript/leaflet.zoomhome.min.js';
import '../../assets/leaflet/javascript/L.Control.MousePosition.js';
import '../../assets/leaflet/javascript/papaparse.js';
import '../../assets/leaflet/javascript/L.Control.MousePosition.js';
import '../../assets/leaflet/css/L.Control.MousePosition.css';
import { SidePanelInfoComponent } from './sidepanel-info.component';

declare var mousePosition: any;

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

  @Input() layers: layerItem[];

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


  /*
  * http - using http resources
  * route - used for getting the parameter 'id' passed in by the url and from the router.
  * componentFactoryResolver - add components dynamically
  * mapService - reference to map.service.ts
  * activeRoute - not currently being used
  */
  constructor(private http: HttpClient, private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver, private mapService: mapService, private activeRoute: ActivatedRoute) {
    //pass a reference to this map component to the mapService, so functions here can be called from the layer component
    mapService.saveMapReference(this);
   }

  getMyJSONData(path_to_json): Observable<any> {
    return this.http.get(path_to_json);
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

  // Clears the current data displayed in the sidebar
  // This makes sure that the sidebar is cleared when adding new components due to a page refresh.
  resetSidebarComponents(): void {
    let _this = this;
    this.sidebar_layers.forEach(function(layerComponent){
      _this.viewContainerRef.remove(_this.viewContainerRef.indexOf(layerComponent));
    })
  }

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

          this.mapConfig = this.route.snapshot.paramMap.get('id');
          var configFile = "assets/mapConfig/" + this.mapConfig + ".json";
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

  // Build the map using leaflet and configuartion data
  buildMap(mapConfigFileName: string): void {
    // First load the configuration data for the map
    this.getMyJSONData('assets/mapConfig/' + mapConfigFileName + '.json').subscribe(
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
            this._div.innerHTML = '<h4>' + mapName + '</h4>';
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

        /* Information hub in bottom right corner of the map */
        let info = L.control({position: 'bottomright'});
        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info-info'); // create a div with a class "info"
            this.update();
            return this._div;
        };
        info.update = function (props) {
            this._div.innerHTML = '<h4>Basin Information</h4>' + (props ? '<br><b>Basin Name: </b>' + props.name : 'Hover over a county');
        };
        info.addTo(this.mymap);

        // Get the map layers files:
        let mapLayers= this.mapService.getLayerFiles();
        let mapLayerViewGroups = this.mapService.getLayerGroups();

        //Dynamically load layers into array
        for (var i = 0; i < mapLayers.length; i++){
          let mapLayerData = mapLayers[i];
          let mapLayerFileName = mapLayerData.source;
          this.getMyJSONData("assets/leaflet/data-files/" + mapLayerFileName).subscribe (
            tsfile => {
              if (mapLayerData.featureType == "line"
                  || mapLayerData.featureType == "polygon"){
                let data = L.geoJson(tsfile, {
                    style: this.addStyle(mapLayerData.geolayerId, mapLayerViewGroups)
                }).addTo(this.mymap);
                myLayers.push(data)
                ids.push(mapLayerData.name)
              }else{
                let data = L.geoJson(tsfile, {}).addTo(this.mymap);
                myLayers.push(data)
                ids.push(mapLayerData.name)
              }
            }
          );
        }

        // If the sidebar has not already been initialized once then do so.
        if (this.sidebar_initialized == false){
          this.createSidebar();
        }

        // function onEachFeatureBasin(feature, layer) {
        //     console.log(feature.properties.name)
        //     layer.on({
        //       mouseover: highlightFeature,
        //       mouseout: resetHighlight
        //     });
        // }


        /* This feature is called by the onEachFeature function. It is what allows users to
            highlight over basins and will pop up a gray line outlining the basin. */
        // function highlightFeature(e) {
        //
        //     myLayers[0].setStyle({
        //         weight: 2,
        //         color: '#666',
        //         dashArray: '',
        //     });
        //     var layer = e.target;
        //     layer.setStyle({
        //         weight: 4,
        //         color: 'blue',
        //         dashArray: '',
        //
        //     });
        //     if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        //         layer.bringToFront();
        //     }
        //     info.update(layer.feature.properties);
        // }

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

      //});
      }
    )
  }

  addInfoToSidebar(properties: any): void {
    // reset the sidebar components so elements are added on top of each other
    //this.resetSidebarComponents();
    let _this = this;
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(SidePanelInfoComponent);
    let viewContainerRef = this.InfoComp.viewContainerRef;
    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<SidePanelInfoComponent>componentRef.instance).properties = properties;
  }

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

  //triggers showing and hiding layers from sidebar controls
  toggleLayer(id: string): void {
    let index = ids.indexOf(id);

    if(!this.toggle) {
      this.mymap.removeLayer(myLayers[index]);
    } else {
      this.mymap.addLayer(myLayers[index]);
    }
    this.toggle = !this.toggle;
  }

  displayAll(value) : void{
    if (value == 'show') {
      console.log("Show all layers");
      for(var i = 0; i < myLayers.length; i++){
        this.mymap.addLayer(myLayers[i]);

        //Needs work- need to change the state of all checkboxes when this function is called
        $( document ).ready(function() {
          let inputClass = document.getElementsByClassName('.switch');
          let item = $(inputClass).find('input:checkbox');
          $(item).removeAttr('checked');

        });

      }
    }
    else {
      for(var i = 0; i < myLayers.length; i++){
        this.mymap.removeLayer(myLayers[i]);
      }
    }
  }

    // var smallIcon = L.icon({
    //     iconUrl: 'assets/leaflet/css/images/marker-icon-small.png',
    //     iconSize:     [20, 20], // width and height of the image in pixels
    //     iconAnchor:   [10, 20] // point of the icon which will correspond to marker's location
    // })
    // var largeIcon = L.icon({
    //     iconUrl: 'assets/leaflet/css/images/marker-icon.png',
    //     shadowUrl: 'assets/leaflet/css/images/marker-shadow.png',
    //     iconAnchor:   [12.5, 35],
    //     shadowAnchor: [12.5, 40],
    //     iconSize:     [25, 35], // width and height of the image in pixels
    //     popupAnchor:  [0, -20]
    // })


    // function createCustomIcon (feature, latlng) {
    //     return L.marker(latlng, { icon: smallIcon })
    // }

    // let station_options = {
    //     pointToLayer: createCustomIcon,
    //     onEachFeature: onEachFeatureStation
    // }

    // this.mymap.on('zoomend', function() {
    //     console.log(this.mymap.getZoom());
    //     if (this.mymap.getZoom() > 9){

    //       console.log("The layer is " + myLayers[0]._leaflet_id);

    //         myLayers[0].eachLayer(function(layer) {
    //             layer.setIcon(largeIcon);
    //         });
    //     }

    //     else {
    //         myLayers[0].eachLayer(function(layer) {
    //             layer.setIcon(smallIcon);
    //         });
    //     }
    // });
}
