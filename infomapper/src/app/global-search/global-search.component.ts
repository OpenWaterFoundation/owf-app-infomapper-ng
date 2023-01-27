import { Component,
          OnInit }           from '@angular/core';
import { FormControl,
          FormGroup }        from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { KeyWordPage } from '@OpenWaterFoundation/common/services';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit {

  displayedColumns = ['Page', 'Score'];
  keywordData = [];
  /** All used FontAwesome icons in the AppConfigComponent. */
  faMagnifyingGlass = faMagnifyingGlass;
  /**
   * 
   */
  readonly keyWordPages: KeyWordPage[];
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

    this.keyWordPages = this.appService.appConfig.keywords;
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
  ngOnInit(): void {
    console.log('All keyword objects:', this.keyWordPages);

    this.setupTableVars();
  }

  /**
   * 
   */
  performSearch(): void {
    console.log('Searching the InfoMapper with input "' + this.searchFG.get('searchString').value + '"');


  }

  private setupTableVars(): void {

    // Create all named columns for the table.
    // this.keyWordPages.forEach((keywordPage: KeyWordPage) => {
    //   this.displayedColumns.push(Object.keys(keywordPage)[0]);
    // });

  }

}
