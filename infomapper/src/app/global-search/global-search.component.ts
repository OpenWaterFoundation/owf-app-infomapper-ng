import { Component,
          OnInit }               from '@angular/core';
import { FormControl,
          FormGroup }            from '@angular/forms';
import { MatDialogRef }          from '@angular/material/dialog';

import { faMagnifyingGlass }     from '@fortawesome/free-solid-svg-icons';
import { SearchOptions,
          SearchResultsDisplay } from '@OpenWaterFoundation/common/services';

import * as lunr                 from 'lunr';

import { SearchService }         from '../services/search.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent {

  /** The actively used columns in the search dialog. */
  displayedColumns = ['Page', 'Type', 'Relevance rating'];
  /** All used FontAwesome icons in the AppConfigComponent. */
  faMagnifyingGlass = faMagnifyingGlass;
  /** Used to display results (or these placeholders) in the Angular Material table. */
  searchResultDisplay: SearchResultsDisplay[] = Array(10).fill({});
  /** The FormGroup used for capturing user input through input and/or checkboxes. */
  searchFG = new FormGroup({
    fuzzySearch: new FormControl(false),
    searchString: new FormControl(''),
    keywordSearch: new FormControl(true)
  });
  /** Results returned from a Lunr search. */
  searchResults: lunr.Index.Result[] = [];
  /** The time it took to perform the search in seconds. */
  searchTime: string;


  /**
   * 
   * @param dialogRef The dialog reference for this component.
   * @param searchService Service that uses the Lunr package to perform global application
   * searches.
   */
  constructor(private dialogRef: MatDialogRef<GlobalSearchComponent>, private searchService: SearchService) {

  }


  /**
   * Getter that returns the length of the searchResults array.
   */
  get anyResults(): boolean {
    return this.searchResults.length > 0;
  }

  /**
   * Getter for the current string used in the search input field.
   */
  get searchString(): string {
    return this.searchFG.get('searchString').value;
  }

  /**
   * Closes this dialog instance.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Checks (every change detection) if the search string is empty, and resets the
   * result and display arrays.
   */
  searchInputKeyup(): void {
    if (this.searchString === '') {
      this.searchResultDisplay = Array(10).fill({});
      this.searchResults = [];
    }
    // this.performSearch();
  }

  /**
   * Perform the Lunr search using the provided user input and checked radio boxes
   * by using the Search service.
   */
  performSearch(): void {

    const searchStart = performance.now();

    const searchString = this.searchFG.get('searchString').value;
    const searchOptions: SearchOptions = {
      fuzzySearch: this.searchFG.get('fuzzySearch').value,
      keywordSearch: this.searchFG.get('keywordSearch').value
    }

    this.searchResults = this.searchService.search(searchString, searchOptions);

    var resultsForTable: SearchResultsDisplay[] = [];

    this.searchResults.forEach((result: lunr.Index.Result) => {

      resultsForTable.push({
        page: result.ref,
        totalScore: Math.round(result.score * 100),
        routerPath: this.searchService.searchItemsMetadata[result.ref].routerPath,
        type: this.searchService.searchItemsMetadata[result.ref].type
      });
    });

    this.searchResultDisplay = [...resultsForTable];
    // End the timer for searching.
    this.searchTime = ((performance.now() - searchStart) / 1000).toFixed(3);
  }

}
