import { BrowserModule }            from '@angular/platform-browser';
import { NgModule }                 from '@angular/core';
import { HttpClientModule }         from '@angular/common/http';

import { AppComponent }             from './app.component';
import { AppRoutingModule }         from './app-routing.module';

import { AboutComponent }           from './about/about.component';

import { HomeComponent }            from './home/home.component';

// Bootstrap
import { AlertModule }              from 'ngx-bootstrap';

// Imports for NavBar Components
import { NavBarComponent }          from './nav-bar/nav-bar.component';
import { NavDirective }             from './nav-bar/nav.directive';
import { NavService }               from './nav-bar/nav-bar.service';
// NavBar Dropdown Components
import { DropdownOptionComponent }  from './nav-bar/nav-dropdown/nav-dropdown-option/nav-dropdown-option.component';
import { DropdownLinkComponent }    from './nav-bar/nav-dropdown/nav-dropdown-link/nav-dropdown-link.component';
import { NavDropdownComponent }     from './nav-bar/nav-dropdown/nav-dropdown.component';
import { DropDownDirective }        from './nav-bar/nav-dropdown/dropdown.directive';
// NavBar Link components
import { TabComponent }             from './nav-bar/tab/tab.component';
import { TabDirective }             from './nav-bar/tab/tab.directive';

//imports for map
import { MapComponent }             from './map-components/map.component';
import { MapService }               from './map-components/map.service';
// Background Layer Components
import { BackgroundLayerComponent } from './map-components/background-layer-control/background-layer.component';
import { BackgroundLayerDirective } from './map-components/background-layer-control/background-layer.directive';
// Map Layer Components
import { MapLayerComponent }        from './map-components/map-layer-control/map-layer.component';
import { MapLayerDirective }        from './map-components/map-layer-control/map-layer.directive';
// Map Sidepanel Components
import { SidePanelInfoComponent }   from './map-components/sidepanel-info/sidepanel-info.component';
import { SidePanelInfoDirective }   from './map-components/sidepanel-info/sidepanel-info.directive';
// Map Error Page Component
import { MapErrorComponent }        from './map-components/map-error/map-error.component';
import { AnimationToolsComponent }  from './map-components/animation-tools/animation-tools.component';
// Global Variables
import { Globals }                  from './globals';
// Not Found
import { NotFoundComponent }        from './not-found/not-found.component';
import { GenericPageComponent } from './generic-page/generic-page.component';

@NgModule({
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    AlertModule.forRoot(),
  ],
  providers: [
    NavService,
    MapService,
    Globals
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,

    NavBarComponent,
    NavDirective,
    DropdownOptionComponent,
    DropdownLinkComponent,
    NavDropdownComponent,
    DropDownDirective,
    TabComponent,
    TabDirective,

    MapComponent,
    MapLayerDirective,
    MapLayerComponent,
    BackgroundLayerComponent,
    BackgroundLayerDirective,
    SidePanelInfoComponent,
    SidePanelInfoDirective,
    MapErrorComponent,
    AnimationToolsComponent,

    NotFoundComponent,

    GenericPageComponent
  ],
  entryComponents: [ 
    NavDropdownComponent, 
    TabComponent, 
    DropdownOptionComponent, 
    DropdownLinkComponent,
    MapLayerComponent,
    BackgroundLayerComponent,
    SidePanelInfoComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  constructor() {}
}
