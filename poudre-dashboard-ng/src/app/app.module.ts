import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { MapComponent } from './map/map.component';
import {HttpClientModule} from '@angular/common/http';

import { navDropdownComponent }   from './nav-bar/nav-dropdown.component';
import { navLinkComponent } from './nav-bar/nav-link.component';

import { dropdownOptionComponent } from './nav-bar/nav-dropdownOption.component';
import { dropdownLinkComponent } from './nav-bar/nav-dropdownLink.component';

import { NavDirective }          from './nav-bar/nav.directive';
import { DropDownDirective }          from './nav-bar/dropdown.directive';
import { navService }            from './nav-bar/nav-bar.service';

@NgModule({
  imports: [HttpClientModule,BrowserModule,AppRoutingModule],
  providers: [navService],
  declarations: [
    AppComponent,
    NavBarComponent,
    HomeComponent,
    MapComponent,

    dropdownOptionComponent,
    dropdownLinkComponent,

    navDropdownComponent,
    navLinkComponent,
    NavDirective,
    DropDownDirective
  ],
  entryComponents: [ navDropdownComponent, navLinkComponent, dropdownOptionComponent, dropdownLinkComponent ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {}
}
