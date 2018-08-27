import { Component, OnInit } from '@angular/core';
import { OsloService } from '../../_services/oslo.service';
import {MatCardModule} from '@angular/material/card';


import { Feed } from '../../_models/feed';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public feed: Feed[];
  public error;

  constructor(
    public osloService: OsloService
  ) {
    this.osloService.getFeed()
      .subscribe(
        (data: Feed[]) => {
          console.log(data);
          
          this.feed = { ...data }
        }, // success path
        error => this.error = error // error path
      );
  }

  ngOnInit() {
  }

}
