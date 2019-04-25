# nav-bar.component.ts

The Nav bar is present at the top of every page, and contains a dynamically generated list of links and dropdown options that route to different sections of the site.  The navigation options are loaded from a JSON configuration file in the assets/menuConfig folder, called `testConfig1.json`.  The structure of the configuration file allows for each menu option to be either a direct link or dropdown menu that contains related internal and external links.  This structure allows for future changes to the menu options by simply altering the JSON configuration file.

Nav-bar.component.ts uses Bootstrap html elements to create the template for the navigation menu.  Within that template, Angular uses the selector `<ng-template nav-host></ng-template>` to determine where the dynamic html will be generated:

```
template: `
          <nav class="navbar navbar-expand-lg navbar-light bg-light">
              <a class="navbar-brand" href="#"> Poudre Basin Information</a>

              <!-- Hamburger Icon -->
              <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>


              <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mr-auto">

                  <ng-template nav-host></ng-template>

                  <li class="nav-item activate .ml-auto">
                  </li>...

```

## Component Dependencies

The Nav component contains the following sub-components and services:

### nav-link.component.ts

This component generates a navigation menu option that is a direct link to a map component.

### nav-dropdown.component.ts

This component generates a navigation menu option that is a dropdown menu, which contains either direct links to map components or external links.  Nav-dropdown.component.ts itself has two dependencies:

`nav-dropdownOptions.ts` - Generates a dropdown menu option that is a direct link to a map component.

`nav-dropdownLink.ts` - Generates a dropdown menu option that is an external link.

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
