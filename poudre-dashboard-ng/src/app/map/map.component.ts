import { Component, OnInit } from '@angular/core';
import {  Observable } from 'rxjs';
import * as $ from "jquery";
import '../../assets/leaflet/javascript/leaflet.zoomhome.min.js';
import '../../assets/leaflet/javascript/L.Control.MousePosition.js';
import '../../assets/leaflet/javascript/papaparse.js';
import '../../assets/leaflet/javascript/L.Control.MousePosition.js';

import '../../assets/leaflet/css/L.Control.MousePosition.css';

declare var mousePosition: any;
//declare var getMyJSONData: Observable<any>;

declare var L;
declare var feature;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css', '../../assets/leaflet/css/leaflet.zoomhome.css', '../../assets/leaflet/css/L.Control.MousePosition.css', '../../assets/leaflet/css/style1.css']
})

export class MapComponent implements OnInit {



  constructor() { }



  ngOnInit() {

    $.ajaxSetup({
      async: false
    });

    //getMyJSONData("../../assets/leaflet/data-files/Colorado-IBCC-Basins-WGS84.geojson") {
    //  return this.http.get(fullPath)
    //}

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
    var mymap = L.map('mapid', {
        center: [38.59, -105.385],
        zoom: 8,
        layers: [simple, topographic],
        zoomControl: false
    });


    var baseMaps = {
        "Simple": simple,
        "Topographical": topographic
    };

    /* Add layers to the map */
    L.control.layers(baseMaps).addTo(mymap);

    /* Get Basin data */
      var Water_Basin = (function() {
               var result;
               $.getJSON("../../assets/leaflet/data-files/Colorado-IBCC-Basins-WGS84.geojson",function(data) {
                   result = data;
               }); return result;
       })();

       var basin = L.geoJson(Water_Basin, {
           onEachFeature: onEachFeatureBasin
       }).addTo(mymap);


           /* Get Station data */
       var station_data = (function() {
               var result;
               $.getJSON("../../assets/leaflet/data-files/active-streamgages.geojson",function(data) {
                   result = data;
               }); return result;
       })();



       var smallIcon = L.icon({
           iconUrl: '../../assets/leaflet/images/marker-icon-small.png',
           iconSize:     [20, 20], // width and height of the image in pixels
           iconAnchor:   [10, 20] // point of the icon which will correspond to marker's location
       })
       var largeIcon = L.icon({
           iconUrl: '../../assets/leaflet/images/marker-icon.png',
           shadowUrl: '../../assets/leaflet/images/marker-shadow.png',
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


       var station = L.geoJson(station_data, station_options).addTo(mymap);


       mymap.on('zoomend', function() {
           console.log(mymap.getZoom());
           if (mymap.getZoom() > 9){
               station.eachLayer(function(layer) {
                   layer.setIcon(largeIcon);
               });
           }
           else {
               station.eachLayer(function(layer) {
                   layer.setIcon(smallIcon);
               });
           }
       });


       function onEachFeatureBasin(feature, layer) {
           //console.log(feature.properties.name)
           layer.on({
               mouseover: highlightFeature,
               mouseout: highlightFeature
           });
       }


       /* This feature is called by the onEachFeature function. It is what allows users to
           highlight over basins and will pop up a gray line outlining the basin. */
       function highlightFeature(e) {

           basin.setStyle({
               weight: 2,
               color: '#666',
               dashArray: '',
           });
           var layer = e.target;
           layer.setStyle({
               weight: 4,
               color: 'blue',
               dashArray: '',

           });
           if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
               layer.bringToFront();
           }
           info.update(layer.feature.properties);
       }
       /* This function is also called by the onEachFeature function. It is used
       once a basin has been highlighted over, then the user moves the mouse it will
       reset the layer back to the original state. */
       function resetHighlight(e) {
           basin.setStyle({
               weight: 6,
               color: 'blue',
               dashArray: '',
           });
           var layer = e.target;
           layer.setStyle({
               weight: 6,
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
       info.addTo(mymap);







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








       L.Control.zoomHome().addTo(mymap);

       L.control.mousePosition({position: 'bottomleft',lngFormatter: function(num) {
           var direction = (num < 0) ? 'W' : 'E';
           var formatted = Math.abs(L.Util.formatNum(num, 6)) + '&deg ' + direction;
           return formatted;
       },
       latFormatter: function(num) {
           var direction = (num < 0) ? 'S' : 'N';
           var formatted = Math.abs(L.Util.formatNum(num, 6)) + '&deg ' + direction;
           return formatted;
       }}).addTo(mymap);

        /* Bottom Right corner. This shows the scale in km and miles of
       the map. */
       L.control.scale({position: 'bottomleft',imperial: true}).addTo(mymap);

  }

  buildMap(): void {
  }




}
