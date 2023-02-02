import { Component,
          EventEmitter,
          OnInit,
          Output }                   from '@angular/core';
          
import { MatDialog,
          MatDialogConfig,
          MatDialogRef }             from '@angular/material/dialog';

import { faBars,
          faEllipsis,
          faMagnifyingGlass }        from '@fortawesome/free-solid-svg-icons';
 
import { AppService }                from '../services/app.service';
import { CommonLoggerService }       from '@OpenWaterFoundation/common/services';

import { BreakpointObserverService } from '../services/breakpoint-observer.service';
import { GlobalSearchComponent }     from '../global-search/global-search.component';


@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {

  /** All used FontAwesome icons in the AppConfigComponent. */
  faBars = faBars;
  faEllipsis = faEllipsis;
  faMagnifyingGlass = faMagnifyingGlass;
  /** Emits an event when the sidenav button is clicked in the nav bar and toggles
   * the sidenav itself. */
  @Output('sidenavToggle') sidenavToggle = new EventEmitter<any>();
  /** The top application title property from the app-config file. */
  homeMenuTitle: string;


  /**
   * The NavBarComponent constructor.
   * @param appService The overarching application service.
   * @param logger Logger from the Common package for debugging and testing.
   * @param owfCommonService The OwfCommonService from the Common library.
   * @param titleService Service that can be used to get and set the title of the
   * current HTML document.
   * @param document An injectable for manipulating the DOM.
   */
  constructor(private appService: AppService, private dialog: MatDialog, private logger: CommonLoggerService,
  private screenSizeService: BreakpointObserverService) {

    this.homeMenuTitle = this.appService.appConfig.title;
  }


  /**
   * 
   */
  get appConfig(): any { return this.appService.appConfigObj; }

  /**
  * Creates a dialog config object and sets its width & height properties based
  * on the current screen size.
  * @returns An object to be used for creating a dialog with its initial, min, and max
  * height and width conditionally.
  */
  private createDialogConfig(dialogData?: any): MatDialogConfig {

    var isMobile = this.screenSizeService.isMobile;

    return {
      data: dialogData ? dialogData : null,
      panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
      height: isMobile ? "90vh" : "850px",
      width: isMobile ? "100vw" : "875px",
      minHeight: isMobile ? "90vh" : "850px",
      minWidth: isMobile ? "100vw" : "875px",
      maxHeight: isMobile ? "90vh" : "850px",
      maxWidth: isMobile ? "100vw" : "875px"
    }
  }

  /**
   * 
   */
  ngOnInit() {

    this.logger.print('info', 'NavBarComponent.loadComponent - Navbar initialization.');
  }

  /**
   * Emits an event to the SideNav component 
   */
  onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  /**
   * 
   */
  openSearchDialog(): void {

    var dialogConfigData = {
      test: 'test'
    }

    var dialogRef: MatDialogRef<GlobalSearchComponent, any> = this.dialog.open(
      GlobalSearchComponent, this.createDialogConfig(dialogConfigData)
    );
  }

}