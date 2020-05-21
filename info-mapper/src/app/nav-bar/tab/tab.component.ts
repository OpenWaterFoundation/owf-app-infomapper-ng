import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, ElementRef }  from '@angular/core';
import { TabDirective } from './tab.directive';



@Component({
  selector: 'tab',
  styleUrls: ['./tab.component.css'],
  templateUrl:'./tab.component.html'
})
export class TabComponent implements OnInit{

  @Input() data: any;
  @Input() aligned: string;
  @ViewChild(TabDirective) tabHost: TabDirective;
  
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.cleanProperties(this.data);    
   }

  private cleanProperties(data: any): void {
    if (data.enabled) {
      switch (typeof data.enabled) {
        case 'boolean': data.enabled = data.enabled.toString(); break;
      }
    }
    if (data.menus) {
      for (let menu of data.menus) {
        switch (typeof menu.enabled) {
          case 'boolean': menu.enabled = menu.enabled.toString();
          break;
        }
        switch (typeof menu.separatorBefore) {
          case 'boolean': menu.separatorBefore = menu.separatorBefore.toString();
          break;
        }
      }      
    }
  }
}
