import { BrowserModule,
          Title }                    from '@angular/platform-browser';
import { NgModule }                  from '@angular/core';
import { HashLocationStrategy,
          LocationStrategy  }        from '@angular/common';
import { HttpClientModule }          from '@angular/common/http';

import { AppComponent }              from './app.component';
import { AppRoutingModule }          from './app-routing.module';

// Bootstrap & Angular Material
import { AlertModule }               from 'ngx-bootstrap';
import { MatTooltipModule }          from '@angular/material/tooltip';
import { MatCheckboxModule }         from '@angular/material/checkbox';
import { MatButtonModule }           from '@angular/material/button';
import { MatDialogModule }           from '@angular/material/dialog';
import { MatInputModule }            from '@angular/material/input';
import { MatProgressBarModule }      from '@angular/material/progress-bar';
import { MatIconModule }             from '@angular/material/icon';
import { MatMenuModule }             from '@angular/material/menu';
import { MatTableModule }            from '@angular/material/table';
import { MatProgressSpinnerModule }  from '@angular/material/progress-spinner';
import { MatSlideToggleModule }      from '@angular/material/slide-toggle';
import { DragDropModule }            from '@angular/cdk/drag-drop';
import { ScrollingModule }           from '@angular/cdk/scrolling';

import { NgxGalleryModule }          from 'ngx-gallery-9';
import { TableVirtualScrollModule }  from 'ng-table-virtual-scroll';
import { ShowdownModule }            from 'ngx-showdown';
// Imports for NavBar Components
import { NavBarComponent }           from './nav-bar/nav-bar.component';
import { NavDirective }              from './nav-bar/nav.directive';
// NavBar Link components
import { TabComponent }              from './nav-bar/tab/tab.component';
import { TabDirective }              from './nav-bar/tab/tab.directive';
//imports for map
import { MapComponent }              from './map-components/map.component';
import { MapService }                from './map-components/map.service';
// Background Layer Components
import { BackgroundLayerComponent }  from './map-components/background-layer-control/background-layer.component';
import { BackgroundLayerDirective }  from './map-components/background-layer-control/background-layer.directive';
// Dialog Content Components
import { DialogGapminderComponent }  from './map-components/dialog-content/dialog-gapminder/dialog-gapminder.component';
// Map Sidepanel Components
import { SidePanelInfoComponent }    from './map-components/sidepanel-info/sidepanel-info.component';
import { SidePanelInfoDirective }    from './map-components/sidepanel-info/sidepanel-info.directive';
// Map Error Page Component
import { MapErrorComponent }         from './map-components/map-error/map-error.component';
// Not Found
import { NotFoundComponent }         from './not-found/not-found.component';
import { ContentPageComponent }      from './content-page/content-page.component';
// Browser Animation Stuff...
import { BrowserAnimationsModule }   from '@angular/platform-browser/animations';
// Full app service
import { AppService }                from './app.service';
// Sanitizing URL's safely
// Main kebab menu disabling
import { MenuDisablePipe }           from './map-components/menu-disable.pipe';

import * as Showdown                 from 'showdown';


const classMap = {
  h1: 'showdown_h1',
  h2: 'showdown_h2',
  ul: 'ui list',
  li: 'ui item',
  table: 'showdown_table',
  td: 'showdown_td',
  th: 'showdown_th',
  tr: 'showdown_tr',
  p: 'showdown_p',
  pre: 'showdown_pre'
}

const bindings = Object.keys(classMap)
  .map(key => ({
    type: 'output',
    regex: new RegExp(`(<${key}>|<${key} (.*?)>)`, 'g'),
    replace: `<${key} class="${classMap[key]}">`
  }));

const convert = new Showdown.Converter({
  extensions: [bindings]
});

// OwfShowdownModule, Can be added to display a simple showdown Angular library in the InfoMapper.
@NgModule({
  imports: [
    AlertModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    HttpClientModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTableModule,
    NgxGalleryModule,
    ScrollingModule,
    ShowdownModule.forRoot({ emoji: true, noHeaderId: true, extensions: [bindings], openLinksInNewWindow: true, flavor: 'github' }),
    TableVirtualScrollModule
  ],
  providers: [
    AppService,
    MapService,
    Title,
    {provide : LocationStrategy , useClass: HashLocationStrategy}
  ],
  // DialogTextComponent, DialogDocComponent, DialogPropertiesComponent, DialogDataTableComponent, ZoomDisablePipe, DialogTSGraphComponent, DialogTSTableComponent
  // JustificationPipe, DialogGalleryComponent
  declarations: [
    AppComponent,
    BackgroundLayerComponent,
    ContentPageComponent,
    MapComponent,
    MapErrorComponent,
    NavBarComponent,
    NotFoundComponent,
    SidePanelInfoComponent,
    TabComponent,

    BackgroundLayerDirective,
    NavDirective,
    TabDirective,
    SidePanelInfoDirective,

    MenuDisablePipe,
    DialogGapminderComponent
  ],
  entryComponents: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  constructor() {}
}
