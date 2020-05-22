import { Component, OnInit } from '@angular/core';
import { Title }             from '@angular/platform-browser';
import { Router }            from '@angular/router';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  title: string = 'Info Mapper';

  constructor(private router: Router, public titleService: Title) {

    this.router.errorHandler = (error: any) => {
      let routerError = error.toString();
      if (routerError.indexOf('Cannot match any routes') >= 0 ) {
          this.router.navigate(['/404']);
      } else {
          throw error;
      }
    }
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }
}
