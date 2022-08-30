import { Pipe,
          PipeTransform } from '@angular/core';

import * as IM            from '@OpenWaterFoundation/common/services';


@Pipe({ name: 'checkElement' })
export class CheckElementPipe implements PipeTransform {
  // Keep the pipe pure by having it produce the same deterministic output when
  // given the same input parameters.
  transform(menu: IM.MainMenu | IM.SubMenu, checkFor: string): any {

    switch (checkFor) {
      case 'mainMenuIsVisible':
        if (typeof menu.visible === 'undefined') {
          return true;
        } else if (typeof menu.visible === 'string') {
          return menu.visible.toLowerCase() === 'true';
        } else if (typeof menu.visible === 'boolean') {
          return menu.visible;
        } else {
          return false;
        }
      case 'menuDisabled':
        if (menu.enabled === false || menu.enabled === 'false') {
          return true;
        } else {
          return false;
        }
      case 'subMenuContentPage':
        return menu.action === 'contentPage' && menu.visible !== false;
      case 'subMenuDashboard':
        return menu.action === 'dashboard' && menu.visible !== false;
      case 'subMenuDisplayMap':
        return menu.action === 'displayMap' && menu.visible !== false;
      case 'subMenuStory':
        return menu.action === 'story' && menu.visible !== false;
      case 'subMenuExternalLink':
        return menu.action === 'externalLink' && menu.visible !== false;
    }

    return null;
  }

}
