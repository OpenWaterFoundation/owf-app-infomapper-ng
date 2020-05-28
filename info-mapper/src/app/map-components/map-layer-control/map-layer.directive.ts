import { Directive, ViewContainerRef, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[map-layer-hook]'
})
export class MapLayerDirective {
  constructor(public viewContainerRef: ViewContainerRef,
              public el: ElementRef) { }

  @Input('layerViews') layerViews: any;
  
  ngOnInit(): void {
    // let length: number = this.mapService.
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(this.viewContainerRef);
    console.log(this.el);
    console.log(this.layerViews);
  }
}
