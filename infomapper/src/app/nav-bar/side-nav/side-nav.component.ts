import { Component,
          EventEmitter,
          OnInit,
          Output }      from '@angular/core';

import { AppService }   from 'src/app/app.service';

import { faFileLines,
          faGaugeHigh } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  /** Emits an event when either a Main or SubMenu is clicked and closes the sidenav. */
  @Output('sidenavClose') sidenavClose = new EventEmitter();
  /** All used icons in the SideNavComponent. */
  faFileLines = faFileLines;
  faGaugeHigh = faGaugeHigh;
  

  constructor(private appService: AppService) { }


  get appConfig(): any { return this.appService.appConfigObj; }

  ngOnInit(): void {
  }

  onSidenavClose(): void {
    this.sidenavClose.emit();
  }

}
