import { Component, OnInit } from '@angular/core';
import { OsloService } from '../../_services/oslo.service';
import {MatCardModule} from '@angular/material/card';


import { Feed } from '../../_models/feed'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public feed: Feed[];

  constructor(
    public osloService: OsloService
  ) {
    const sub = osloService.getFeed().subscribe((feed) => {
      this.feed = feed;
      console.log(this.feed);
      sub.unsubscribe();
    });
  }

  ngOnInit() {
  }

}
