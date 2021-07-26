# Angular - InfoMapper App #

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.3.

**Contents** 

* [Angular Project Components](#project-components)
* [Development Server](#development-server)
* [Code Scaffolding](#code-scaffolding)
* [Build](#build)
* [Styling](#styling)
* [Running Unit Tests](#running-unit-tests)
* [Running end-to-end Tests](#running-end-to-end-tests)
* [Further Help](#further-help)


## Project Components

The following are various components that make up the Angular application. Some components rely on subcomponents.

* [AppComponent](src/app/README.md)
  * [ContentPageComponent](src/app/content-page/README.md)
  * [MapComponent](src/app/map-components/README.md) 
    * [BackgroundLayerComponent](src/app/map-components/background-layer-control/README.md)
    * [MapErrorComponent](src/app/map-components/map-error/README.md)
    * [SidePanelInfoComponent](src/app/map-components/sidepanel-info/README.md)
  * [NavBarComponent](src/app/nav-bar/README.md)
    * [TabComponent](src/app/nav-bar/tab/README.md)
  * [NotFoundComponent](src/app/not-found/README.md)

#### Adding an Angular Component

Using the `ng generate` command will create declarations automatically for Angular components through the following process:

The file `app/app.module.ts` must be updated to include any new components, which consists of adding an import statement for the component and adding a declaration for the class that the component exports.  

When creating a new service, the class that the service exports should be included in the providers section of `app.module.ts` instead of the declarations section.  Any components that the service depends on should be included in both the entryComponents and declarations sections.  For example, navService depends these four components: `navDropdownComponent, navLinkComponent, dropdownOptionComponent, dropdownLinkComponent`.  Thus, all four are included in entryComponents and declarations, whereas navService itself is listed as a provider:

```typescript
@NgModule({
  imports: [HttpClientModule,BrowserModule,AppRoutingModule],
  providers: [navService],
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
    DropDownDirective
  ],
  entryComponents: [],
  bootstrap: [AppComponent]
})
```

## 'app' vs 'app-default' vs 'app-default-minimal' App Config Files ##

The InfoMapper has 3 main ways it can display data in a deployed setting. This is dependent on
whether the `app.json`, `app-default.json`, or `app-default-minimal.json` configuration file is
present under the `assets/` folder.

1. If the `app.json` file is provided by a developer, it will supersede both of the remaining config
files. All config folders and files under `app.json` will be used by the InfoMapper and its name will
be included in all absolute and relative paths. This would be used by a developer creating their own
spatial website using config files they've supplied themselves for testing and eventual deployment.
2. If the `app.json` is *not* provided by the user, the default InfoMapper application will take over,
using the `app-default.json` app config file instead. This config file is always in the repository in
case a user-created `app.json` file is not present. It contains a basic InfoMapper experience meant
to show examples of what it can do, and is mainly used with testing.
3. Similarly to the `app-default.json` file, the `app-default-minimal.json` file - and last of the app
config files - is always present in the InfoMapper. It's purpose is to provide as small an
InfoMapper package as possible for deployment to cloud storage or similar technologies where disk space
matters. It will display the most bare-bones default InfoMapper app possible when deployed, with no actual
maps or data. Its main use is to let a user/developer know that if they are here, there is a problem,
and provides links to InfoMapper documentation and other forms of help.

## Development server ##

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically
reload if you change any of the source files.

## Code scaffolding ##

Run `ng generate component component-name` to generate a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build ##

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
Use the `--prod` flag for a production build.

The following command is currently used to build this project:

`ng build --prod --aot=true --baseHref=. --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false`

For more information on each of these options, see the following documentation:
[https://angular.io/cli/build](https://angular.io/cli/build).

## Styling ##

The InfoMapper contains a top-level `styles.css` file that can override fonts, colors, and any other
desired styling changes that affect every tag, component, etc. in the application that isn't being used
by Angular Material. For now, this stylesheet file is being used to import styling for necessary
third-party packages and overriding Angular Material component sizing for Dialogs.

Angular Material has been used in the InfoMapper at an increased rate throughout the development process,
which uses its own styling for fonts. It can be overridden following the
[Typography guide](https://material.angular.io/guide/typography) on their website.

The styling for Showdown can be found in the `showdown-default.css` file located in `assets/css/`. This
file contains the styling for anything using Showdown to display Markdown i.e. Content Page or Map
Dialog.

## Running unit tests ##

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests ##

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help ##

To get more help on the Angular CLI use `ng help` or go check out the
[Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
