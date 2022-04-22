import { Component,
          OnInit }         from '@angular/core';
import { Title }           from '@angular/platform-browser';
import { ActivatedRoute,
          Router,
          NavigationEnd, 
          ParamMap}        from '@angular/router';
import { Observable }      from 'rxjs';

import { AppService }      from './app.service';


declare let gtag: Function;

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  /**
   * 
   */
   isEmbedded$: Observable<boolean>;
  /**
   * 
   */
  title: string = 'InfoMapper';

  constructor(private route: ActivatedRoute,
  private router: Router,
  public titleService: Title,
  private appService: AppService) {
      
    this.isEmbedded$ = this.appService.isEmbeddedApp;

    this.router.errorHandler = (error: any) => {
      let routerError = error.toString();
      if (routerError.indexOf('Cannot match any routes') >= 0 ) {
          this.router.navigate(['/404']);
      } else {
        throw error;
      }
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // The original way of sending the URL as the page_path property after (and
        // not including) the hash. event.urlAfterRedirects
        gtag('config', this.appService.getGoogleTrackingId(),
        {
          'page_path': location.pathname + location.search + location.hash
        });
      }
    });

    this.route.queryParamMap.subscribe((queryParamMap: ParamMap) => {

      if (queryParamMap.get('embed') !== null) {
        if (queryParamMap.get('embed') === 'true') {
          this.appService.toggleEmbeddedApp = true;
        } else {
          this.appService.toggleEmbeddedApp = false
        };
      } else this.appService.toggleEmbeddedApp = false;
    });

  }

  ngOnInit() { }
}
