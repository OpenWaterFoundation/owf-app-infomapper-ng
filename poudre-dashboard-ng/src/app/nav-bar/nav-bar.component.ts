import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  active: String;

  constructor() { }

  ngOnInit() {
  }

  pageSelect(page: String) :void {
    this.active = page
  }

}
