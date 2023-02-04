import { Component,
          OnInit }           from '@angular/core';
import { FormControl,
          FormGroup }        from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { KeywordPage,
          SearchResultsDisplay } from '@OpenWaterFoundation/common/services';
import * as lunr from 'lunr';
import { AppService } from '../services/app.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit {

  /**
   * 
   */
  displayedColumns = ['Page', 'Type', 'Relevance rating'];
  /** All used FontAwesome icons in the AppConfigComponent. */
  faMagnifyingGlass = faMagnifyingGlass;
  /**
   * 
   */
  searchResultDisplay: SearchResultsDisplay[] = Array(10).fill({});
  /**
   * 
   */
  readonly keywordPages: KeywordPage;
  /**
   * 
   */
  searchFG = new FormGroup({
    searchString: new FormControl('')
  });
  /**
   * 
   */
  searchResults: lunr.Index.Result[] = [];
  /** The time it took to perform the search in seconds. */
  searchTime: string;


  /**
   * 
   * @param dialogRef 
   */
  constructor(private appService: AppService, private dialogRef: MatDialogRef<GlobalSearchComponent>,
  private searchService: SearchService) {

    this.keywordPages = this.appService.appConfig.keywords;
  }


  get anyResults(): boolean {
    return this.searchResults.length > 0;
  }

  /**
   * 
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
   * 
   */
  searchInputKeyup(): void {
    if (this.searchString === '') {
      this.searchResultDisplay = Array(10).fill({});
      this.searchResults = [];
    }
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {

  }

  /**
   * 
   */
  performSearch(): void {
    const searchStart = performance.now();

    this.searchResults = this.searchService.search(this.searchFG.get('searchString').value);

    console.log('Search results:', this.searchResults);

    var searchResultsPrime: SearchResultsDisplay[] = [];

    this.searchResults.forEach((result: lunr.Index.Result) => {

      searchResultsPrime.push({
        page: result.ref,
        totalScore: Math.round(result.score * 100),
        routerPath: this.searchService.searchItemsMetadata[result.ref].routerPath,
        type: this.searchService.searchItemsMetadata[result.ref].type
      });
    });

    this.searchResultDisplay = [...searchResultsPrime];
    // End the timer for searching.
    this.searchTime = ((performance.now() - searchStart) / 1000).toFixed(3);
  }

}
