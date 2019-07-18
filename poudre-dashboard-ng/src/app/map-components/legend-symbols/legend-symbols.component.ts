import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { LegendSymbolsDirective } from './legend-symbols.directive'

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

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.createSymbolData();
  }

  createSymbolData(){
      console.log(this.layerData);
      console.log(this.symbolData);
      if(this.symbolData.classification.toUpperCase() == "SINGLESYMBOL"){
        this.singleSymbolKeyNames.push(this.layerData.geolayerId);
        this.singleSymbolKeyColors.push(this.symbolData.color);
      }
      else if(this.symbolData.classification.toUpperCase() ==  "CATEGORIZED"){
        this.categorizedKeyNames.push(this.layerData.geolayerId);
        let tableHolder = this.symbolData.colorTable;
        let colorTable = tableHolder.substr(1, tableHolder.length - 2).split(/[\{\}]+/);
        this.categorizedKeyColors.push(colorTable);
        this.categorizedClassificationField.push(this.symbolData.classificationField.toLowerCase());
      }
      else if(this.symbolData.classification.toUpperCase() == "GRADUATED"){
        this.graduatedKeyNames.push(this.layerData.geolayerId);
        this.graduatedClassificationField.push(this.symbolData.classificationField.toLowerCase());
      }
  }

}
