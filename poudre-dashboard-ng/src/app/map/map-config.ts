import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable()
 export class MapConfig {
 private _config: Object
 constructor(private http: HttpClient) {
 }
 load() {
    return new Promise((resolve, reject) => {
        
      this.http.get('map-files/map-basin.json')
      .pipe(map((res:Response) => res.json()))
      .subscribe((data) => {
          this._config = data;
          resolve(true);
        });
      });
}
get(key: any) {
   return this._config[key];
}
};