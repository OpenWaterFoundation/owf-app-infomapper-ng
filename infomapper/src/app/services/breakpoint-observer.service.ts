import { Injectable }       from '@angular/core';
import { BreakpointObserver,
          Breakpoints, 
          BreakpointState } from '@angular/cdk/layout';


@Injectable({
  providedIn: 'root'
})
export class BreakpointObserverService {

  /** The current size of the application, determined by built-in breakpoints. */
  private _currentScreenSize: string;


  /**
   * The constructor for the BreakpointObserverService.
   * @param breakpointObserver Utility for checking the matching state of `@media`
   * queries.
   */
  constructor(private breakpointObserver: BreakpointObserver) {
    this.initializeObserver();
  }


  /**
   * Getter that determines whether the application is in a minimized size.
   */
  get isMobile(): boolean {
    return (this._currentScreenSize === Breakpoints.XSmall ||
    this._currentScreenSize === Breakpoints.Small) ?
    true : false;
  }

  /**
   * Subscribe to the breakpoint observer, which will listen for changes to the
   * window size and set the current screen size variable.
   */
  private initializeObserver(): void {

    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge,
    ]).subscribe((state: BreakpointState) => {
      for (const breakpoint of Object.keys(state.breakpoints)) {
        if (state.breakpoints[breakpoint]) {
          this._currentScreenSize = breakpoint;
        }
      }
    });
  }

}