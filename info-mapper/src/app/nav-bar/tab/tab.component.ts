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

  ngOnInit() {  }
}
