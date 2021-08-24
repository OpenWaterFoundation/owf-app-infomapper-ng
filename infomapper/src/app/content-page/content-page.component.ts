import { Component,
          OnInit,
          Input,
          OnDestroy }     from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription }   from 'rxjs';

import { AppService }     from '../app.service';
import * as IM            from '../../infomapper-types';


@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit, OnDestroy {
  /** The id retrieved from the URL, originally from the app-config id menu option. */
  @Input() id: any;
  /** Variable storing the size of the browser width in pixels. Used for dynamic margin spacing between text and browser edge. */
  public browserWidth: number;
  /** Boolean representing whether markdown file exists. */
  public markdownFilePresent: boolean;
  /** The Showdown config option object. Overrides the `app.module.ts` config option object. */
  public showdownOptions = {
    emoji: true,
    flavor: 'github',
    noHeaderId: true,
    openLinksInNewWindow: true,
    parseImgDimensions: true,
    // This must exist in the config object and be set to false to work.
    simpleLineBreaks: false,
    strikethrough: true,
    tables: true
  }
  /** The reference to the routing subscription so it can be unsubscribed to when this component is destroyed. */
  private routeSubscription$ = <any>Subscription;
  /** A string representing the content to be converted to HTML to display on the Home or Content Page. */
  public showdownHTML: string;


  /**
   * @constructor ContentPageComponent.
   * @param appService The reference to the AppService injected object.
   * @param route The reference to the ActivatedRoute Angular object; used with URL routing for the app.
   */
  constructor(private appService: AppService,
              private route: ActivatedRoute) {

    this.browserWidth = window.outerWidth;
  }


  /**
   * Called once on Component initialization, right after the constructor is called.
   */
  ngOnInit() {
    // When the parameters in the URL are changed the map will refresh and load according to new configuration data
    this.routeSubscription$ = this.route.params.subscribe(() => {

      this.id = this.route.snapshot.paramMap.get('markdownFilename');
      // This might not work with async calls if app-default is detected  
      var markdownFilepath: string = '';

      setTimeout(() => {
        this.appService.setHomeInit(false);
        if (this.id === 'home') {
          markdownFilepath = this.appService.buildPath(IM.Path.hPP);
        } else {
          markdownFilepath = this.appService.buildPath(IM.Path.cPP, [this.id]);
        }
        this.convertMarkdownToHTML(markdownFilepath);
      }, (this.appService.getHomeInit() ? 1000 : 0));
    });
  }

  /**
   * 
   * @param markdownFilepath The full path to the home page or content page file
   */
  public convertMarkdownToHTML(markdownFilepath: string) {
    
    this.appService.getPlainText(markdownFilepath, IM.Path.cPage).subscribe((markdownFile: any) => {
      if (markdownFile) {
        this.markdownFilePresent = true;
        // Other interesting options include:
        // underline
        // let converter = new Showdown.Converter({
        //   openLinksInNewWindow: true,
        //   parseImgDimensions: true,
        //   simpleLineBreaks: false,
        //   strikethrough: true,
        //   tables: true
        // });
        this.showdownHTML = this.appService.sanitizeDoc(markdownFile, IM.Path.cPP);
        // var tempHTML: string = converter.makeHtml(sanitizedDoc);
        
        // var sanitizedHTML = tempHTML.replace(/<img/g, '<img style="height: 100%; width: 100%; object-fit: cover ;"');

        // this.showdownHTML = converter.makeHtml(sanitizedDoc);
      } else {
        this.markdownFilePresent = false;
      }
      
    });
  }

  /**
   * Called once right before this component is destroyed.
   */
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed. Add 'implements OnDestroy' to the class.    
    this.routeSubscription$.unsubscribe();
  }

}
