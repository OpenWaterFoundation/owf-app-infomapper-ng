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

import { CommonLoggerService,
          DialogData }               from '@OpenWaterFoundation/common/services';
import { WindowManager,
          WindowType }               from '@OpenWaterFoundation/common/ui/window-manager';

import { AppService }                from '../services/app.service';
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
  /** The windowManager instance for managing the opening and closing of windows
   * throughout the InfoMapper. */
  windowManager: WindowManager = WindowManager.getInstance();


  /**
   * The NavBarComponent constructor.
   * @param appService The overarching application service.
   * @param dialog Service to open Material Design modal dialogs.
   * @param logger Logger from the Common package for debugging and testing.
   * @param screenSizeService Service for determining the current size of the screen.
   */
  constructor(
    private appService: AppService,
    private dialog: MatDialog,
    private logger: CommonLoggerService,
    private screenSizeService: BreakpointObserverService
  ) {
    this.homeMenuTitle = this.appService.appConfig.title;
  }


  /**
   * Getter for the appConfig object.
   */
  get appConfig(): any { return this.appService.appConfigObj; }

  /**
  * Creates a dialog config object and sets its width & height properties based
  * on the current screen size.
  * @param dialogData Optional object with necessary data to send to the dialog.
  * @returns An object to be used for creating a dialog with its initial, min, and max
  * height and width conditionally.
  */
  private createDialogConfig(dialogData?: DialogData): MatDialogConfig {

    var isMobile = this.screenSizeService.isMobile;

    return {
      data: dialogData ? dialogData : null,
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
      height: isMobile ? "85vh" : "850px",
      width: isMobile ? "100vw" : "875px",
      minHeight: isMobile ? "85vh" : "350px",
      minWidth: isMobile ? "100vw" : "515px",
      maxHeight: isMobile ? "85vh" : "90vh",
      maxWidth: isMobile ? "100vw" : "90vw"
    }
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
  ngOnInit(): void {

    this.logger.print('info', 'NavBarComponent.loadComponent - Navbar initialization.');
  }

  /**
   * Emits an event to the SideNav component 
   */
  onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  /**
   * Opens the global search dialog.
   */
  openSearchDialog(): void {

    const windowId = 'global-search-window';
    const dialogData = {
      windowId: windowId
    };

    if (!this.windowManager.addWindow(windowId, WindowType.SEARCH)) {
      return;
    }

    var dialogRef: MatDialogRef<GlobalSearchComponent, any> = this.dialog.open(
      GlobalSearchComponent, this.createDialogConfig(dialogData)
    );
  }

}