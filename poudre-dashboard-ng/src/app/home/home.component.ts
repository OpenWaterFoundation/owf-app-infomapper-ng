import { Component, OnInit } from '@angular/core';

declare var require: any;
const showdown = require('showdown');

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    let markdownFilepath = "assets/generic-pages/home.md";
    this.convertMarkdownToHTML(markdownFilepath, "markdown-div");
  }

  convertMarkdownToHTML(inputFile, outputDiv) {

    $.get(inputFile, (textString) => {
        var converter = new showdown.Converter({tables: true, strikethrough: true});
        document.getElementById(outputDiv).innerHTML = converter.makeHtml(textString);
    })
  }
}
