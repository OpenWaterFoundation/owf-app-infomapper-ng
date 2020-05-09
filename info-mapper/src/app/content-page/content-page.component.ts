import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';

import { MapService }               from '../map-components/map.service'

declare var require: any;
const showdown = require('showdown');

@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit {

  @Input() markdownFilename: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private mapService: MapService) { }

  ngOnInit() {    
    // When the parameters in the URL are changed the map will refresh and load according to new 
    // configuration data
    this.route.params.subscribe((routeParams) => {      
      this.markdownFilename = this.route.snapshot.paramMap.get('markdownFilename');
      let markdownFilepath = 'assets/app/content-pages/' + this.markdownFilename + '.md';
      this.mapService.urlExists((markdownFilepath)).subscribe(() => {
        this.convertMarkdownToHTML(markdownFilepath, "markdown-div");
      }, (err: any) => {
        markdownFilepath = 'assets/app-default/content-pages/' +
                            this.markdownFilename + '.md';
        this.convertMarkdownToHTML(markdownFilepath, "markdown-div");
      });
    }); 
  }

  convertMarkdownToHTML(inputFile: string, outputDiv: string) {

    $.get(inputFile, (textString) => {
        let converter = new showdown.Converter({tables: true, strikethrough: true});
        document.getElementById(outputDiv).innerHTML = converter.makeHtml(textString);
    }).fail(() => {
      console.error("The markdown file '" + inputFile + "' could not be read");
      this.router.navigateByUrl('not-found');
    });
  }

}
