import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver, Inject } from '@angular/core';
import {  Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { mapService }         from './map.service';
import { MapDirective } from './map.directive';
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

declare var mousePosition: any;

declare var L;
declare var feature;


var myFiles = ['swrf-district03.geojson', 'active-streamgages.geojson'];
var myLayers = [];

@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.css', '../../assets/leaflet/css/leaflet.zoomhome.css', '../../assets/leaflet/css/L.Control.MousePosition.css', '../../assets/leaflet/css/style1.css'],

  //templateUrl: './map.component.html',

  template: `
            <div id="map-container">

              <!-- optionally define the sidebar content via HTML markup -->
                <div id="sidebar" class="leaflet-sidebar collapsed">

                    <!-- nav tabs -->
                    <div class="leaflet-sidebar-tabs">
                        <!-- top aligned tabs -->
                        <ul role="tablist">
                            <li><a href="#home" role="tab"><i class="fa fa-bars active"></i></a></li>
                            <li><a href="#autopan" role="tab"><i class="fa fa-arrows"></i></a></li>
                        </ul>

                        <!-- bottom aligned tabs -->
                        <ul role="tablist">
                            <li><a href="https://github.com/nickpeihl/leaflet-sidebar-v2"><i class="fa fa-github"></i></a></li>
                        </ul>
                    </div>

                    <!-- panel content -->
                    <div class="leaflet-sidebar-content">
                        <div class="leaflet-sidebar-pane" id="home">
                            <h1 class="leaflet-sidebar-header">
                                Layers
                                <span class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></span>
                            </h1>

                            <br>

                            <div id="toggleAll">
                              <div class="controlCol">
                                <button class="toggleAllButton" (click)="displayAll('show')">Show All Layers</button>
                              </div>
                              <div class="controlCol">
                                <button class="toggleAllButton" (click)="displayAll('hide')">Hide All Layers</button>
                              </div>
                            </div>

                            <div id="toggleDescription">
                              <div id="controlDescription">
                                <input type="checkbox" name="showDescriptions" (click)="toggleDescriptions()"> Hide Descriptions
                              </div>
                            </div>


                            <table class="layerOptions">


                            <!-- //this is the selector for dynamicly-generated html layer objects <ng-template layer-host></ng-template> -->


                              <tr>
                                <td class="name">Source Water Route Framework<div class="description">The Source Water Route Framework was developed by the Colorado Division of Water Resources and derived from the National Hydrography Dataset (NHD). The SWRF represents most streams in Colorado, in particular those with water rights or other important features.</div></td>
                                <td class="toggle">
                                  <label class="switch">
                                    <input type="checkbox" checked (click)="toggleLayer('swrf')" id="swrf">
                                    <span class="slider round"></span>
                                  </label>
                                </td>
                              </tr>

                              <tr>
                                <td class="name">Municipal Boundaries<br><div class="description">Boundaries of municipalities in Colorado.</div></td>
                                <td class="toggle">
                                  <label class="switch">
                                    <input type="checkbox" checked (click)="toggleLayer('municipal_boundaries')" id="municipal_boundaries">
                                    <span class="slider round"></span>
                                  </label>
                                </td>
                              </tr>

                              <tr>
                                <td class="name">Active Streamgages<br><div class="description">Streamgages that are actively measuring discharge in streams in the Cache la Poudre watershed.</div></td>
                                <td class="toggle">
                                  <label class="switch">
                                    <input type="checkbox" checked (click)="toggleLayer('streamgages')" id="streamgages">
                                    <span class="slider round"></span>
                                  </label>
                                </td>
                              </tr>

                              <tr>
                                <td class="name">Ditch Service Areas<br><div class="description">Service areas of ditches in the Cache la Poudre watershed.</div></td>
                                <td class="toggle">
                                  <label class="switch">
                                    <input type="checkbox" checked (click)="toggleLayer('ditch_serviceareas')" id="ditch_serviceareas">
                                    <span class="slider round"></span>
                                  </label>
                                </td>
                              </tr>

                            </table>


                        </div>

                        <div class="leaflet-sidebar-pane" id="autopan">
                            <h1 class="leaflet-sidebar-header">
                                autopan
                                <span class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></span>
                            </h1>
                            <p>
                                <code>Leaflet.control.sidebar( autopan: true )</code>
                                makes sure that the map center always stays visible.
                            </p>
                            <p>
                                The autopan behviour is responsive as well.
                                Try opening and closing the sidebar from this pane!
                            </p>
                        </div>

                    </div>
                </div>


              <div id="mapid"></div>

            </div>
            `
})

export class MapComponent implements OnInit {

  @Input() layers: layerItem[];

  @ViewChild(MapDirective) MapHost: MapDirective;

    mymap;
    public mapConfig: string;

    private toggleLayer: Function;
    private displayAll: Function;


  constructor(private http: HttpClient, private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver, private mapService: mapService) { }

  getMyJSONData(path_to_json): Observable<any> {
    return this.http.get(path_to_json)
  }

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

  loadComponent(tsfile) {
    console.log("TESTING " + tsfile.layers[0].geolayerId);
    //creates new layerToggle component in sideBar for each layer specified in the config file, sets data based on map service
    for (var i = 0; i < tsfile.layers.length; i++) {

      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(LayerComponent);
      let viewContainerRef = this.MapHost.viewContainerRef;
      let componentRef = viewContainerRef.createComponent(componentFactory);
      (<LayerComponent>componentRef.instance).data = this.layers[i].data;

    }
  }

  ngOnInit() {


    //loads data from config file and calls loadComponent when tsfile is defined
    this.getMyJSONData("assets/mapConfig/basin_entities_2019-03-26.json").subscribe (
      tsfile => {
        this.mapService.saveLayerConfig(tsfile);
        this.layers = this.mapService.getLayers();

        console.log("TESTING " + tsfile.layers[0].geolayerId);

        this.loadComponent(tsfile);
      }
    );

    this.mapConfig = this.route.snapshot.paramMap.get('id');
    console.log("mapConfig file: " + this.mapConfig);

    var topographic = L.tileLayer('https://api.mapbox.com/styles/v1/masforce/cjs108qje09ld1fo68vh7t1he/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFzZm9yY2UiLCJhIjoiY2pzMTA0bmR5MXAwdDN5bnIwOHN4djBncCJ9.ZH4CfPR8Q41H7zSpff803g', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'firstMap'
    }),
    simple = L.tileLayer('https://api.mapbox.com/styles/v1/masforce/cjs13btye0cgx1fqlkv8z7ek9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFzZm9yY2UiLCJhIjoiY2pzMTA0bmR5MXAwdDN5bnIwOHN4djBncCJ9.ZH4CfPR8Q41H7zSpff803g', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'firstMap'
    });

    // Create a Leaflet Map. Center on Fort Collins and set zoom level to 12
    // Set the default layers that appear on initialization
    this.mymap = L.map('mapid', {
        center: [40, -105.385],
        zoom: 8,
        layers: [simple, topographic],
        zoomControl: false
    });


    var baseMaps = {
        "Simple": simple,
        "Topographical": topographic
    };




    // create the sidebar instance and add it to the map
    var sidebar = L.control.sidebar({ container: 'sidebar' })
        .addTo(this.mymap)
        .open('home');
    // add panels dynamically to the sidebar
    sidebar.addPanel({
        id:   'testPane',
        tab:  '<i class="fa fa-gear"></i>',
        title: 'JS API',
        pane: '<div class="leaflet-sidebar-pane" id="home"></div>'
    })

    /* Add layers to the map */
    L.control.layers(baseMaps).addTo(this.mymap);



    //Dynamically load layers into array


    for (var i = 0; i < myFiles.length; i++){
      this.getMyJSONData("assets/leaflet/data-files/" + myFiles[i]).subscribe (
        tsfile => {
          var data = L.geoJson(tsfile, {
               //onEachFeature: onEachFeatureBasin
           }).addTo(this.mymap);
           //window.toggle = false;

          //  data1.setStyle({
          //     weight: 2,
          //     color: '#666',
          //     dashArray: '',
          // });
          myLayers.push(data);
        }
      );


    }


       var smallIcon = L.icon({
           iconUrl: 'assets/leaflet/css/images/marker-icon-small.png',
           iconSize:     [20, 20], // width and height of the image in pixels
           iconAnchor:   [10, 20] // point of the icon which will correspond to marker's location
       })
       var largeIcon = L.icon({
           iconUrl: 'assets/leaflet/css/images/marker-icon.png',
           shadowUrl: 'assets/leaflet/css/images/marker-shadow.png',
           iconAnchor:   [12.5, 35],
           shadowAnchor: [12.5, 40],
           iconSize:     [25, 35], // width and height of the image in pixels
           popupAnchor:  [0, -20]
       })


       function createCustomIcon (feature, latlng) {
           return L.marker(latlng, { icon: smallIcon })
       }

       let station_options = {
           pointToLayer: createCustomIcon,
           onEachFeature: onEachFeatureStation
       }

       this.mymap.on('zoomend', function() {
           console.log(this.mymap.getZoom());
           if (this.mymap.getZoom() > 9){

             console.log("The layer is " + myLayers[0]._leaflet_id);

               myLayers[0].eachLayer(function(layer) {
                   layer.setIcon(largeIcon);
               });
           }

           else {
               myLayers[0].eachLayer(function(layer) {
                   layer.setIcon(smallIcon);
               });
           }
       });


       let toggle = false;
       //triggers showing and hiding layers from sidebar controls
       this.toggleLayer = (id) => {

         if(!toggle) {
           this.mymap.removeLayer(myLayers[0]);
         } else {
           this.mymap.addLayer(myLayers[0]);
         }
         toggle = !toggle;
       }

       this.displayAll = (value) => {
         if (value == 'show') {
           console.log("Show all layers");
           for(var i = 0; i < myLayers.length; i++){
             this.mymap.addLayer(myLayers[i]);

            //Needs work- need to change the state of all checkboxes when this function is called
             $( document ).ready(function() {
               var inputClass = document.getElementsByClassName('.switch');
               var item = $(inputClass).find('input:checkbox');
               $(item).removeAttr('checked');

              });

           }
         }
         else {
           console.log("Hide all layers");
           for(var i = 0; i < myLayers.length; i++){
             this.mymap.removeLayer(myLayers[i]);
           }
         }
       }




       function onEachFeatureBasin(feature, layer) {
           //console.log(feature.properties.name)
           //layer.on({
        //       mouseover: highlightFeature,
          //     mouseout: resetHighlight
           //});
       }


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
           var layer = e.target;
           layer.setStyle({
               weight: 2,
               color: '#666',
               dashArray: '',

           });

       }

       /* Information hud in bottom right corner of the map */
       var info = L.control({position: 'bottomright'});
       info.onAdd = function (map) {
           this._div = L.DomUtil.create('div', 'info-info'); // create a div with a class "info"
           this.update();
           return this._div;
       };
       info.update = function (props) {
           this._div.innerHTML = '<h4>Basin Information</h4>' + (props ? '<br><b>Basin Name: </b>' + props.name : 'Hover over a county');
       };
       info.addTo(this.mymap);







       function whenClicked(e) {
           console.log(feature.properties);
           //window.open("https://www.google.com");
       }

       function onEachFeatureStation(feature, layer) {

           var popupContent = '<table>';

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








       L.Control.zoomHome({position: 'topright'}).addTo(this.mymap);

       L.control.mousePosition({position: 'bottomleft',lngFormatter: function(num) {
           var direction = (num < 0) ? 'W' : 'E';
           var formatted = Math.abs(L.Util.formatNum(num, 6)) + '&deg ' + direction;
           return formatted;
       },
       latFormatter: function(num) {
           var direction = (num < 0) ? 'S' : 'N';
           var formatted = Math.abs(L.Util.formatNum(num, 6)) + '&deg ' + direction;
           return formatted;
       }}).addTo(this.mymap);

        /* Bottom Right corner. This shows the scale in km and miles of
       the map. */
       L.control.scale({position: 'bottomleft',imperial: true}).addTo(this.mymap);

  }

  buildMap(): void {
  }




}
