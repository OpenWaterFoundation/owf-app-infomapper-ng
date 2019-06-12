import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, Inject} from '@angular/core';
import { HttpClient }           from '@angular/common/http';
 
import { Observable }           from 'rxjs';
import { NavDirective }         from './nav.directive';

import { TabComponent }     from './tab/tab.component';

import { Globals }              from '../globals';

@Component({
  selector: 'app-nav-bar',
  styleUrls: ['./nav-bar.component.css'],
  templateUrl: './nav-bar.component.html',
  providers: [ Globals ]
})
export class NavBarComponent implements OnInit {

  @ViewChild(NavDirective) navHost: NavDirective;
  public title: string;

  active: String;

  constructor(private http: HttpClient, private componentFactoryResolver: ComponentFactoryResolver, private globals: Globals) {  }

  getMyJSONData(path_to_json): Observable<any> {
    return this.http.get(path_to_json)
  }

  ngOnInit() {
    let configurationFile = this.globals.configurationFile;
    //loads data from config file and calls loadComponent when tsfile is defined
    this.getMyJSONData(configurationFile).subscribe (
      tsfile => {
        this.title = tsfile.title;
        this.loadComponent(tsfile);
      }
    );
  }

  loadComponent(tsfile) {
    //creates new button component in navBar for each map specified in configFile, sets data based on ad service
    for (var i = 0; i < tsfile.mainMenu.length; i++) {
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(TabComponent);
      let viewContainerRef = this.navHost.viewContainerRef;
      let componentRef = viewContainerRef.createComponent(componentFactory);
      (<TabComponent>componentRef.instance).data = tsfile.mainMenu[i];
    }
  }

  pageSelect(page: String) :void {
    this.active = page
  }


}
