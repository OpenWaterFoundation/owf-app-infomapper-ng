import { Component,
          OnInit,
          Input,
          OnDestroy }          from '@angular/core';
import { ActivatedRoute,
          ParamMap }           from '@angular/router';

import { Subscription }        from 'rxjs';
import { first }               from 'rxjs/operators';

import { AppService }          from '../services/app.service';
import { CommonLoggerService } from '@OpenWaterFoundation/common/services';
import * as IM                 from '@OpenWaterFoundation/common/services';


@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  /** Boolean representing whether markdown file exists. */
  markdownFilePresent: boolean;
  /** The Showdown config option object. Overrides the `app.module.ts` config option object. */
  showdownOptions = {
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
  private routeSubscription$ = null;
  /** A string representing the content to be converted to HTML to display on the Home or Content Page. */
  showdownHTML: string;
  /**
   * Boolean representing whether the provided 
   */
  validContentPageID: boolean


  /**
   * @constructor ContentPageComponent.
   * @param appService The reference to the AppService injected object.
   * @param actRoute The reference to the ActivatedRoute Angular object; used with URL routing for the app.
   */
  constructor(private appService: AppService, private actRoute: ActivatedRoute,
  private logger: CommonLoggerService) {

  }


  /**
   * Sets the showdownHTML variable string to be displayed in the template file by
   * ngx-showdown if the path to a markdown file is given. Displays a 404
   * @param markdownFilepath The full path to the home page or content page file.
   */
  convertMarkdownToHTML(markdownFilepath: string) {
    
    this.appService.getPlainText(markdownFilepath, IM.Path.cPage)
    .pipe(first()).subscribe((markdownFile: any) => {
      if (markdownFile) {
        // Other options for the showdown constructor include:
        // underline
        this.showdownHTML = this.appService.sanitizeDoc(markdownFile, IM.Path.cPP);
      }
      
    });
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive. Called after the constructor.
   */
   ngOnInit() {
    // When the parameters in the URL are changed the map will refresh and load
    // according to new configuration data.
    this.routeSubscription$ = <any>Subscription;
    this.routeSubscription$ = this.actRoute.paramMap.subscribe((paramMap: ParamMap) => {

      var menuId = paramMap.get('menuId');
      this.validContentPageID = this.appService.validMapConfigMapID(menuId);

      if (this.validContentPageID === false) {
        return;
      }

      this.logger.print('info', 'ContentPageComponent.ngOnInit - Content Page initialization.');

      // This might not work with async calls if app-default is detected.
      var markdownFilepath: string = '';

      if (menuId === 'home') {
        markdownFilepath = this.appService.buildPath(IM.Path.hPP);
      } else {
        markdownFilepath = this.appService.buildPath(IM.Path.cPP, menuId);
      }
      this.convertMarkdownToHTML(markdownFilepath);
    });
  }


  /**
   * Called once right before this component is destroyed.
   */
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed. Add 'implements OnDestroy' to the class.
    if (this.routeSubscription$) {
      this.routeSubscription$.unsubscribe();
    }
  }

}
