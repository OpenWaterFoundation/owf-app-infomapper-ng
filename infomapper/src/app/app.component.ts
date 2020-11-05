import { Component,
          OnInit }         from '@angular/core';
import { Title }           from '@angular/platform-browser';
import { Router,
          NavigationEnd }  from '@angular/router';

import { AppService }      from './app.service';


declare let gtag: Function;

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  title: string = 'Info Mapper';

  constructor(private router: Router,
              public titleService: Title,
              private appService: AppService) {

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
        setTimeout(() => {
          gtag('config', this.appService.getGoogleTrackingId(),
          {
            'page_path': event.urlAfterRedirects
          });
        }, (this.appService.isTrackingIdSet() ? 0 : 1500));

      }
    });

  }

  ngOnInit() { }
}
