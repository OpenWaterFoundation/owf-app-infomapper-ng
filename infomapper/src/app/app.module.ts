import { BrowserModule, Title }     from '@angular/platform-browser';
import { NgModule }                 from '@angular/core';
import { HashLocationStrategy,
          LocationStrategy  }       from '@angular/common';
import { HttpClientModule }         from '@angular/common/http';

import { AppComponent }             from './app.component';
import { AppRoutingModule }         from './app-routing.module';

// Bootstrap & Angular Material
import { AlertModule }              from 'ngx-bootstrap';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { MatCheckboxModule }        from '@angular/material/checkbox';
import { MatButtonModule }          from '@angular/material/button';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatInputModule }           from '@angular/material/input';
import { MatProgressBarModule }     from '@angular/material/progress-bar';
import { MatIconModule }            from '@angular/material/icon';
import { MatMenuModule }            from '@angular/material/menu';
import { MatTableModule }           from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { DragDropModule }           from '@angular/cdk/drag-drop';
import { ScrollingModule }          from '@angular/cdk/scrolling';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { ShowdownModule }           from 'ngx-showdown';

// Imports for NavBar Components
import { NavBarComponent }          from './nav-bar/nav-bar.component';
import { NavDirective }             from './nav-bar/nav.directive';
// NavBar Link components
import { TabComponent }             from './nav-bar/tab/tab.component';
import { TabDirective }             from './nav-bar/tab/tab.directive';
//imports for map
import { MapComponent }             from './map-components/map.component';
import { MapService }               from './map-components/map.service';
// Background Layer Components
import { BackgroundLayerComponent } from './map-components/background-layer-control/background-layer.component';
import { BackgroundLayerDirective } from './map-components/background-layer-control/background-layer.directive';
// Dialog Content Components
import { DialogTSGraphComponent }   from './map-components/dialog-content/dialog-TSGraph/dialog-TSGraph.component';
import { DialogTextComponent }      from './map-components/dialog-content/dialog-text/dialog-text.component';
import { DialogTSTableComponent }   from './map-components/dialog-content/dialog-tstable/dialog-tstable.component';
import { DialogDocComponent }       from './map-components/dialog-content/dialog-doc/dialog-doc.component';
import { DialogDataTableComponent } from './map-components/dialog-content/dialog-data-table/dialog-data-table.component';
// Map Layer Components
import { MapLayerComponent }        from './map-components/map-layer-control/map-layer.component';
import { MapLayerDirective }        from './map-components/map-layer-control/map-layer.directive';
// Map Sidepanel Components
import { SidePanelInfoComponent }   from './map-components/sidepanel-info/sidepanel-info.component';
import { SidePanelInfoDirective }   from './map-components/sidepanel-info/sidepanel-info.directive';
// Map Error Page Component
import { MapErrorComponent }        from './map-components/map-error/map-error.component';
import { AnimationToolsComponent }  from './map-components/animation-tools/animation-tools.component';
// Not Found
import { NotFoundComponent }        from './not-found/not-found.component';
import { ContentPageComponent }     from './content-page/content-page.component';
// Side Panel Legend Symbols
import { LegendSymbolsComponent }   from './map-components/legend-symbols/legend-symbols.component';
import { LegendSymbolsDirective }   from './map-components/legend-symbols/legend-symbols.directive';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';
// Full app service
import { AppService }               from './app.service';
// Sanitizing URL's safely
import { SafePipe }                 from './map-components/dialog-content/safe.pipe';
// Mat Table Cell Justification
import { JustificationPipe }        from './map-components/dialog-content/justification.pipe';

import * as Showdown                from 'showdown';
import { DialogPropertiesComponent } from './map-components/dialog-content/dialog-properties/dialog-properties.component';

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
    MatTableModule,
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
  declarations: [
    AnimationToolsComponent,
    AppComponent,
    BackgroundLayerComponent,
    ContentPageComponent,
    LegendSymbolsComponent,
    MapComponent,
    MapErrorComponent,
    MapLayerComponent,
    NavBarComponent,
    NotFoundComponent,
    SidePanelInfoComponent,
    TabComponent,

    BackgroundLayerDirective,
    LegendSymbolsDirective,
    MapLayerDirective,
    NavDirective,
    TabDirective,
    SidePanelInfoDirective,

    DialogTSGraphComponent,
    SafePipe,
    DialogTextComponent,
    DialogTSTableComponent,
    DialogDocComponent,
    DialogDataTableComponent,
    JustificationPipe,
    DialogPropertiesComponent
  ],
  entryComponents: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  constructor() {}
}
