import { Injectable } from '@angular/core';

import * as lunr from 'lunr';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  allDocuments: SearchItem[] = [
    {
      name: "Lunr",
      text: "Like Solr, but much smaller, and not as bright."
    },
    {
      name: "React",
      text: "A JavaScript library for building user interfaces."
    },
    {
      name: "Lodash",
      text: "A modern JavaScript utility library delivering modularity, performance & extras."
    },
    {
      name: "About the Project",
      text: "# About the Project #\nThis is an example of a markdown file with a graph.\n| **Menu** | **Description** |\n| -- | -- |\n| ***Basin Entities*** | \"Lay of the land\" to understand the entities and programs that exist and operate in the basin, as well as important concepts.  Map layers are used in other maps where appropriate. |"
    }
  ];


  constructor() { }


  /**
   * 
   * @param text 
   */
  addToDocs(name: string, text: string): void {
    this.allDocuments.push({
      name: name,
      text: text
    });
  }

  search(query: string): any[] {

    var _this = this;

    var searchIndex = lunr(function () {
      this.ref('name')
      this.field('text')
    
      _this.allDocuments.forEach(function (doc) {
        this.add(doc)
      }, this)
    });
    return searchIndex.search(query);
  }
}

export interface SearchItem {
  name: string;
  text: string;
}