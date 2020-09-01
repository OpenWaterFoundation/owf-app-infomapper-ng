import { Component, OnInit,
         Input, OnDestroy } from '@angular/core';
import { ActivatedRoute }   from '@angular/router';

import { Subscription }     from 'rxjs';

import { AppService }       from '../app.service';

import * as Showdown        from 'showdown';


@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  @Input() id: any;
  private routeSubscription$ = <any>Subscription;
  public options = {
    openLinksInNewWindow: true,
    simpleLineBreaks: false,
    strikethrough: true,
    tables: true
  }
  public showdownHTML: string;

  constructor(private appService: AppService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    // When the parameters in the URL are changed the map will refresh and load according to new configuration data
    this.routeSubscription$ = this.route.params.subscribe(() => {
      this.id = this.route.snapshot.paramMap.get('markdownFilename');
      // This might not work with async calls if app-default is detected  
      var markdownFilepath: string = '';

      setTimeout(() => {
        this.appService.setHomeInit(false);
        if (this.id === 'home') {
          markdownFilepath = this.appService.buildPath('homePagePath');
        } else {                     
          markdownFilepath = this.appService.buildPath('contentPagePath', [this.id]);
        }
        this.convertMarkdownToHTML(markdownFilepath, "markdown-div");
      }, (this.appService.getHomeInit() ? 1000 : 0));
    }); 
  }

  convertMarkdownToHTML(markdownFilepath: string, outputDiv: string) {
    
    this.appService.getPlainText(markdownFilepath, 'Content Page').subscribe((markdownFile: any) => {
      // Other interesting options include:
      // underline
      let converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        simpleLineBreaks: false,
        strikethrough: true,
        tables: true
      });
      this.showdownHTML = converter.makeHtml(markdownFile);
    });
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed. Add 'implements OnDestroy' to the class.    
    this.routeSubscription$.unsubscribe();
  }

}
