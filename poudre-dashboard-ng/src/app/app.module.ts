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
import { AdDirective }          from './nav-bar/ad.directive';
import { navService }            from './nav-bar/nav-bar.service';

@NgModule({
  imports: [HttpClientModule,BrowserModule,AppRoutingModule],
  providers: [navService],
  declarations: [
    AppComponent,
    NavBarComponent,
    HomeComponent,
    MapComponent,

    navDropdownComponent,
    navLinkComponent,
    AdDirective
  ],
  entryComponents: [ navDropdownComponent, navLinkComponent ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {}
}
