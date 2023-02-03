import { Component,
          OnInit }           from '@angular/core';
import { FormControl,
          FormGroup }        from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { KeywordPage } from '@OpenWaterFoundation/common/services';
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
  displayedColumns = ['Page', 'Relevance rating'];
  /** All used FontAwesome icons in the AppConfigComponent. */
  faMagnifyingGlass = faMagnifyingGlass;
  /**
   * 
   */
  foundKeywordData: {page?: string, totalScore?: number}[] = Array(10).fill({});
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
  searchResults: any[] = [];


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
      this.foundKeywordData = Array(10).fill({});
      this.searchResults = [];
    }
  }

  /**
   * 
   */
  ngOnInit(): void {

  }

  /**
   * 
   */
  performSearch(): void {
    this.searchResults = this.searchService.search(this.searchFG.get('searchString').value);

    console.log('Search results:', this.searchResults);

    var foundKeywords: {page: string, totalScore: number, routerPath: string}[] = [];
    this.searchResults.forEach((result: lunr.Index.Result) => {

      foundKeywords.push({
        page: result.ref,
        totalScore: Math.round(result.score * 100),
        routerPath: this.searchService.allDocumentsRouterPath[result.ref]
      });
    });

    this.foundKeywordData = [...foundKeywords];
  }

}
