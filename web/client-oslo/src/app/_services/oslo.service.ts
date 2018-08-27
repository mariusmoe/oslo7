import { Injectable } from '@angular/core';


import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';

import { Feed } from '../_models/feed'
import { Photo } from '../_models/photo'



@Injectable()
export class OsloService {

  constructor(
    private http: HttpClient
  ) { }

  getFeed() {
    console.log('feed called');
    
    return this.http.get<Feed[]>(environment.URL.feed);
  }

  getPhotos() {
    return this.http.get<String[]>(environment.URL.photoList);
  }

  getFolders() {
    return this.http.get<Photo[]>(environment.URL.foldersList)
  }


}
