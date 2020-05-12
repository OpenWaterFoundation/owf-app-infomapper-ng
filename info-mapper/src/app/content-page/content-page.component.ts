import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';

import { MapService }               from '../map-components/map.service'

import { Globals }                  from '../globals'

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
              private mapService: MapService,
              private globals: Globals) { }

  ngOnInit() {    
    // When the parameters in the URL are changed the map will refresh and load according to new 
    // configuration data
    this.route.params.subscribe(() => {

      this.markdownFilename = this.route.snapshot.paramMap.get('markdownFilename');
      if (this.markdownFilename == 'home') this.markdownFilename = 'home.md';      
      let markdownFilepath = this.globals.contentPageConfigFilePath + this.markdownFilename;
      console.log(markdownFilepath);
      
      this.convertMarkdownToHTML(markdownFilepath, "markdown-div");
    }); 
  }

  convertMarkdownToHTML(inputFile: string, outputDiv: string) {

    this.mapService.getMarkdown(inputFile).subscribe((markdownFile: any) => {
      let converter = new showdown.Converter({tables: true, strikethrough: true});
      document.getElementById(outputDiv).innerHTML = converter.makeHtml(markdownFile);
    });
  }

}
