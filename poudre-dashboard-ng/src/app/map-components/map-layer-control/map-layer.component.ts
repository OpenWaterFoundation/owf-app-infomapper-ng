import { AfterViewInit, Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef }  from '@angular/core';

import { LegendSymbolsComponent } from '../legend-symbols/legend-symbols.component';
import { LegendSymbolsDirective } from '../legend-symbols/legend-symbols.directive';

@Component({
  selector: 'map-layer-component',
  styleUrls: ['./map-layer.component.css'],
  templateUrl:'./map-layer.component.html'
})
export class MapLayerComponent implements OnInit, AfterViewInit{

  @ViewChild(LegendSymbolsDirective) LegendSymbolsComp: LegendSymbolsDirective;

  legendSymbolsViewContainerRef: ViewContainerRef;


    // Information about the layer from the configuration file such as description, or display name
    // Initialized in map.component.ts
    layerData: any;
    // Information linking the layer to the layer display
    // Initialized in map.component.ts
    layerViewConfiguration: any;
    // The data for the symbol such as color and size.
    symbol: any;
    // A reference to the main map component
    mapComponentReference: any;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngOnInit() {      
      this.symbol = this.layerViewConfiguration.geoLayerSymbol; 
    }

    toggleLayer() {
      // Try the old config file first
      let geolayerId: string = this.layerData.geoLayerId;
      this.mapComponentReference.toggleLayer(geolayerId);
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
  
      //Intialize the data for the background map layer component
      let component = <LegendSymbolsComponent>componentRef.instance;
      component.layerData = this.layerData;      
      component.symbolData = this.symbol;
    }

}