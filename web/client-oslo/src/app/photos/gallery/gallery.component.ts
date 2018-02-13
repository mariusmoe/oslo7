import { Component, OnInit } from '@angular/core';

import { OsloService } from '../../_services/oslo.service';@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  public photos: String[];
  constructor(
    public osloService: OsloService
  ) {
    const sub = osloService.getPhotos().subscribe((photos) => {
      this.photos = photos;
      console.log(this.photos);
      sub.unsubscribe();
    });
   }

  ngOnInit() {
  }

  // https://github.com/tjoskar/ng-lazyload-image

}
