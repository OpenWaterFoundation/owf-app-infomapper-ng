import { Injectable }           from '@angular/core';
import {  Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { navDropdownComponent }   from './nav-dropdown.component';
import { navLinkComponent } from './nav-link.component';
import { navItem }               from './nav-item';

var adArray = [];

@Injectable()

export class navService {

  //saves config data in variable
  saveConfiguration (tsfile) {
    for (var i = 0; i < tsfile.mainMenu.length; i++){

      if (tsfile.mainMenu[i].menus == undefined){
        console.log(tsfile.mainMenu[i].name + " has no dropdown.");
        adArray.push(new navItem(navDropdownComponent, {name: tsfile.mainMenu[i].name}));
      }
      else {
        console.log(tsfile.mainMenu[i].name + " has a dropdown.");
        adArray.push(new navItem(navDropdownComponent, {name: tsfile.mainMenu[i].name, menu: tsfile.mainMenu[i].menus}));
      }

    }
  }

  //returns variable with config data
  getNavigation() {
    return adArray;
  }

}
