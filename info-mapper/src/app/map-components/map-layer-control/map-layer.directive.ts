import { Directive, ViewContainerRef, ElementRef, Input } from '@angular/core';
import { MapService } from '../map.service';

@Directive({
  selector: '[map-layer-hook]'
})
export class MapLayerDirective {
  constructor(public viewContainerRef: ViewContainerRef,
              public el: ElementRef,
              public mapService: MapService) { }

  @Input('layerViews') layerViews: any;
  @Input('realLayerViews') realLayerViews: any;

  groupArray: any[] = [];
  
  ngOnInit(): void {
    // console.log(this.viewContainerRef);
    // console.log(this.el.nativeElement);
    // console.log(this.realLayerViews);

    // console.log('layerViews -> ', this.layerViews);

    // this.mapService.getContainerViews().subscribe((value: any) => {

    //   if (typeof value != 'string') {
    //     console.log('value ->', value);
    //     this.viewContainerRef = value;
    //     console.log(this.viewContainerRef.length);
        
    //   }
      
    // });
  }
}
