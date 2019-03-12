import { Component, OnInit } from '@angular/core';
import * as $ from 'jQuery';

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

  tabSelected(event: Event) :void {
    // Clear previously active item from navbar
    $("#navbarNav").find("a.nav-link.active").removeClass("active");
    // Clear any potential dropdown active items
    // $("#navbarNav").find("a.dropdown-item.active").removeClass("active");
    $(event.currentTarget).find('a').addClass("active");
    console.log($(event.currentTarget))
  }

  dropdownItemSelected(event: Event) :void {
    $("#navbarNav").find("a.dropdown-item.active").removeClass("active");
    $(event.currentTarget).addClass("active");
    $(event.currentTarget).parent().parent().addClass("active");
  }
}
