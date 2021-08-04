import { BrowserModule,
          Title }                    from '@angular/platform-browser';
import { NgModule }                  from '@angular/core';
import { CommonModule,
          HashLocationStrategy,
          LocationStrategy  }        from '@angular/common';
import { HttpClientModule }          from '@angular/common/http';

// Bootstrap & Angular Material
import { AlertModule }               from 'ngx-bootstrap';
import { BrowserAnimationsModule }   from '@angular/platform-browser/animations';
import { DragDropModule }            from '@angular/cdk/drag-drop';
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
import { ScrollingModule }           from '@angular/cdk/scrolling';

// 
import { NgxGalleryModule }          from 'ngx-gallery-9';
import { ShowdownModule }            from 'ngx-showdown';
// Top level App Component and Routing.
import { AppComponent }              from './app.component';
import { AppRoutingModule }          from './app-routing.module';
// NavBar Component, and Main Menu container.
import { NavBarComponent }           from './nav-bar/nav-bar.component';
import { NavDirective }              from './nav-bar/nav.directive';
// Tab (Main Menu) components, dynamically created in the NavBarComponent.
import { TabComponent }              from './nav-bar/tab/tab.component';
import { TabDirective }              from './nav-bar/tab/tab.directive';
// Services specifically for map-related information.
import { MapService }                from './map-components/map.service';
// Map Error Page Component.
import { MapErrorComponent }         from './map-components/map-error/map-error.component';
// Not Found Component. 
import { NotFoundComponent }         from './not-found/not-found.component';
// Content Page Component, for markdown pages.
import { ContentPageComponent }      from './content-page/content-page.component';
// Full app service
import { AppService }                from './app.service';

// Showdown, to convert markdown to HTML.
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

@NgModule({
  imports: [
    AlertModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
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
    ShowdownModule.forRoot({
      emoji: true,
      flavor: 'github',
      extensions: [bindings],
      noHeaderId: true,
      openLinksInNewWindow: true,
      parseImgDimensions: true,
      // This must exist in the config object and be set to false to work.
      simpleLineBreaks: false,
      strikethrough: true,
      tables: true
    }),
  ],
  providers: [
    AppService,
    MapService,
    Title,
    {provide : LocationStrategy , useClass: HashLocationStrategy}
  ],
  declarations: [
    AppComponent,
    ContentPageComponent,
    MapErrorComponent,
    NavBarComponent,
    NotFoundComponent,
    TabComponent,
    
    NavDirective,
    TabDirective
  ],
  entryComponents: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  constructor() {}
}
