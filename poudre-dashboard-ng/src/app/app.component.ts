import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  //templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'poudre-dashboard-ng';

  constructor(private router: Router) {
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

  }
}
