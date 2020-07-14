import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute }           from '@angular/router';

import { Subscription }             from 'rxjs';

import { AppService }               from '../app.service';
import { MapService }               from '../map-components/map.service'


declare var require: any;
const showdown = require('showdown');

@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  @Input() id: any;
  private routeSubscription = <any>Subscription;

  constructor(private appService: AppService,
              private mapService: MapService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    // When the parameters in the URL are changed the map will refresh and load according to new 
    // configuration data
    this.routeSubscription = this.route.params.subscribe(() => {
      this.id = this.route.snapshot.paramMap.get('markdownFilename');
      
      // This might not work with async calls if app-default is detected  
      var markdownFilepath: string = '';
      
      setTimeout(() => {
        if (this.id == 'home') {
          markdownFilepath = this.appService.getAppPath() + this.mapService.getHomePage();
        } else {                     
          markdownFilepath = this.appService.getAppPath() + this.mapService.getContentPathFromId(this.id);
        }
        this.convertMarkdownToHTML(markdownFilepath, "markdown-div");
      }, 300);
    }); 
  }

  convertMarkdownToHTML(inputFile: string, outputDiv: string) {

    this.appService.getPlainText(inputFile, 'Content Page').subscribe((markdownFile: any) => {
      // Other interesting options include:
      // openLinksInNewWindow, underline, 
      let converter = new showdown.Converter({tables: true, strikethrough: true});
      document.getElementById(outputDiv).innerHTML = converter.makeHtml(markdownFile);      
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.    
    this.routeSubscription.unsubscribe();
  }

}
