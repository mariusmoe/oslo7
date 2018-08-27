import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';

import { OsloService } from '../../_services/oslo.service';
import { Photo } from '../../_models/photo';
import { ActivatedRoute, ParamMap, UrlSegment, Router  } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import 'rxjs/add/observable/of';
import { Url } from 'url';
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  public folders: Photo[];                                // The folders to display
  public allFolders: Photo[];                             // All folders retrived from server at load
  public rootFolderId = '0Bzd-8gMv1MGANlhiQ2c1RmZkVXM';   // Root folder to begin search

  folderStack$: Observable<String>;
  folderStack = [];   
  folderStack_                                    // Stack of where we are in the folder nesting

  images: Observable<Photo[]>;                            // TO be... list of image objects, retrived from db

/**
 * ok, the important part here is to set up the folders...
 * First we retrive the folders
 * Second we check the url and "navigate" to the folder that we got from the url
 * NOPE - Do this instead: https://medium.com/@bo.vandersteene/angular-5-breadcrumb-c225fd9df5cf
 * @param osloService service for retriving folders and urls for images
 * @param route route by angular
 */
  constructor(
    public osloService: OsloService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {   
    const sub = osloService.getFolders().subscribe((allFolders) => {
      this.allFolders = allFolders;
      console.log(this.allFolders);
      this.folders = this.allFolders.filter(obj => {
        return obj.parents == this.rootFolderId;
      })
      this.folderStack = this.route.snapshot.children[0].url.map((urlSegment: UrlSegment) => {
        return urlSegment.path;
      })
      console.log(this.folderStack);
      this.openFolder();
      sub.unsubscribe();
    });
   }

   ngOnInit() {
   

    



  }

  openFolder(folderToOpenDriveID=null) {
    if (folderToOpenDriveID) {
      this.folderStack.push(folderToOpenDriveID);
    }
    this.folders = this.allFolders.filter(obj => {
      return obj.parents == this.folderStack[this.folderStack.length-1];
    })
     // changes the route without moving from the current view or
     let goToUrl = 'photos/' + this.folderStack.join('/');
     this.location.go(goToUrl)
  } 

  popFolderStack(){
    if (this.folderStack.length > 1){
      this.folderStack.pop();    
      this.openFolder();
    }

  }


  // https://github.com/tjoskar/ng-lazyload-image

}
