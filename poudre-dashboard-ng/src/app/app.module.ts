import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AppRoutingModule } from './app-routing.module';
import { MapComponent } from './map/map.component';
import {HttpClientModule} from '@angular/common/http';

//imports for nav-bar
import { navDropdownComponent }   from './nav-bar/nav-dropdown.component';
import { navLinkComponent } from './nav-bar/nav-link.component';

import { dropdownOptionComponent } from './nav-bar/nav-dropdownOption.component';
import { dropdownLinkComponent } from './nav-bar/nav-dropdownLink.component';

import { NavDirective }          from './nav-bar/nav.directive';
import { DropDownDirective }          from './nav-bar/dropdown.directive';
import { navService }            from './nav-bar/nav-bar.service';

//imports for map
import { LayerComponent } from './map/layer.component';
import { SidePanelInfoComponent } from './map/sidepanel-info.component';

import { MapDirective }          from './map/map.directive';
import { SidePanelInfoDirective } from './map/sidepanel-info.directive';
import { mapService }            from './map/map.service';

import { MapErrorComponent } from './map/map-error.component';

@NgModule({
  imports: [HttpClientModule,
            BrowserModule,
            AppRoutingModule
  ],
  providers: [navService, mapService],
  declarations: [
    AppComponent,
    NavBarComponent,
    HomeComponent,
    AboutComponent,
    MapComponent,

    dropdownOptionComponent,
    dropdownLinkComponent,

    navDropdownComponent,
    navLinkComponent,
    NavDirective,
    DropDownDirective,

    LayerComponent,
    MapDirective,
    SidePanelInfoComponent,
    SidePanelInfoDirective,

    MapErrorComponent
  ],
  entryComponents: [ navDropdownComponent, navLinkComponent, dropdownOptionComponent, dropdownLinkComponent, LayerComponent, SidePanelInfoComponent ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {}
}
