import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  active: String;
  mapIcon: String = "assets/img/baseline-map-24px.svg";
  externalLinkIcon: String = "assets/img/baseline-open_in_new-24px.svg";

  constructor() { }

  ngOnInit() {
  }

  pageSelect(page: String) :void {
    this.active = page
  }

  // selectedTab() :void {
  //   $( '#navbarNav .navbar-nav' ).find( 'li.active' ).removeClass( 'active' );
	//   $( this ).parent( 'li' ).addClass( 'active' );
  // }

}
