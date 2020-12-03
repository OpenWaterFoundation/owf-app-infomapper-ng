# App Component #

This folder contains the following:

```
├── app
|   ├── content-page/............... Component for creating content pages.
|   ├── map-components/ ............ Component with subcomponents for the map page.
|   ├── nav-bar/ ................... Component for the navigation bar at top of page.
|   ├── not-found/ ................. Component for when page is not found.
|   ├── app-routing.module.ts ...... Module that handles page routing.
|   ├── app.component.css .......... Stylesheet for the application.
|   ├── app.component.html ......... Main application component.
|   ├── app.module.ts .............. Main module for component. Links to other components. 
|   ├── globals.ts ................. Contains global variables for use across application
|   ├── README.md .................. This file.
```

This folder contains all the components that make up the Angular application. The top level files are for the main app component. This is the foundation of the application as a whole. 

* [`app.module.ts`](./app.module.ts) contains references to all other components within the application. This file must be updated when adding new components. If using `ng generate component [component-name]` the Angular CLI will handle this step automatically. See [Adding an Angular Component](../../README.md/#adding-an-angular-component). 
* The template [`app.component.html`](./app.component.html) for this component is quite simple. It implements the [navigation bar component](./nav-bar/README.md) that contains the nav bar that will be displayed at the top of every page. This component also contains a link to [router outlet](./app-routing.module.ts) a file that is responsible for directing the user to the desired page or component based on the URL passed by the browser.

# Minimal app-config.json #

{
  "title": "InfoMapper Default",
  "homePage": "/content-pages/home.md",
  "favicon": "/img/coloradoDNR.ico",
  "version": "1.0.0 (2020-12-01)",
  "mainMenu": [
    {
      "id": "MapsExample",
      "name": "Maps",
      "align": "left",
      "tooltip": "Example of a Main Menu Tab",
      "menus": [
        {
          "name": "Map Example 1",
          "enabled": "false",
          "mapProject": "data-maps/map-configuration-files/line-geometry-maps.json",
          "tooltip": "Display Map Example 1"
        },
        {
          "name": "Map Example 2",
          "enabled": "false",
          "mapProject": "data-maps/map-configuration-files/polygon-geometry-maps.json",
          "tooltip": "Display Map Example 2"
        },
        {
          "name": "Map Example 3",
          "enabled": "false",
          "mapProject": "data-maps/map-configuration-files/point-geometry-maps.json",
          "tooltip": "Display Map Example 3"
        }
      ]
    },
    {
      "name": "Resources",
      "align": "left",
      "id": "ResourcesExample",
      "tooltip": "Show default resources",
      "menus": [
        {
          "name": "InfoMapper User Documentation",
          "action": "externalLink",
          "url": "http://software.openwaterfoundation.org/infomapper/latest/doc-user/",
          "tooltip": "Follow link to InfoMapper User Documentation"
        }
      ]
    }
  ]
}