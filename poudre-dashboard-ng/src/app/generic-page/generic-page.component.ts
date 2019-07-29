import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

declare var require: any;
const showdown = require('showdown');

@Component({
  selector: 'app-generic-page',
  templateUrl: './generic-page.component.html',
  styleUrls: ['./generic-page.component.css']
})
export class GenericPageComponent implements OnInit {

  @Input() markdownFilename: any;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
     // When the parameters in the URL are changed the map will refresh and load according to new 
    // configuration data
    this.route.params.subscribe(routeParams => {
      this.markdownFilename = this.route.snapshot.paramMap.get('markdownFilename');
      let markdownFilepath = "assets/generic-pages/" + this.markdownFilename + ".md";
      this.convertMarkdownToHTML(markdownFilepath, "markdown-div");
    }); 
  }

  convertMarkdownToHTML(inputFile, outputDiv) {

    $.get(inputFile, (textString) => {
        var converter = new showdown.Converter({tables: true, strikethrough: true});
        document.getElementById(outputDiv).innerHTML = converter.makeHtml(textString);
    }).fail(()=> {
      console.error("The markdown file '" + inputFile + "' could not be read");
      this.router.navigateByUrl('not-found');
    })
  }

}
