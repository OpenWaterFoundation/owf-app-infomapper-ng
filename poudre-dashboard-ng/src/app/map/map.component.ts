import { Component, OnInit } from '@angular/core';
import {  Observable } from 'rxjs';
//import * as $ from "jquery";
import { map } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import '../../assets/leaflet/javascript/leaflet.zoomhome.min.js';
import '../../assets/leaflet/javascript/L.Control.MousePosition.js';
import '../../assets/leaflet/javascript/papaparse.js';
import '../../assets/leaflet/javascript/L.Control.MousePosition.js';

import '../../assets/leaflet/css/L.Control.MousePosition.css';

declare var mousePosition: any;
//declare var getMyJSONData: Observable<any>;

declare var L;
declare var feature;



var myFiles = ['swrf-district03.geojson', 'active-streamgages.geojson'];
var myLayers = [];

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css', '../../assets/leaflet/css/leaflet.zoomhome.css', '../../assets/leaflet/css/L.Control.MousePosition.css', '../../assets/leaflet/css/style1.css']
})

export class MapComponent implements OnInit {

    mymap;
    toggle;

  constructor(private http: HttpClient) { }

  getMyJSONData(path_to_json): Observable<any> {

    return this.http.get(path_to_json)
  }


  togglePoints() {
    if(!this.toggle) {
      //this.mymap.removeLayer(data1);
    } else {
      //this.mymap.addLayer(data1);
    }
    this.toggle = !this.toggle;
  }


  ngOnInit() {

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
        id:   'js-api',
        tab:  '<i class="fa fa-gear"></i>',
        title: 'JS API',
        pane: '<p>The Javascript API allows to dynamically create or modify the panel state.<p/><p><button onclick="togglePoints(\'mail\')">Display Layer</button><button onclick="sidebar.disablePanel(\'mail\')">Hide Layer</button></p>'
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
