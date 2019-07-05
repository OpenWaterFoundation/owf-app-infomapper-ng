# Navigation Bar Component

This component creates the navigation bar at the top of the page.

In this folder:

```
├── nav-bar
|   ├── nav-dropdown/ .............. Folder for navigation dropdown components.
|   ├── nav-link/ .................. Folder for navigation links on nav bar.
|   ├── nav.directive.ts ........... Directive for navigation bar that acts as anchor for dynamically added nav bar components.
|   ├── nav-bar.component.css ...... Stylesheet for navigation bar component.
|   ├── nav-bar.component.html ..... HTML template for navigation bar component.
|   ├── nav-bar.component.ts ....... Typescript file for navigation bar component.
|   ├── nav-bar.service.ts ......... Navigation bar service file.
|   ├── nav-item.ts ................ Nav item to contain data for the dynamically added navigation link components.
|   ├── README.md .................. This file.
```



## Overview ## 

The navigation bar is built using [bootstrap](<https://getbootstrap.com/>).  The navigation bar is located at the top of the page, and contains a dynamically generated list of links and dropdown options that route to different sections of the site.  The navigation options are loaded from a JSON configuration file  The structure of the configuration file allows for each menu option to be either a direct link or dropdown menu that contains related internal and external links.  This makes it easier for users in the future to easily configure the dropdown menus. 

The components are added dynamically to the HTML template using the method that can be followed on the [Angular Documentation Pages](<https://angular.io/guide/dynamic-component-loader>). `<ng-template nav-host><ng-template>` acts as the placeholder for where these components will be placed in the template file `nav-bar.component.html`. 

## Component Dependencies

This navigation bar component requires the following sub-components and services:

* [TabComponent](tab/README.md)

### nav-bar.service.ts

This service component provides data from the configuration file through its exported class, navService.  It saves the configuration data into a variable and returns this variable to nav-bar.component.ts through the getNavigation() method:

```
export class navService {

  //saves config data in variable
  saveConfiguration (tsfile) {
    for (var i = 0; i < tsfile.mainMenu.length; i++){

      if (tsfile.mainMenu[i].menus == undefined){
        //This component is a static link
        adArray.push(new navItem(navDropdownComponent, {name: tsfile.mainMenu[i].name}));
      }
      else {
        //This component is a dropdown menu
        adArray.push(new navItem(navDropdownComponent, {name: tsfile.mainMenu[i].name, menu: tsfile.mainMenu[i].menus}));
      }
    }
  }

  //returns variable with config data
  getNavigation() {
    return adArray;
  }
}
```

The parameter tsfile is passed to the function `saveConfiguration()` by the observable function `getMyJSONData()` inside nav-bar.component.ts, which waits until the file has been read before passing the data as tsfile.
