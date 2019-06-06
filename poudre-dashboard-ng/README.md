# Angular - Poudre Dashboard App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.3.

* [Angular Project Components](#project-components)
* [Development Server](#development-server)
* [Code Scaffolding](#code-scaffolding)
* [Build](#build)
* [Running Unit Tests](#running-unit-tests)
* [Running end-to-end Tests](#running-end-to-end-tests)
* [Further Help](#further-help)


## Project Components

The following are various components that make up the Angular application. Some components rely on subcomponents, `MapComponent` for example has `LayerComponent`, `MapErrorComponent`, and `SidePanelInfoComponent` that make up the component as a whole. 

* [AppComponent](src/app/README.md)
  * [AboutComponent](src/app/about/README.md)
  * [HomeComponent](src/app/home/README.md)
  * [MapComponent](src/app/map-components/README.md) 
    * [LayerComponet](src/app/map-components/layer/README.md)
    * [MapErrorComponent](src/app/map-components/map-error/README.md)
    * [SidePanelInfoComponent](src/app/map-components/sidepanel-info/README.md)
  * [NavBarComponent](src/app/nav-bar/README.md)
    * **nav-dropdown/** 
      * [DropdownLinkComponent](src/app/nav-bar/nav-dropdown/nav-dropdown-link/README.md)
      * [DropdownOptionComponent](src/app/nav-bar/nav-dropdown/nav-dropdown-option/README.md)
    * [NavLinkComponent](src/app/nav-bar/nav-link/README.md)
  * [NotFoundComponent](src/app/not-found/README.md)

#### Adding an Angular Component

Using the `ng generate` command will create declarations automatically for Angular components through the following process:

The file `app/app.module.ts` must be updated to include any new components, which consists of adding an import statement for the component and adding a declaration for the class that the component exports.  

When creating a new service, the class that the service exports should be included in the providers section of `app.module.ts` instead of the declarations section.  Any components that the service depends on should be included in both the entryComponents and declarations sections.  For example, navService depends these four components: `navDropdownComponent, navLinkComponent, dropdownOptionComponent, dropdownLinkComponent`.  Thus, all four are included in entryComponents and declarations, whereas navService itself is listed as a provider:

```
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
  entryComponents: [ navDropdownComponent, navLinkComponent, dropdownOptionComponent, dropdownLinkComponent ],
  bootstrap: [AppComponent]
})
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

The following command is currently used to build this project:

`ng build --prod --aot=true --baseHref=. --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
`

For more information on each of these options, see the following documentation: [https://angular.io/cli/build](https://angular.io/cli/build).

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
