import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-legend-symbols',
  templateUrl: './legend-symbols.component.html',
  styleUrls: ['./legend-symbols.component.css']
})
export class LegendSymbolsComponent implements OnInit {

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

  constructor() { }

  ngOnInit() {
  }

}
