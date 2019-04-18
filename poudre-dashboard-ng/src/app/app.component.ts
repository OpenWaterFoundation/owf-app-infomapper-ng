import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  //templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  template: `
    <div>
      <app-nav-bar></app-nav-bar>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent implements OnInit {
  title = 'poudre-dashboard-ng';

  constructor() {}

  ngOnInit() {

  }
}
