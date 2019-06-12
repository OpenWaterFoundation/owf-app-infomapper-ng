import { Injectable }           from '@angular/core';

import { NavDropdownComponent } from './nav-dropdown/nav-dropdown.component';
import { NavItem }              from './nav-item';

@Injectable()
export class NavService {

  adArray: NavItem[] = [];

  //saves config data in variable
  saveConfiguration (tsfile) {
    for (var i = 0; i < tsfile.mainMenu.length; i++){
      if (tsfile.mainMenu[i].menus == undefined){
        //This component is a static link
        this.adArray.push(new NavItem(NavDropdownComponent, 
          {
            name: tsfile.mainMenu[i].name
          }
        ));
      }
      else {
        //This component is a dropdown menu
        this.adArray.push(new NavItem(NavDropdownComponent, 
          {
            name: tsfile.mainMenu[i].name, 
            menu: tsfile.mainMenu[i].menus
          }
        ));
      }
    }
  }

  //returns variable with config data
  getNavigation() {
    return this.adArray;
  }

}
