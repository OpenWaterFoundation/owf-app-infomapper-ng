import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {

  @Input('pageType') pageType = 'InfoMapper';


  /**
   * Constructor for the NotFoundComponent.
   */
  constructor() { }


}
