import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

import { Feed } from '../_models/feed'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

@Injectable()
export class OsloService {

  private feedList: Feed[] = [];
  private photos: String[] = [];

  constructor(
    private http: Http
  ) { }

  getFeed():  Observable<Feed[]> {
    return this.http.get(environment.URL.feed)
      .map(
        response => {
          const jsonResponse = response.json();
          if (jsonResponse) {
            this.feedList = new Array<Feed>();
            for (const post of jsonResponse){
              const us = {
                message: post.message,
                created_time: post.created_time,
                id: post.id,
              };
              this.feedList.push(us);
            }
            return this.feedList;
          } else {
            return null;
          }
        },
        error => {
          console.error(error.text());
          return null;
        }
      );
  }

  getPhotos(): Observable<String[]> {
    return this.http.get(environment.URL.photoList)
      .map(
        response => {
          const jsonResponse = response.json();
          if (jsonResponse) {
            this.photos = new Array<String>();
            this.photos = jsonResponse;
            return this.photos;
          } else {
            return null;
          }
        }, error => {
          console.error(error.text());
          return null;
        }
      );
  }

}
