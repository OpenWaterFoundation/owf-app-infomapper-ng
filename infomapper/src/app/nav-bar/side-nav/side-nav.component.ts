import { Component,
          EventEmitter,
          OnDestroy,
          OnInit,
          Output }             from '@angular/core';
import { ActivatedRoute,
          ParamMap }           from '@angular/router';

import { Subject }             from 'rxjs';
import { takeUntil }           from 'rxjs/operators'

import { AppService }          from 'src/app/services/app.service';

import { CommonLoggerService } from '@OpenWaterFoundation/common/services';

import { faBookOpen,
          faChevronDown,
          faFileLines,
          faGaugeHigh }        from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit, OnDestroy {

  /** Subject that is completed when this component is destroyed. */
  destroyed = new Subject<void>();
  /** Emits an event when either a Main or SubMenu is clicked and closes the sidenav. */
  @Output('sidenavClose') sidenavClose = new EventEmitter();
  /** All used icons in the SideNavComponent. */
  faBookOpen = faBookOpen;
  faChevronDown = faChevronDown;
  faFileLines = faFileLines;
  faGaugeHigh = faGaugeHigh;
  

  /**
   * Constructor for the SideNavComponent.
   * @param actRoute Provides access to information about a route associated with
   * a component that is loaded in an outlet.
   * @param appService The InfoMapper app service with globally set variables from
   * configuration files and other useful top level methods.
   * @param logger Logger from the Common package for debugging and testing.
   */
  constructor(private actRoute: ActivatedRoute, private appService: AppService,
  private logger: CommonLoggerService) { }


  /**
   * Getter for the appConfig object.
   */
  get appConfig(): any { return this.appService.appConfigObj; }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {
    this.logger.print('info', 'SideNavComponent.ngOnInit - Sidebar initialization.');

    this.actRoute.queryParamMap.pipe(takeUntil(this.destroyed)).
    subscribe((params: ParamMap) => {

      this.logger.print('trace', 'SideNavComponent.ngOnInit - App Config Object:',
      params.get('debug'), params.get('debugLevel'));
      this.logger.print('trace', this.appService.appConfigObj,
      params.get('debug'), params.get('debugLevel'));
    });

  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * Emits an event back to the App Component so the side bar is closed.
   */
  onSidenavClose(): void {
    this.sidenavClose.emit();
  }

}
