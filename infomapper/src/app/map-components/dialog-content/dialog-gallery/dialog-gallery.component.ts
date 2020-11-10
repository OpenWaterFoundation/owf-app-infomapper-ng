import { Component,
          Inject,
          OnInit }              from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA }     from '@angular/material/dialog';
import { NgxGalleryOptions,
          NgxGalleryImage,
          NgxGalleryAnimation } from 'ngx-gallery-9';

import { AppService }           from '../../../app.service';
import { MapService }           from '../../map.service';

@Component({
  selector: 'app-dialog-gallery',
  templateUrl: './dialog-gallery.component.html',
  styleUrls: ['./dialog-gallery.component.css', '../main-dialog-style.css']
})
export class DialogGalleryComponent implements OnInit {

  public display: string;
  public galleryOptions: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];

  constructor(public appService: AppService,
              public dialogRef: MatDialogRef<DialogGalleryComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.display = dataObject.data.display;
  }

  ngOnInit(): void {

    this.galleryOptions = [
      {
        height: '565px',
        width: '890px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      {
        breakpoint: 800,
        previewCloseOnClick: true, // Doesn't work
        previewForceFullscreen: true,
        previewKeyboardNavigation: true,
        width: '100%',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      }
  ];

  this.galleryImages = [
    {
      small: 'assets/app/img/cache_la_poudre.jpg',
      medium: 'assets/app/img/cache_la_poudre.jpg',
      big: 'assets/app/img/cache_la_poudre.jpg'
    },
    {
      small: 'assets/app/img/waldo.png',
      medium: 'assets/app/img/waldo.png',
      big: 'assets/app/img/waldo.png',
      description: 'Wally, also known as Waldo, is the star of the "Where\'s Wally" series. The character is known for his ' +
      'distinct wardrobe of a red and white striped shirt, blue jeans, brown boots, red and white striped socks, glasses, ' +
      'and his red and white bobbled hat.'
    },
    {
      small: 'assets/app/img/PoudreRiverForumLogo.png',
      medium: 'assets/app/img/PoudreRiverForumLogo.png',
      big: 'assets/app/img/PoudreRiverForumLogo.png'
    },
    {
      small: 'assets/app/img/poudre_river.jpg',
      medium: 'assets/app/img/poudre_river.jpg',
      big: 'assets/app/img/poudre_river.jpg'
    },
    {
      small: 'assets/app/img/PoudreRiverForumLogo.png',
      medium: 'assets/app/img/PoudreRiverForumLogo.png',
      big: 'assets/app/img/PoudreRiverForumLogo.png'
    }
  ];

  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.dialogRef.close();
    // this.windowManager.removeWindow(this.windowID);
  }

}
