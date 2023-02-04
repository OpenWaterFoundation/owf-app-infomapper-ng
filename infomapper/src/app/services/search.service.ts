import { Injectable }           from '@angular/core';
import { first,
          forkJoin,
          Observable } from 'rxjs';

import * as lunr                from 'lunr';

import { AppConfig,
          Path,
          SearchItem,
          SearchItemMetadata,
          SearchItemsMetadata } from '@OpenWaterFoundation/common/services';
import { AppService }           from './app.service';



@Injectable({
  providedIn: 'root'
})
export class SearchService {

  /**
   * 
   */
  searchItems: SearchItem[] = [];
  /**
   * 
   */
  searchItemsMetadata: SearchItemsMetadata = {};


  /**
   * 
   * @param appService 
   */
  constructor(private appService: AppService) { }


  /**
   * Getter for the appConfig object.
   */
  get appConfig(): AppConfig { return this.appService.appConfigObj; }

  /**
   * Retrieves content for all Content Page markdown files and adds them 
   * @param markdownFiles 
   * @param uniqueMarkdownPaths 
   */
  private addContentPageToSearchIndex(markdownFiles: Observable<any>[], uniqueMarkdownPaths: string[]): void {

    forkJoin(markdownFiles).pipe(first()).subscribe((markdownFilesContent: string[]) => {

      markdownFilesContent.forEach((markdownContent: string, i) => {
        this.addToDocs(
          this.getMarkdownTitle(markdownContent),
          markdownContent,
          uniqueMarkdownPaths[i],
          'Content Page'
        );
      });
      
    });
  }

  /**
   * 
   * @param name 
   * @param text 
   * @param routerPath 
   * @param type 
   */
  addToDocs(name: string, text: string, routerPath: string, type: string): void {

    // Add to the search indexed documents object.
    this.searchItems.push({
      name: name,
      text: text
    });

    // 
    const itemMetadata: SearchItemMetadata = {
      routerPath: routerPath,
      type: type
    }
    this.searchItemsMetadata[name] = itemMetadata;
  }

  /**
   * Create the array of Observables for every file that needs to be read.
   */
  buildSearchIndex(): void {

    // Prefix for the path to all InfoMapper Content Pages.
    const markdownPrefix = '/content-page/';
    // Object used to check if a path to a markdown file
    var uniqueMarkdownFiles = {};
    var uniqueMarkdownRouterPaths  = [];

    // Add home page search index setup.
    var markdownFiles: Observable<any>[] = [
      this.appService.getPlainText(
        this.appService.buildPath(Path.hPP)
      )
    ];
    uniqueMarkdownRouterPaths.push(markdownPrefix + 'home')

    for (let mainMenu of this.appConfig.mainMenu) {

      if (mainMenu.menus) {
        for (let subMenu of mainMenu.menus) {

          switch(subMenu.action) {
            case 'contentPage': {
              // Make sure the path being used as a key begins with no forward slash.
              const markdownFilePath = subMenu.markdownFile.startsWith('/') ?
              subMenu.markdownFile.substring(1) : subMenu.markdownFile;

              if (!(markdownFilePath in uniqueMarkdownFiles)) {

                uniqueMarkdownFiles[markdownFilePath] = true;

                markdownFiles.push(
                  this.appService.getPlainText(
                    this.appService.buildPath(Path.mP, subMenu.markdownFile)
                  )
                );

                uniqueMarkdownRouterPaths.push(markdownPrefix + this.parseRouterPath(subMenu.markdownFile, 3));
                break;
              }
            }
          }
        }
      }

      switch(mainMenu.action) {
        case 'contentPage': {
          // Make sure the path being used as a key begins with no forward slash.
          const markdownFilePath = mainMenu.markdownFile.startsWith('/') ?
          mainMenu.markdownFile.substring(1) : mainMenu.markdownFile;

          if (!(markdownFilePath in uniqueMarkdownFiles)) {

            uniqueMarkdownFiles[markdownFilePath] = true;

            markdownFiles.push(
              this.appService.getPlainText(
                this.appService.buildPath(Path.mP, mainMenu.markdownFile)
              )
            );

            uniqueMarkdownRouterPaths.push(markdownPrefix + this.parseRouterPath(mainMenu.markdownFile, 3));
            break;
          }
          
        }
      }
    }
    this.addContentPageToSearchIndex(markdownFiles, uniqueMarkdownRouterPaths);
  }

  /**
   * 
   * @param markdownContent The markdown content as a string.
   * @returns The first # header parsed out from the markdown content.
   */
  private getMarkdownTitle(markdownContent: string): string {

    var titleWithHash = markdownContent.match(/#(.*?)#/g);

    if (titleWithHash) {
      return titleWithHash[0].substring(1, titleWithHash[0].length - 1).trim();
    } else {
      console.log("Error getting markdown file title. Confirm the file starts with '# Some Title #'.");
      return '';
    }
  }

  /**
   * 
   * @param delExt Number of characters to delete the path's extension.
   */
  private parseRouterPath(path: string, delExt: number): string {

    // Get all content after the last slash in the path.
    var pathEnd = path.match(/([^\/]+$)/);

    if (pathEnd) {
      return pathEnd[0].substring(0, pathEnd[0].length - delExt);
    } else {
      console.error('Error parsing the router path.');
    }
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  search(query: string): lunr.Index.Result[] {

    var _this = this;

    var searchIndex = lunr(function () {
      this.ref('name');
      this.field('text');
    
      _this.searchItems.forEach(function (doc) {
        this.add(doc)
      }, this)
    });

    return searchIndex.search(query);
  }

}

