import { Injectable } from '@angular/core';

@Injectable()
export class Globals {

  appConfigFile: string = 'assets/app/app-config.json';

  mapConfigFilePath: string = 'assets/app/data-maps/map-configuration-files/';

  contentPageConfigFilePath: string = 'assets/app/content-pages/';
}