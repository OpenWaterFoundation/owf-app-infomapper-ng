import { Directive, ViewContainerRef, ElementRef, Input } from '@angular/core';
import { MapService } from '../map.service';

@Directive({
  selector: '[map-layer-hook]'
})
export class MapLayerDirective {
  constructor(public viewContainerRef: ViewContainerRef,
              public el: ElementRef,
              public mapService: MapService) { }

  
  ngOnInit(): void {
  }
}
