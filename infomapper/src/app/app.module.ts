import { BrowserModule,
          Title }                   from '@angular/platform-browser';
import { NgModule,
          Injector, 
          DoBootstrap,
          APP_INITIALIZER}          from '@angular/core';
import { CommonModule  }            from '@angular/common';
import { HttpClient,
          HttpClientModule }        from '@angular/common/http';
// Used for creating the Map Component as a custom element to be embedded in another
// website.
import { createCustomElement }      from '@angular/elements';
import { FlexLayoutModule }         from '@angular/flex-layout';
import { FormsModule,
          ReactiveFormsModule }     from '@angular/forms';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';

import { FontAwesomeModule }        from '@fortawesome/angular-fontawesome';

import { Observable }               from 'rxjs';

import { LoggerModule,
          NgxLoggerLevel }          from 'ngx-logger';
// Non-ivy created third party libraries.
import { NgxGalleryModule }         from 'ngx-gallery-9';
import { ShowdownModule }           from 'ngx-showdown';
// The MapComponent from the OWF Common package (Angular Library).
import { MapModule }                from '@OpenWaterFoundation/common/leaflet';
// Angular Material module.
import { MaterialModule }           from './material.module';
import { CheckElementPipe }         from './check-element.pipe';
// Top level App Component and Routing.
import { AppComponent }             from './app.component';
import { AppRoutingModule }         from './app-routing.module';
// NavBar Component, and Main Menu container.
import { NavBarComponent }          from './nav-bar/nav-bar.component';
// Main Menu main tab components, dynamically created in the NavBarComponent.
import { TabComponent }             from './nav-bar/tab/tab.component';
// 
import { SideNavComponent }         from './nav-bar/side-nav/side-nav.component';
// Not Found Component. 
import { NotFoundComponent }        from './not-found/not-found.component';
// Content Page Component, for markdown pages.
import { ContentPageComponent }     from './content-page/content-page.component';
// Full app service
import { AppService }               from './services/app.service';

// Showdown, to convert markdown to HTML.
import * as Showdown                from 'showdown';
import { GlobalSearchComponent }    from './global-search/global-search.component';


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

/**
 * Retrieves the `app-config.json` file before the application loads, so information
 * can be ready to be used before the rest of the app starts.
 * @param appService An instance of the top-level AppService.
 * @returns An observable.
 */
function appInit(appService: AppService): () => Observable<any> {
  return () => appService.loadConfigFiles();
}


@NgModule({
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,

    LoggerModule.forRoot({
      level: NgxLoggerLevel.TRACE,
      // timestampFormat: "medium",
      colorScheme: [
        'mediumorchid',
        'teal',
        'royalblue',
        'teal',
        'orange',
        'red',
        'red'
      ]
    }),

    MapModule,
    MaterialModule,
    NgxGalleryModule,
    ReactiveFormsModule,
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
    })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInit,
      multi: true,
      deps: [AppService, HttpClient]
    },
    AppService,
    Title
  ],
  declarations: [
    AppComponent,
    ContentPageComponent,
    NavBarComponent,
    NotFoundComponent,
    SideNavComponent,
    TabComponent,
    CheckElementPipe,
    GlobalSearchComponent,
  ],
  bootstrap: [
      AppComponent
  ]
})

export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {
  //   const webComponent = createCustomElement(MapErrorComponent, {injector});
  //   customElements.define('map-error', webComponent);
  }

  ngDoBootstrap() {}
}
