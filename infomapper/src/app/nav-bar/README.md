# **Navigation Bar Component**

This component creates a dynamically generated navigation bar at the top of the page.

In this folder:

```
├── nav-bar
|   ├── tab/ ....................... Tab Component folder [See README.md within tab].
|   ├── nav-bar.component.css ...... Stylesheet for navigation bar component.
|   ├── nav-bar.component.html ..... HTML template for navigation bar component.
|   ├── nav-bar.component.ts ....... Typescript file for navigation bar component.
|   ├── nav.directive.ts ........... Creates anchor for dynamically added components.
|   └──README.md ................... This current file.
```

## Overview

The navigation bar is built using [bootstrap](<https://getbootstrap.com/>).  It is located at the top of the page, and contains a dynamically generated list of links and dropdown options that route to different sections of the site.  The navigation options are loaded from a JSON configuration file called ``maps-tabs-configuration.json``. The structure of the configuration file allows for each menu option to be either a direct link or dropdown menu that contains related internal and external links. This ultimately makes it easier for users in the future to easily configure the dropdown menus. 

Because of the variation between menu options, either a dropdown menu or direct link page, it  would be impractical to use a template with a static component structure. Instead you will need a way to load a new component for each navigation tab option without a fixed reference to a single component template  being added to the navigation bar.  To do accomplish this requires a [dynamic component loader](https://angular.io/guide/dynamic-component-loader).

The components are added dynamically to the HTML template using the method that can be followed on the [Angular Documentation Pages](<https://angular.io/guide/dynamic-component-loader>). `<ng-template nav-host><ng-template>` acts as the placeholder for where these components will be placed in the template file `nav-bar.component.html`. 

## Component Dependencies

This navigation bar component requires the following sub-components and services as well:

* [TabComponent](tab/README.md)
* [globals.ts](../globals.ts)
* [map-tab.configuration.json](../../assets/map-configuration-files/map-tab-configuration.json)

### map-tab.configuration.json

In order to add more tabs to the site, editing the ```map.tab.configuration.json``` file is needed. Currently there are two options for navigation bar. 

**Direct Link Example:**

```
	{
           "id": "Tab",
           "name": "About the Project",
           "action": "contentPage",
           "align": "right",
           "markdownFile":"about-the-project"
    },

```

**Dropdown Menu Example:**

```
       {
           "id": "Testing",
           "name": "Testing",
           "align": "left",
           "menus": [
               {
                   "name": "Line Layers",
                   "action": "displayMap",
                   "mapProject": "line_layers_2019-05-15"
               },
               {
                   "name": "Point Layers",
                   "action": "displayMap",
                   "mapProject": "point_layers_2019-05-15"
               },
               {
                    "name": "Point Layers - Refresh",
                    "action": "displayMap",
                    "mapProject": "point_layers_refresh_2019-05-22"
               },
               {
                   "name": "Polygon Layers",
                   "action": "displayMap",
                   "mapProject":"polygon_layers_2019-05-15"
               },
               {
                   "name": "Point Layers - Symbols",
                   "action": "displayMap",
                   "mapProject": "point_layers_symbols_2019-07-12"
               }
           ]
       },

```

**JSON Data overview:**

* ``id`` - ID for each tab (only for navigation bar tabs, not dropdown menu tabs).
* ``name`` - Name for tab or subsequent drop down menu tabs.
* ``align `` - data used for css for alignment.
* ``menus`` - If ```menus``` data is present, the nav-bar tap will consist of a drop down menu. Otherwise will default to a direct link page .
* ``action`` - The action denotes the template for tab generated.
  * ``displayMap``  - will display a configure a map using the file provided by the ``mapProject`` data.
  * ``contentPage`` - will display a direct link to a static page, and will prompt a markdown file from the JSON date ``markdownFile`` for the content of the site.

### nav-bar.component.html

To load the dynamic components, the ```<ng-template>``` element is used to apply the directive that was created, in this instance the directive is the ```NavDirective```. To apply the ```NavDirective```, recall the selector with the ```@Directive``` decorator named ```nav-host```.  Add ```nav-host``` to the ``<ng-template>`` without the square brackets present. This allows Angular to know where to dynamically load components.  

Located in ```nav-bar.component.html```:

``` 
<ng-template nav-host></ng-template>
```

NOTE: The `<ng-template>` element is a good choice for dynamic components because it doesn't render any additional output.

### nav-bar.component.ts

Provides the template for where the components dynamic components will be generated. This can be found within the ```@Component``` decorator as the following ```templateUrl:   './nav-bar.component.html'``` .

```
@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],
  templateUrl: './nav-bar.component.html'
})
```



Take a closer look at the methods in ``nav-bar.component.ts``. 

#### getData(path)

Observable function `getData()` inside nav-bar.component.ts, which waits until the file has been read before passing the data as tsfile.

```
  getData(path_to_json): Observable<any> {
    return this.http.get(path_to_json)
  }
```

#### ngOnInit()

 Loads data from configuration file and calls loadComponent when tsfile is defined.

```
  ngOnInit() {
    let configurationFile = this.globals.configurationFile;
    this.getData(configurationFile).subscribe (
      tsfile => {
        this.title = tsfile.title;
        this.loadComponent(tsfile);
      }
    );
  }
```

#### loadComponent()

```loadComponent()``` is doing a lot here. Take your time to try to understand what is promptly occurring. It creates new button (tab) component within the navigation bar for each map specified in configuration file. 

```
  loadComponent(tsfile) {
 
    for (var i = 0; i < tsfile.mainMenu.length; i++) {      
      let viewContainerRef = this.navHost.viewContainerRef;
      let componentRef = viewContainerRef.createComponent(TabComponent);
      (<TabComponent>componentRef.instance).data = tsfile.mainMenu[i];
    }
  }

```

The ```TabComponent``` specifies the type of component to load and any data to bind
to the component.

After `loadComponent()` selects the given type of tab needed, it uses the viewContainerRef
to create an instance of each component.

Then you are targeting the ``viewContainerRef`` that exists on this specific instance of the component. How do you know it's this specific instance? Because its referring to ``navHost`` and ``navhost`` is the directive you set up earlier to tell Angular where to insert dynamic components.

As you may recall, the ``NavDirective`` injects a ``ViewContainerRef`` into its constructor. This is how the directive accesses the element that you want to use to host the dynamic component.

To add the component to the template, you call ``createComponent()`` on ``ViewContainerRef``.

NOTE: The ``createComponent()`` method returns a reference to the loaded component. 

Use that referent to interact with the component by assigning to its properties or calling its methods.

Specifically here:

``` 
 (<TabComponent>componentRef.instance).data = tsfile.mainMenu[i];
```

#### pageSelect(page: String)

```
  pageSelect(page: String) :void {
    this.active = page
  }
```

### Next Steps

In order to complete this process please refer to the Tab Component and review the README.md file, more additional steps are needed to complete this process.  [Click to Continue](tab/README.md)