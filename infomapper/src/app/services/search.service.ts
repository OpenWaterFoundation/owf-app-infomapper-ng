import { Injectable } from '@angular/core';

import * as lunr from 'lunr';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  /**
   * 
   */
  allDocuments: SearchItem[] = [
    {
      name: "About the Project",
      text: "# About the Project #\nThis is an example of a markdown file with a graph.\n| **Menu** | **Description** |\n| -- | -- |\n| ***Basin Entities*** | \"Lay of the land\" to understand the entities and programs that exist and operate in the basin, as well as important concepts.  Map layers are used in other maps where appropriate. |"
    }
  ];

  /**
   * 
   */
  allDocumentsRouterPath: any = {
    "About the Project": "/content-page/about-the-project"
  };


  constructor() { }


  /**
   * 
   * @param text 
   */
  addToDocs(name: string, text: string, routerPath: string): void {

    // Add to the search indexed documents object.
    this.allDocuments.push({
      name: name,
      text: text
    });

    // Add to the internal object for routing the user to the selected found page.
    this.allDocumentsRouterPath[name] = routerPath;
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  search(query: string): any[] {

    var _this = this;

    var searchIndex = lunr(function () {
      this.ref('name');
      this.field('text');
    
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
  routerPath?: string;
}