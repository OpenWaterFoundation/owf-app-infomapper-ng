import { Component,
          Inject,
          OnInit, }         from '@angular/core';
import { MatDialog,
          MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppService }       from '../../../app.service';
import { MapService }       from '../../map.service';

import * as Showdown        from 'showdown';

@Component({
  selector: 'app-dialog-doc',
  templateUrl: './dialog-doc.component.html',
  styleUrls: ['./dialog-doc.component.css']
})
export class DialogDocComponent implements OnInit {

  // The following three variables are for helping this dialog component determine if it needs to show
  // documentation text, markdown, or HTML in its template file
  public docText: boolean;
  public docMarkdown: boolean;
  public docHTML: boolean;

  public doc: string;
  public docPath: string;
  public informationName: string;
  public showdownHTML: string;
  public showDoc = false;
  

  constructor(public appService: AppService,
              public mapService: MapService,
              public dialogRef: MatDialogRef<DialogDocComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.doc = dataObject.data.doc;
    this.docPath = dataObject.data.docPath;

    if (dataObject.data.geoLayerView.name) {
      this.informationName = dataObject.data.geoLayerView.name;
    } else if (dataObject.data.geoLayerView) {
      this.informationName = dataObject.data.geoLayerView;
    }

    if (dataObject.data.docText) this.docText = true;
    else if (dataObject.data.docMarkdown) this.docMarkdown = true;
    else if (dataObject.data.docHtml) this.docHTML = true;
  }

  ngOnInit(): void {

    if (this.docMarkdown) {
      let converter = new Showdown.Converter({
        emoji: true,
        openLinksInNewWindow: true,
        simpleLineBreaks: false,
        strikethrough: true,
        tables: true
      });
      // Check to see if the markdown file has any input that is an image link syntax. If it does, we want users to
      // be able to set the path to the image relative to the markdown folder being displayed, so they don't have to
      // be burdened with putting a possibly extra long path.
      var sanitizedDoc = this.sanitizeDoc(this.doc);

      setTimeout(() => {
        this.showdownHTML = converter.makeHtml(sanitizedDoc);
      });
    } else if (this.docHTML) {
      setTimeout(() => {          
        document.getElementById('docDiv').innerHTML = this.doc;
      });
    }
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.mapService.resetClick();
    this.dialogRef.close();
  }

  /**
   * Sanitizes the markdown syntax by checking if image links are present, and replacing them with the full path to the
   * image relative to the markdown file being displayed. This eases usability so that just the name and extension of the
   * file can be used e.g. ![Waldo](waldo.png) will be converted to ![Waldo](full/path/to/markdown/file/waldo.png)
   * @param doc The documentation string retrieved from the markdown file
   */
  private sanitizeDoc(doc: string): string {
    // Needed for a smaller scope when replacing the image links
    var _this = this;
    // If anywhere in the documentation there exists  ![any amount of text](
    // then it is the syntax for an image, and the path needs to be changed
    if (/!\[(.*?)\]\(/.test(doc)) {
      // Create an array of all substrings in the documentation that match the regular expression  ](any amount of text)
      var allImages: string[] = doc.match(/\]\((.*?)\)/g);
      // Go through each one of these strings and replace each one that does not specify itself as an in-page link,
      // or external link
      for (let image of allImages) {
        if (image.startsWith('](#') || image.startsWith('](https') || image.startsWith('](http') || image.startsWith('](www')) {
          continue;
        } else {

          doc = doc.replace(image, function(word) {
            // Take off the pre pending ]( and ending )
            var innerParensContent = word.substring(2, word.length - 1);
            // Return the formatted full markdown path with the corresponding bracket and parentheses
            return '](' + _this.appService.buildPath('markdownPath', [innerParensContent]) + ')';
          });

        }
      }
    }

    return doc;
  }

}
