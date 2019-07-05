# Tab Component #

The tab component is responsible for dynamically adding various types of tabs to the navigation bar. There are several variations of different tabs that can be created via the configuration file, currently those options are: 

1. A tab with a dropdown option with additional links to maps, external links, or generic-pages.
2. A tab that links to a [generic page](../../generic-page/README.md).
3. A tab that links to a map.

```
├── app
|   ├── README.md ..................... This file.
|   ├── tab.component.css ............. The stylesheet for the tabs.
|   ├── tab.component.html ............ Creates a template with logic to handle different types of tabs.
|   ├── tab.component.ts .............. Creates the component for the tab.
|   ├── tab.directive.ts .............. A directive for the tab component.
```

![tab-component](../../../../../doc/images/tab.png)

