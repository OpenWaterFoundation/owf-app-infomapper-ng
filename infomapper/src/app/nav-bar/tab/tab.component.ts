import { Component,
          Input,
          OnInit }      from '@angular/core';

import * as IM          from '@OpenWaterFoundation/common/services';

import { faBookOpen,
          faFileLines,
          faGaugeHigh } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'tab',
  styleUrls: ['./tab.component.css'],
  templateUrl:'./tab.component.html'
})
/**
 * The TabComponent class represents each MainMenu object from the app-config.json
 * file and displays the MainMenu with any SubMenus if provided.
 */
export class TabComponent implements OnInit {

  /** The InfoMapper MainMenu object to be used for creating each SubMenu and displaying
   * on the site. */
  @Input() mainMenu: IM.MainMenu;
  /** All used icons in the SideNavComponent. */
  faBookOpen = faBookOpen
  faFileLines = faFileLines;
  faGaugeHigh = faGaugeHigh;
  

  constructor() { }


  /**
   * This function is called on initialization of the map component, after the constructor.
   */
  ngOnInit() {
    this.cleanProperties();
  }

  /**
   * Converts all enabled, visible, and separatorBefore properties to booleans for easier HTML creation
   * for this component's template file.
   */
  private cleanProperties(): void {
    // Convert enabled to boolean.
    if (this.mainMenu.enabled) {
      switch (typeof this.mainMenu.enabled) {
        case 'string': this.mainMenu.enabled = (this.mainMenu.enabled.toUpperCase() === 'TRUE');
        break;
      }
    }
    // Convert every sub menu's enabled, visible, and separatorBefore properties to a boolean
    if (this.mainMenu.menus) {
      for (let subMenu of this.mainMenu.menus) {
        switch (typeof subMenu.enabled) {
          case 'string': subMenu.enabled = (subMenu.enabled.toUpperCase() === 'TRUE'); break;
        }
        switch (typeof subMenu.separatorBefore) {
          case 'string': subMenu.separatorBefore = (subMenu.separatorBefore.toUpperCase() === 'TRUE'); break;
        }
        switch (typeof subMenu.doubleSeparatorBefore) {
          case 'string': subMenu.doubleSeparatorBefore = (subMenu.doubleSeparatorBefore.toUpperCase() === 'TRUE'); break;
        }
        switch (typeof subMenu.visible) {
          case 'string': subMenu.visible = (subMenu.visible.toUpperCase() === 'TRUE'); break;
        }
      }      
    }
  }

}
