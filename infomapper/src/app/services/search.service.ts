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
  /** Each item to add to the Lunr search index. */
  searchItems: SearchItem[] = [];
  /** Object kept separate from the Lunr search index with each property's metadata.
   * Used for properties that are needed when displayed on the table, but are not
   * searchable. */
  searchItemsMetadata: SearchItemsMetadata = {};


  /**
   * Constructor for the SearchService.
   * @param appService Top level application service.
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
   * Asynchronously fetches all map config files given in the @var mapConfigFiles
   * array.
   * @param mapConfigFiles Array of observables to each map config file.
   * @param uniqueMapConfigRouterPaths Array of unique paths to be used for each
   * map config in the URL.
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
   * Adds the necessary data to be searched, and the metadata of each markdown file.
   * @param title The title for the Content Page.
   * @param text The searchable markdown text to add to the index.
   * @param routerPath The path to be appended to the URL for a markdown file.
   * @param type The type to be displayed in the results table.
   */
  addMarkdownContentToIndex(title: string, text: string, routerPath: string, type: string): void {

    // Add to the search indexed documents object.
    this.searchItems.push({
      title: title,
      text: text
    });

    // Add metadata for this markdown content.
    const itemMetadata: SearchItemMetadata = {
      routerPath: routerPath,
      type: type
    }
    this.searchItemsMetadata[title] = itemMetadata;
  }

  /**
   * 
   * @param title The title for the keywords for this searchable map config file.
   * @param keywords The flattened array to a string of all keywords from the map
   * config file, separated by spaces.
   * @param routerPath The path to be appended to the URL for this map config.
   * @param type The type to be displayed in the results table.
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
    // Each MainMenu.
    for (let mainMenu of this.appConfig.mainMenu) {

      if (this.appService.menuEnabledAndVisible(mainMenu)) {
        if (mainMenu.menus) {
          // Each SubMenu.
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
   * Parses out the title of the Markdown file content, and prints an error if not
   * surrounded by two hashes.
   * @param markdownContent The markdown content as a string.
   * @returns The header parsed out from the markdown content's first line. The title
   * *must* be surrounded by hashes.
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
   * Adds necessary data to be used or fetched for searching for a map config file's
   * contents.
   * @param menu MainMenu or SubMenu object from the `app-config` file.
   * @param mapConfigFiles Reference to the array to hold all observables to perform
   * the asynchronous fetch from a map config file.
   * @param uniqueMapFiles Object to hold the path to a map config file. Will only
   * contain unique keys.
   * @param uniqueMapRouterPaths Reference to the array that holds the path to be
   * appended to the URL for this map config's page.
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
   * Adds necessary data to be used or fetched for searching for a markdown file's
   * contents.
   * @param menu MainMenu or SubMenu object from the `app-config` file.
   * @param markdownFiles Reference to the array to hold all observables to perform
   * the asynchronous fetch from a markdown file.
   * @param uniqueMarkdownFiles Object to hold the path to a markdown file. Will only
   * contain unique keys.
   * @param uniqueMarkdownRouterPaths Reference to the array that holds the path
   * to be appended to the URL for this markdown's page.
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
   * Creates the Lunr search index, and depending on checkboxes, sets optional variables
   * as well.
   * @param query The string to search for in the Lunr index.
   * @returns The results of the Lunr search with a fuzzy match.
   */
  search(query: string, opt: SearchOptions): lunr.Index.Result[] {

    const fuzzyMatch = opt.fuzzySearch ? '~1' : '';

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

    return this.searchIndex.search(query + fuzzyMatch);
  }

}

