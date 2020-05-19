import { Component, ComponentFactoryResolver,
          OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { MapService }                           from '../map.service';
import { LegendSymbolsDirective }               from './legend-symbols.directive';

import * as Papa                                from 'papaparse';

import { Globals }                              from '../../globals';

declare var Rainbow: any;

@Component({
  selector: 'legend-symbols-component',
  templateUrl: './legend-symbols.component.html',
  styleUrls: ['./legend-symbols.component.css']
})
export class LegendSymbolsComponent implements OnInit {

  @ViewChild(LegendSymbolsDirective) LegendSymbolsComp: LegendSymbolsDirective;

  legendSymbolsViewContainerRef: ViewContainerRef;

  layerData: any;

  symbolData: any;

  // Used to hold names of the data classified as 'singleSymbol'. Will be used for the map legend/key.
  singleSymbolKeyNames: string[] = [];
  // Used to hold colors of the data classified as 'singleSymbol'. Will be used for the map legend/key.
  singleSymbolKeyColors: string[] = [];
  // Used to hold names of the data classified as 'categorized'. Will be used for the map legend/key.
  categorizedKeyNames: string[] = [];
  // Used to hold colors of the data classified as 'categorized'. Will be used for the map legend/key.
  categorizedKeyColors = [];

  categorizedClassificationField = [];
  // Used to hold the name of the data classified as 'graduated'. Will be used for the map legend/key.
  graduatedKeyNames: string[] = [];
  // Used to hold colors of the data classified as 'graduated'. Will be used for the map legend/key.
  graduatedKeyColors: string[] = [];

  graduatedClassificationField = [];

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private mapService: MapService,
              private globals: Globals) { }

  ngOnInit() {    
    this.createSymbolData();
  }

  createSymbolData() {
    if (this.symbolData.classificationType.toUpperCase() == "SINGLESYMBOL") {
      this.singleSymbolKeyNames.push(this.layerData.name);            
      if (this.symbolData.properties.fillColor)
        this.singleSymbolKeyColors.push(this.symbolData.properties.fillColor);
      else
        this.singleSymbolKeyColors.push(this.symbolData.properties.color);      
    }
    else if (this.symbolData.classificationType.toUpperCase() ==  "CATEGORIZED") {
      this.categorizedKeyNames.push(this.layerData.geoLayerId);      
      // TODO: jpkeahey 2020-04-29 - The colorTable variable assumes the entire color
      // table is in the config file to display all categories for the map layer
      if (this.symbolData.properties.classificationFile) {
        Papa.parse(this.mapService.getAppPath() +
        this.mapService.getMapConfigPath() +
        this.symbolData.properties.classificationFile,
          {
            delimiter: ",",
            download: true,
            header: true,
            complete: (results: any, file: any) => {
              this.assignFileColor(results.data);
            }
          });
      } else {
        // Global data variable:
        // appPath = /assets/app
        // pathToMapConfigurationFile = appPath + "/" + mapConfigurationFile
        // For example
        // /assets/app/map-configurations/mymap.json = "/assets/app" + "/" + "map-configurations/mymap.json" 
        // At this point, this.mapFilePath has been prefixed with the assets/app location::::this.mapFilePath + "/" +
        let mapLayerFileName = this.layerData.sourcePath;
        this.mapService.getData(mapLayerFileName).subscribe((tsfile) => {
          let colorTable = this.assignColor(tsfile.features, this.symbolData);
          this.categorizedKeyColors.push(colorTable);
      });
      }
    }
    else if (this.symbolData.classificationType.toUpperCase() == "GRADUATED") {
      this.getColor();
      this.graduatedKeyNames.push(this.layerData.geoLayerId);
      this.graduatedClassificationField.push(this.symbolData.classificationField.toLowerCase());
    }
  }

  // A color table CSV is given
  assignFileColor(results: any) {
    let colorTable: any[] = [];
    for (let i = 0; i < results.length; i++) {
      colorTable.push(results[i]['label']);
      colorTable.push(results[i]['color']);
    }    
    this.categorizedKeyColors.push(colorTable);
  }

  // If no color table is given, create your own
  assignColor(features: any[], symbolData: any) {
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

  getColor() {
    let colors = new Rainbow();
    colors.setNumberRange(this.symbolData.colorRampMin, this.symbolData.colorRampMax);
    switch (this.symbolData.colorRamp.toLowerCase()) {
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
        let colorsArray = this.symbolData.colorRamp.substr(1, this.symbolData.colorRamp.length - 2).split(/[\{\}]+/);
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
    /* Add the name and color of the current layer to the corresponding arrays.
      These are used for the map key */
      if (this.graduatedKeyColors[this.graduatedKeyNames.length * 2] == null) {
        this.graduatedKeyColors.push(colors.colorAt(this.symbolData.colorRampMin));
        this.graduatedKeyColors.push(colors.colorAt(((this.symbolData.colorRampMax-this.symbolData.colorRampMin)/2) + this.symbolData.colorRampMin));
        this.graduatedKeyColors.push(colors.colorAt(this.symbolData.colorRampMax));
    }
  }

  isObject(val: any) {
    return typeof val === 'object';
  }
}
