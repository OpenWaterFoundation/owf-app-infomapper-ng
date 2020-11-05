import { Component,
          OnInit,
          Input,
          OnDestroy }     from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription }   from 'rxjs';

import { AppService,
          PathType }      from '../app.service';

import * as Showdown      from 'showdown';


@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  /**
   * 
   */
  public browserWidth: number;
  /**
   * The id retrieved from the URL, originally from the app-config id menu option.
   */
  @Input() id: any;
  /**
   * The reference to the routing subscription so it can be unsubscribed to when this component is destroyed.
   */
  private routeSubscription$ = <any>Subscription;
  /**
   * The object containing the options for the converted Showdown string upon creation.
   * NOTE: Might not be working.
   */
  public options = {
    openLinksInNewWindow: true,
    simpleLineBreaks: false,
    strikethrough: true,
    tables: true
  }
  /**
   * A string representing the content to be converted to HTML to display on the Home or Content Page.
   */
  public showdownHTML: string;


  /**
   * 
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
          markdownFilepath = this.appService.buildPath(PathType.hPP);
        } else {
          markdownFilepath = this.appService.buildPath(PathType.cPP, [this.id]);
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
    
    this.appService.getPlainText(markdownFilepath, PathType.cPage).subscribe((markdownFile: any) => {
      // Other interesting options include:
      // underline
      let converter = new Showdown.Converter({
        openLinksInNewWindow: true,
        simpleLineBreaks: false,
        strikethrough: true,
        tables: true
      });
      var sanitizedDoc = this.appService.sanitizeDoc(markdownFile, PathType.cPP);
      this.showdownHTML = converter.makeHtml(sanitizedDoc);
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
