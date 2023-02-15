import { Injectable }  from '@angular/core';
import { first,
          forkJoin,
          Observable } from 'rxjs';

import * as lunr       from 'lunr';

import { AppConfig,
          GeoMapProject,
          MainMenu,
          Path,
          SearchItem,
          SearchItemMetadata,
          SearchItemsMetadata, 
          SearchOptions, 
          SubMenu }    from '@OpenWaterFoundation/common/services';
import { AppService }  from './app.service';



@Injectable({
  providedIn: 'root'
})
export class SearchService {

  /** Search index reference from the Lunr package. The Lunr Builder object is used
   * to create it. */
  searchIndex: lunr.Index;
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
        this.addMarkdownContentToIndex(
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
   * @param mapConfigFiles 
   * @param uniqueMapConfigRouterPaths 
   */
  private addMapConfigKeywordsToSearchIndex(
    mapConfigFiles: Observable<any>[], uniqueMapConfigRouterPaths: string[]
  ): void {

    forkJoin(mapConfigFiles).pipe(first()).subscribe((mapConfigFilesContent: GeoMapProject[]) => {

      mapConfigFilesContent.forEach((mapConfig: GeoMapProject, i) => {

        if (mapConfig.keywords) {
          this.addKeywordsToIndex(
            mapConfig.name,
            mapConfig.keywords.join(' '),
            uniqueMapConfigRouterPaths[i],
            'Map'
          );
        }
      });
    });
  }

  /**
   * 
   * @param title 
   * @param text 
   * @param routerPath 
   * @param type 
   */
  addMarkdownContentToIndex(title: string, text: string, routerPath: string, type: string): void {

    // Add to the search indexed documents object.
    this.searchItems.push({
      title: title,
      text: text
    });

    // 
    const itemMetadata: SearchItemMetadata = {
      routerPath: routerPath,
      type: type
    }
    this.searchItemsMetadata[title] = itemMetadata;
  }

  /**
   * 
   * @param title 
   * @param keywords 
   * @param routerPath 
   * @param type 
   */
  addKeywordsToIndex(title: string, keywords: string, routerPath: string, type: string): void {

    // Add to the search indexed documents object.
    this.searchItems.push({
      title: title,
      keywords: keywords
    });

    // 
    const itemMetadata: SearchItemMetadata = {
      routerPath: routerPath,
      type: type
    }
    this.searchItemsMetadata[title] = itemMetadata;
  }

  /**
   * Create the array of Observables for every file that needs to be read.
   */
  buildSearchIndex(): void {

    // Object used to check if a path to a markdown file
    var uniqueMarkdownFiles = {};
    var uniqueMarkdownRouterPaths: string[] = [];
    var uniqueMapFiles = {};
    var uniqueMapConfigRouterPaths: string[] = [];

    // Create array of markdown observables and add home page search index setup.
    var markdownFiles: Observable<any>[] = [
      this.appService.getPlainText(
        this.appService.buildPath(Path.hPP)
      )
    ];
    uniqueMarkdownRouterPaths.push('/content-page/home');
    // Create array of map observables.
    var mapConfigFiles: Observable<any>[] = [];

    for (let mainMenu of this.appConfig.mainMenu) {

      if (this.appService.menuEnabledAndVisible(mainMenu)) {
        if (mainMenu.menus) {
          for (let subMenu of mainMenu.menus) {
  
            if (this.appService.menuEnabledAndVisible(subMenu)) {
              switch(subMenu.action) {
                case 'contentPage': {
                  this.processMarkdownFileForSearchIndex(
                    subMenu, markdownFiles, uniqueMarkdownFiles, uniqueMarkdownRouterPaths
                  );
                  break;
                }
                case 'displayMap': {
                  this.processMapConfigFileForSearchIndex(
                    subMenu, mapConfigFiles, uniqueMapFiles, uniqueMapConfigRouterPaths
                  );
                  break;
                }
              }
            }
            
          }
        }
  
        switch(mainMenu.action) {
          case 'contentPage': {
            this.processMarkdownFileForSearchIndex(
              mainMenu, markdownFiles, uniqueMarkdownFiles, uniqueMarkdownRouterPaths
            );
            break;
          }
          case 'displayMap': {
            this.processMapConfigFileForSearchIndex(
              mainMenu, mapConfigFiles, uniqueMapFiles, uniqueMapConfigRouterPaths
            );
            break;
          }
        }
      }
      
    }
    this.addContentPageToSearchIndex(markdownFiles, uniqueMarkdownRouterPaths);
    this.addMapConfigKeywordsToSearchIndex(mapConfigFiles, uniqueMapConfigRouterPaths);
  }

  /**
   * 
   * @param markdownContent The markdown content as a string.
   * @returns The first # header parsed out from the markdown content.
   */
  private getMarkdownTitle(markdownContent: string): string {

    // Attempt to find the title in between two hashes.
    var titleWithHash = markdownContent.match(/#(.*?)#/);

    if (titleWithHash) {
      return titleWithHash[0].substring(1, titleWithHash[0].length - 1).trim();
    }
    if (!titleWithHash) {
      const errorMessage = 'Error getting markdown file title. Confirm the file ' +
      "starts with '# Some Title #'.";
      console.error(errorMessage);
      return '';
    }
  }

  /**
   * 
   * @param menu 
   * @param mapConfigFiles 
   * @param uniqueMapFiles 
   * @param uniqueMapRouterPaths 
   */
  private processMapConfigFileForSearchIndex(
    menu: MainMenu | SubMenu, mapConfigFiles: Observable<any>[], uniqueMapFiles: {},
    uniqueMapConfigRouterPaths: string[]
  ): void {

    // Make sure the path being used as a key begins with no forward slash.
    const mapConfigFilePath = menu.mapProject.startsWith('/') ?
    menu.mapProject.substring(1) : menu.mapProject;

    if (!(mapConfigFilePath in uniqueMapFiles)) {

      uniqueMapFiles[mapConfigFilePath] = true;

      mapConfigFiles.push(
        this.appService.getJSONData(
          this.appService.getAppPath() + mapConfigFilePath
        )
      );
      // Add the prefix for the path to all InfoMapper Content Pages.
      uniqueMapConfigRouterPaths.push('/map/' + menu.id);
    }
  }

  /**
   * 
   * @param menu 
   * @param markdownFiles 
   * @param uniqueMarkdownFiles 
   * @param uniqueMarkdownRouterPaths 
   */
  private processMarkdownFileForSearchIndex(
    menu: MainMenu | SubMenu, markdownFiles: Observable<any>[], uniqueMarkdownFiles: {},
    uniqueMarkdownRouterPaths: string[]
  ): void {

    // Make sure the path being used as a key begins with no forward slash.
    const markdownFilePath = menu.markdownFile.startsWith('/') ?
    menu.markdownFile.substring(1) : menu.markdownFile;

    if (!(markdownFilePath in uniqueMarkdownFiles)) {

      uniqueMarkdownFiles[markdownFilePath] = true;

      markdownFiles.push(
        this.appService.getPlainText(
          this.appService.buildPath(Path.mP, menu.markdownFile)
        )
      );
      // Add the prefix for the path to all InfoMapper Content Pages.
      uniqueMarkdownRouterPaths.push('/content-page/' + menu.id);
    }
  }

  /**
   * Creates the Lunr search index, sets fields boosts, 
   * @param query The string to search for in the Lunr index.
   * @returns The results of the Lunr search with a fuzzy match.
   */
  search(query: string, opt: SearchOptions): lunr.Index.Result[] {

    const fuzzyMatch = opt.fuzzySearch ? '~1' : '';

    // if (!this.searchIndex) {
    var _this = this;

    this.searchIndex = lunr(function () {
      this.ref('title');
      this.field('text');

      if (opt.keywordSearch) {
        this.field('keywords', { boost: 5 });
      }
    
      _this.searchItems.forEach(function (doc) {
        this.add(doc)
      }, this)
    });
    // }

    return this.searchIndex.search(query + fuzzyMatch);
  }

}

