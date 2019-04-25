# PoudreDashboardNg

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.3.

* [Angular Project Components](#repository_contents)
* [Development Server](#development_server)
* [Code Scaffolding](#code_scaffolding)
* [Build](#build)
* [Running Unit Tests](#running_unit_tests)
* [Running end-to-end Tests](#running_end-to-end_tests)
* [Further Help](#further_help)


## Project Components

As of 4/25/19, the project consists of the following main Angular components.  Select a component to view its individual README description file:

* [AppComponent](src/app/README.md)
* [NavBarComponent](src/app/nav-bar/README.md)
* [HomeComponent](src/app/home/README.md)
* [AboutComponent](src/about/app/README.md)
* [MapComponent](src/app/map/README.md)

In turn, some of these components depend on smaller sub-components.

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
