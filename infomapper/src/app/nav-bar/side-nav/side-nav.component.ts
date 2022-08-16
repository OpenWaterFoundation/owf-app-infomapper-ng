import { Component,
          EventEmitter,
          OnDestroy,
          OnInit,
          Output }             from '@angular/core';
import { ActivatedRoute,
          ParamMap }           from '@angular/router';

import { Subject }             from 'rxjs';
import { takeUntil }           from 'rxjs/operators'

import { AppService }          from 'src/app/app.service';

import { CommonLoggerService } from '@OpenWaterFoundation/common/services';

import { faBookOpen,
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
  faFileLines = faFileLines;
  faGaugeHigh = faGaugeHigh;
  

  /**
   * 
   * @param appService The InfoMapper app service with globally set variables from
   * configuration files and other useful top level methods.
   * @param logger Logger from the Common package for debugging and testing.
   */
  constructor(private appService: AppService, private logger: CommonLoggerService,
  private actRoute: ActivatedRoute) { }


  get appConfig(): any { return this.appService.appConfigObj; }

  ngOnInit(): void {
    this.logger.print('info', 'SideNavComponent.ngOnInit - Sidebar created.');

    this.actRoute.queryParamMap.pipe(takeUntil(this.destroyed)).
    subscribe((params: ParamMap) => {

      this.logger.print('trace', 'SideNavComponent.ngOnInit - App Config Object:',
      params.get('debug'), params.get('debugLevel'));
      this.logger.print('trace', this.appService.appConfigObj,
      params.get('debug'), params.get('debugLevel'));
    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.destroyed.next();
    this.destroyed.complete();
  }

  onSidenavClose(): void {
    this.sidenavClose.emit();
  }

}
