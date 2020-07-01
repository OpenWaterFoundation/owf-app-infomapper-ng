import { AfterViewInit, Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef }  from '@angular/core';

import { LegendSymbolsComponent } from '../legend-symbols/legend-symbols.component';
import { LegendSymbolsDirective } from '../legend-symbols/legend-symbols.directive';

@Component({
  selector: 'map-layer-component',
  styleUrls: ['./map-layer.component.css'],
  templateUrl:'./map-layer.component.html'
})
export class MapLayerComponent implements OnInit, AfterViewInit {

  @ViewChild(LegendSymbolsDirective, { static: true }) LegendSymbolsComp: LegendSymbolsDirective;

  legendSymbolsViewContainerRef: ViewContainerRef;
    // Information about the layer from the configuration file such as description, or display name
    // Initialized in map.component.ts
    layerViewData: any;

    geometryType: string;
    // A reference to the main map component
    mapComponentReference: any;


    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngOnInit() { }

    toggleLayer() {
      let geoLayerId: string = this.layerViewData.geoLayerId;
      this.mapComponentReference.toggleLayer(geoLayerId);
    }

    ngAfterViewInit() {
      setTimeout(() => {
        this.addSymbolDataToLegendComponent();
      }, 100)
    }

    addSymbolDataToLegendComponent() {
      // Create the background map layer component
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(LegendSymbolsComponent);
      this.legendSymbolsViewContainerRef = this.LegendSymbolsComp.viewContainerRef;
      let componentRef = this.legendSymbolsViewContainerRef.createComponent(componentFactory);
  
      //Initialize the data for the background map layer component
      let component = <LegendSymbolsComponent>componentRef.instance;
      component.layerViewData = this.layerViewData;      
      component.symbolData = this.layerViewData.geoLayerSymbol;
      component.geometryType = this.geometryType;
    }

    selectedInitial(): string {      
      // if (this.layerViewData.properties.selectedInitial === undefined ||
      //     this.layerViewData.properties.selectedInitial === 'true') {

      //   return 'checked';
      // } else if (this.layerViewData.properties.selectedInitial === 'false') {
      //   this.toggleLayer();
      //   return '';
      // }
      return 'checked';
    }

}