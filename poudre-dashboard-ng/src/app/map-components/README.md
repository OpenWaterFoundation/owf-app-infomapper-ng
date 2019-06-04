# Map Component

This component contains the files, and sub components that this component depends on for creating the map page within the site, accessible through the navigation bar. 

In this folder:

```
├── map-components
|   ├── animation-tools/ ............. Animation tools component (under development)
|   ├── layer/ ....................... Layer component for the layer controls in the sidebar
|   ├── map-error/ ................... Map error page displayed when map configuration file is not propertly read.
|   ├── sidepanel-info/ .............. Sidepanel info component for the info tab in the sidebar.
|   ├── map.components.css ........... Stylesheet for map component.
|   ├── map.component.html ........... HTML template for map component.
|   ├── map.component.spec.ts ........ Testing file for map component.
|   ├── map.component.ts ............. Typescript file for map component.
|   ├── map.service.ts ............... A service file with helper functions for used in the map component.
|   ├── README.md .................... This file.
```



This component depends on the following components:

* ~~[AnimationToolsComponent](animation-tools/README.md)~~ - Still under development.
* [LayerComponent](layer/README.md) - Creates the layer controls and descriptions in the sidebar.
* [MapErrorComponent](map-error/README.md) - Creates the page that loads when map page cannot be loaded properly.
* [SidepanelInfoComponent](sidepanel-info/README.md) - Creates the info tab in the sidepanel.



## Sidebar

The sidebar is based on an adapted version of the Turbo87 leaflet-sidebar, available on Github at [https://github.com/Turbo87/leaflet-sidebar](https://github.com/Turbo87/leaflet-sidebar).  The relevant code is saved in the assets/leaflet-sidebar folder.  This sidebar has the advantage of a retracting options to provide a cleaner interface and is mobile-friendly.

Moving forward, the sidebar should allow a user to toggle individual map data layers and settings.
