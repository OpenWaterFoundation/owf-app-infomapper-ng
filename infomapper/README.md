# Angular - InfoMapper App #

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.3.

**Contents** 

* [Angular Project Components](#project-components)
* [Development Server](#development-server)
* [Code Scaffolding](#code-scaffolding)
* [Build](#build)
* [Styling](#styling)
* [Running Cypress Tests](#running-cypress-tests)
* [Running Unit Tests](#running-unit-tests)
* [Running end-to-end Tests](#running-end-to-end-tests)
* [Further Help](#further-help)
* [Updating Angular](#updating-angular)


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

## 'app-config' vs 'app-config' default vs 'app-config-minimal' App Config Files ##

The InfoMapper has 3 main ways it can display data in a deployed setting. This depends
on whether the `app-config.json`, `app-config.json` default, or `app-default-minimal.json`
configuration file is present under the `assets/` folder. Note that all three of the config
files can be present, but only the highest priority config file will be used. The priority
order is, from highest to lowest:

* `app-config.json`
* `app-config.json` default
* `app-config-minimal.json`

The following folder structure describes where each file can be located for the InfoMapper:

```
src/                                Application source folders and files.
  assets/                           Assets folder for config files, images, etc.
    app/                            User provided folder that houses user configuration files.
      app-config.json               Main InfoMapper app-config that overrides the others.
    app-default/                    Persistent folder for default map configurations.
      app-config.json               Default app-config file with basic testing maps.
      app-config-minimal.json       Minimal app-config file for cloud storage & no viewable maps.
```

1. If the `app-config.json` file is provided by a developer, it will supersede both of the remaining config
files. All config folders and files under `app-config.json` will be used by the InfoMapper and its name will
be included in all absolute and relative paths. This would be used by a developer creating their own
spatial website using config files they've supplied themselves for testing and eventual deployment.
2. If the `app-config.json` is *not* provided by the user, the default InfoMapper application will take over,
using the `app-config.json` default app config file instead. This config file is always in the repository in
case a user-created `app-config.json` file is not present. It contains a basic InfoMapper experience meant
to show examples of what it can do, and is mainly used with testing.
3. Similarly to the `app-config.json` default file, the `app-config-minimal.json` file - and last of the app
config files - is always present in the InfoMapper. It's purpose is to provide as small an
InfoMapper package as possible for deployment to cloud storage or similar technologies where disk space
matters. It will display the most bare-bones default InfoMapper app possible when deployed, with no actual
maps or data. Its main use is to let a user/developer know that if they are here, there is a problem,
and provides links to InfoMapper documentation and other forms of help.

## Currently Installed `npm` Packages ##

This section contains the currently installed `npm` packages, what they do, and what
version they are at. A package will be flagged under its name if its purpose is unknown,
so that the appropriate action can be done, such as figuring out what it's doing, or
removing the package.

The reason this section was created (and why it will be created for any Angular project
in the future), is because as more and more third-party libraries are relied on for a
project, the higher the chances for upgrade issues, security vulnerabilities, code
abandonment, etc. This way the packages can be viewed and scrutinized at any time, and
more thought and care can go into installing them for project use.

> NOTE: The following table should be directly compared with the
[AppDev `npm` packages table](https://github.com/OpenWaterFoundation/owf-app-dev-ng/blob/main/ng-workspace/README.md#currently-installed-npm-packages).
This is an easier way to visually see what packages each one is using, since the
InfoMapper depends on the common library. Both tables will probably be close to identical
until a method is discovered that allows the InfoMapper to not have every installed
AppDev package.

This table contains the following:

* **Package Name** - The name of the installed `npm` package. Will contain **POSSIBLE DELETION**
if the package might be able to be removed, but more information is needed. Will contain
**DELETION RECOMMENDED** if the package is a known issue, and should be removed.
* **Description** - A description of the package and what it does for the project.
* **Angular Installed** - Whether Angular installed the package automatically. These will
need to be updated only when updating Angular using `npx`.
* **Version** - The current version the installed package.

| **Package Name**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | **Description** | **Angular Installed** | **Version** |
| ---- | ---- | ---- | ---- |
| **@angular-devkit/build-angular** | This package contains Architect builders used to build and test Angular applications and libraries. | Yes | `13.2.1` |
| **@angular-devkit/core** | Shared utilities for the Angular DevKit. | Yes | `13.2.1` |
| **@angular/animations** | Provides the illusion of motion: HTML elements that change styling over time. | Yes | `13.2.0` |
| **@angular/cdk** | The Angular Component Devkit. Is used with `@angular/material`. | Yes | `13.1.3` |
| **@angular/cli** | The Command Line Interface tool for Angular. | Yes | `13.2.1` |
| **@angular/common** | Angular common package. | Yes | `13.2.0` |
| **@angular/compiler-cli** | Compiler for the Angular CLI. | Yes | `13.2.0` |
| **@angular/compiler** | The Angular compiler library. | Yes | `13.2.0` |
| **@angular/core** | The Angular core framework. | Yes | `13.2.0` |
| **@angular/elements** | A library for using Angular Components as Custom Elements. | Yes | `13.2.0` |
| **@angular/forms** | Directives & services for creating forms. | Yes | `13.2.0` |
| **@angular/language-service** | Language services. | Yes | `13.2.0` |
| **@angular/material** | Material Design components for Angular. | Yes | `13.1.3` |
| **@angular/platform-browser-dynamic** | Library for using Angular in a web browser with JIT compilation. | Yes | `13.2.0` |
| **@angular/platform-browser** | Library for using Angular in a web browser. | Yes | `13.2.0` |
| **@angular/router** | The Angular routing library. | Yes | `13.2.0` |
| **@OpenWaterFoundation/common** | The OWF-created GitHub package, created with npm and ng-packagr. Contains commonly used Angular components, services, and util classes or spatial data. |  | `0.7.0` |
| **@turf/bbox** | Takes a set of features, calculates the bbox of all input features, and returns a bounding box. Used by the Data Table Dialog for positioning the map view when zooming to a feature. |  | `6.3.0` |
| **@turf/boolean-point-in-polygon** | Takes a Point and a Polygon or MultiPolygon and determines if the point resides inside the polygon. The polygon can be convex or concave. The function accounts for holes. Used by the Data Table Dialog for determining whether a given address is in a polygon. |  | `6.3.0` |
| **@types/d3** | Type definitions for the D3 standard bundle. (`d3`) |  | `6.2.0` |
| **@types/file-saver** | Type definitions for FileSaver.js. (`file-saver`) |  | `2.0.1` |
| **@types/jasmine** | Type definitions for `jasmine`. | Yes | `3.6.2` |
| **@types/jasminewd2** | Type definitions for `jasminewd2` | Yes | `2.0.8` |
| **@types/jquery** | Type definitions for `jquery`. |  | `3.5.13` |
| **@types/leaflet** | Type definitions for `leaflet`. |  | `1.7.0` |
| **@types/node** | Type definitions for `node`. | Yes | `12.19.13` |
| **@types/papaparse** | Type definitions for `papaparse`. |  | `5.2.4` |
| **@types/select2** | Type definitions for `select2`. |  | `4.0.54` |
| **@types/showdown** | Type definitions for `showdown`. |  | `1.9.3` |
| **bootstrap**<br>**POSSIBLE DELETION** | Front-end framework. |  | `5.1.3` |
| **clusterize.js**<br>**POSSIBLE DELETION** | Tiny vanilla JS plugin to display large data sets easily. Possibly used by the Gapminder Component. |  | `0.18.1` |
| **cypress** | Front-end testing tool. Used for performing end-to-end tests |  | `9.4.1` |
| **d3** | JavaScript library for visualizing data using web standards. Used by the Gapminder Component to display the Trendalyzer (previously known as Gapminder) visualization software. |  | `6.3.1` |
| **date-fns** | Manipulates the JavaScript dates object in a browser & Node.js. Used in the MapUtil & DateTimeUtil classes and Dialog Service. |  | `2.28.0` |
| **file-saver** | Saves a CSV file on a local computer. Used by the Data Table, Data Table Light, Text, and TSTable Dialogs to display a `Download` button. |  | `2.0.5` |
| **font-awesome** | Font Awesome is a full suite of 675 pictographic icons for easy scalable vector graphics on websites. Used by ?? |  | `4.7.0` |
| **geoblaze** | GeoBlaze is a geospatial raster processing engine written purely in javascript. Powered by geotiffjs, it provides tools to analyze GeoTIFFs. Used by the Map Component and Map Util class. |  | `0.3.0` |
| **georaster-layer-for-leaflet** | Display GeoTIFFs and other types of rasters. Used by the Map Component and Map Util class for displaying single- and multi-band rasters. |  | `0.6.8` |
| **georaster** | Used by `georaster-layer-for-leaflet` for creating raster layers. |  | `1.5.6` |
| **jasmine-core** | Jasmine is a Behavior Driven Development testing framework for JavaScript. | Yes | `3.6.0` |
| **jasmine-spec-reporter** | Real time console spec reporter for jasmine testing framework. | Yes | `5.0.2` |
| **jquery** | A feature-rich JavaScript library. Used by the Gapminder Component, DataClass, MapLayerItem, MapLayerManager & Properties classes. |  | `3.6.0` |
| **karma-chrome-launcher** | Launcher for Google Chrome, Google Chrome Canary and Google Chromium. | Yes | `3.1.0` |
| **karma-coverage-istanbul-reporter** | A karma reporter that uses the latest istanbul 1.x APIs (with full sourcemap support) to report coverage. | Yes | `3.0.3` |
| **karma-jasmine-html-reporter** | Reporter that dynamically shows tests results at debug.html page. | Yes | `1.5.4` |
| **karma-jasmine** | Adapter for the Jasmine testing framework. | Yes | `4.0.1` |
| **karma** | A simple tool that allows you to execute JavaScript code in multiple real browsers. | Yes | `6.3.11` |
| **leaflet-mouse-position** | A mouse position Leaflet control that displays geographic coordinates of the mouse pointer as it is moved about the map. Used in the Map Component via the `package.json` scripts array. |  | `1.2.0` |
| **leaflet-sidebar-v2** | A responsive sidebar for Leaflet. Used in the Map Component. |  | `3.2.3` |
| **leaflet-svg-shape-marker** | Supplies additional SVG marker types for Leaflet, such as triangle, diamond, and square. Used by the Map & Data Table Components, and Map Util class. |  | `1.3.0` |
| **leaflet.zoomhome** | Provides a zoom control with a "Home" button to reset the view on Leaflet. Used by the Map Component. |  | `1.0.0` |
| **leaflet** | JavaScript library for mobile-friendly interactive maps. used by the Map & Data Table Components, and the Map Util class. |  | `1.7.1` |
| **material-design-icons** | Material design icons are the official icon set from Google that are designed under the material design guidelines. Used by the Data Table & Map Components. (`<mat-icon>`) **This might be redundant with the use of font awesome.** |  | `3.0.1` |
| **ng-select2** | An Angular 13 wrapped component of jquery `select2` that supports two-way data-binding. Used by the Gapminder Component. |  | `1.4.1` |
| **ng-table-virtual-scroll** | An Angular Directive, which allows the use of virtual scrolling in mat-table. Used by the Data Table, Data Table Light, and TSTable Dialog Components. |  | `1.4.5` |
| **ngx-gallery-9**<br>**DELETION RECOMMENDED** | Angular image gallery plugin Based on NgxGallery, compatible with Angular 9+. Used by the Gallery Dialog. Might be abandoned. |  | `1.0.6` |
| **ngx-showdown** | An Angular integration for Showdown. (`showdown`) |  | `6.0.0` |
| **papaparse** | In-browser CSV (or delimited text) parser for JavaScript. Used by the Map, Gallery Dialog, Gapminder Dialog, & TSGraph Dialog Components, and the Map Util & Data Class classes. |  | `5.3.0` |
| **plotly.js** | A JavaScript visualization library for charts, stats, 3D graphs, SVG and tile maps, etc. Used by the Heatmap & TSGraph Dialog Components. |  | `1.58.4` |
| **protractor** | Protractor is an end-to-end test framework for Angular applications. It has been deprecated since Angular 13. | Yes | `7.0.0` |
| **rxjs** | A library for reactive programming using Observables to compose asynchronous or callback-based code. | Yes | `7.5.2` |
| **select2** | A jQuery-based replacement for select boxes. Used by `ng-select2` for the Gapminder Dialog Component. |  | `4.0.13` |
| **showdown** | A JavaScript Markdown to HTML converter for the browser or Node. Used in multiple Dialog Components and the Home & Content Page Components. |  | `1.9.1` |
| **ts-node** | TypeScript execution and REPL for node.js, with source map and native ESM support. | Yes | `7.0.1` |
| **tslib** | This is a runtime library for TypeScript that contains all of the TypeScript helper functions. | Yes | `2.3.1` |
| **typescript** | TypeScript is a language for application-scale JavaScript.  | Yes | `4.5.5` |
| **webpack-bundle-analyzer** | Visualizes the size of webpack output files with an interactive zoom capable treemap. |  | `4.5.0` |
| **zone.js** | Implements Zones for JavaScript, inspired by Dart. | Yes | `0.11.4` |

## Development server ##

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically
reload if you change any of the source files.

## Code scaffolding ##

Run `ng generate component component-name` to generate a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build ##

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
Use the `--configuration` flag for a production build.

The following command is currently used to build this project:

`ng build --configuration production --aot=true --baseHref=. --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false`

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

## Running Cypress Tests ##

The InfoMapper uses Cypress for front end testing. It has also been added as an
npm script in the infomapper `package.json` file under the `scripts` property.

### Opening Cypress Test Runner ###

Open the Cypress Test Runner by residing in the InfoMapper `infomapper`
top level folder and running the command:

```
npm run cypress:open
```

The Test Runner is a application GUI that acts as a home base for the Cypress
tests. Here all tests can be viewed together, or clicked on to view separately.
All tests can be run by clicking on the `Run x integration specs`, where x is the
amount of tests created.

## Running unit tests ##

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests ##

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help ##

To get more help on the Angular CLI use `ng help` or go check out the
[Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Updating Node ##

Node should be kept up to date so new features & security updates can be used.
Obviously, updating Node is not just for the use of the InfoMapper; this will effect
all other software that utilizes Node on the system, so keep that in mind. The following
steps show how to do this:

* Go to the [Node.js](https://nodejs.org/en/) website and click on the Latest Stable
Release (LTS).
* Follow the install wizard instructions, and Node will overwrite the
old version and replace it with the new version.

## Updating npm ##

npm comes automatically installed with Node.js, but is updated far more often than
Node. Because of this, both the developers at Node and npm recommend installing
npm separately so it can be updated as needed. More information can be found
[here](https://docs.npmjs.com/try-the-latest-stable-version-of-npm). Updating npm
on Windows can be as easy as:

```
%ProgramFiles%/nodejs/npm install -g npm
```

Then try going to the project top level directory and running `npm -v` to check
the version installed. `which npm` could also help describe which npm is being used.

## Updating Angular ##

Ever since the InfoMapper and SNODAS started relying on the @OpenWaterFoundation/common
library, updating the version of Angular has had a few steps added on to it. Updating
from Angular 11 to 13 had it's share of growing pains and issues. The following
will help pave the way to a quicker update in the future:

* **Do not** update the Angular app (InfoMapper, SNODAS) version first. The common library
dependencies need to be updated first, so there are no conflicts when updating
the app's dependencies.
  * For example, updating the InfoMapper from Angular 11 to 12 will be in conflict with
  the common library. The library expect Angular 11, but 12 is now being used. Updating
  the library to the desired version, testing it, and resolving any issues first, allows
  the new library (package) version to be created and used by the app. The app can
  then be updated and its own issues dealt with, without having to worry about the
  library.
* After the library has been updated, a new version will need to be created via npm
and uploaded as a Github Package. Instructions can be found on the
[Common package page](https://github.com/OpenWaterFoundation/owf-app-dev-ng/packages/655009).

### Troubleshooting ###

Sometimes updating to Angular introduces bugs and other issues. With newer versions
of Angular, a quick Google search will usually reveal a Github issue that's
already been created by someone else having the same issue. This section will
cover issues and roadblocks found while developing the InfoMapper. Note that since
the InfoMapper uses much of the Common library, some of the troubleshooting tips
might also be found in its own section as well.

#### Jasmine "expect" functions don't behave as expected  ####

When creating an Angular project using the CLI, testing `.spec.ts` files are created
for each component when using the command `ng generate component`. They contain
a very basic test determining if the component was created by using the Jasmine
functions

```typescript
expect(component).toBeTruthy();
```

These tests fail when run however, and the VSCode intellisense claims that the toBeTruthy
function does not exist on type 'Assertion'. This is a bug when the **Cypress** package
for end to end testing is installed in the project, causing type conflicts. The tests
will still technically run, but the following fix provides peace of mind for the developer.
More information about the issue can be found
[here](https://github.com/cypress-io/cypress/issues/7552).

The Cypress `.spec.ts` files introduce this conflict with Jasmine. To resolve, open the
project's main `tsconfig.json` file and add the following property and value. If the
**exclude** property already exists, just add the value.

```
"exclude": [
    "cypress"
  ],
```

This excludes the cypress folder and its test files from the ts compilation, and
the issue is resolved.