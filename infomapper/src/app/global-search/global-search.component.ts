import { Component,
          OnInit }           from '@angular/core';
import { FormControl,
          FormGroup }        from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Keyword, KeywordPage } from '@OpenWaterFoundation/common/services';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit {

  /**
   * 
   */
  displayedColumns = ['Page', 'Relevance rating (higher the better)'];
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
   * @param dialogRef 
   */
  constructor(private appService: AppService, private dialogRef: MatDialogRef<GlobalSearchComponent>) {

    this.keywordPages = this.appService.appConfig.keywords;
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

  searchInputKeyup(): void {
    if (this.searchString === '') {
      this.foundKeywordData = Array(10).fill({});
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

    var foundKeywords: {page: string, totalScore: number}[] = [];
    // Iterate over each key, value pair in the keywordPages object.
    Object.entries(this.keywordPages).forEach(([path, keywords]: [string, Keyword[]]) => {

      var keywordScore = 0;
      // Iterate over each keyword object in the keywords array.
      keywords.forEach((keyword: Keyword) => {

        if (keyword.word.toLowerCase().includes(this.searchString.toLowerCase())) {
          keywordScore += keyword.score;
        }
        else if (this.searchString.toLowerCase().includes(keyword.word.toLowerCase())) {
          keywordScore += keyword.score;
        }
      });

      if (keywordScore > 0) {
        foundKeywords.push({
          page: path,
          totalScore: keywordScore
        });
      }
    });

    this.foundKeywordData = [...foundKeywords];
    console.log('Found pages:', this.foundKeywordData);
  }

}
