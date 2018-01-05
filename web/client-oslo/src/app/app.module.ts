import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { HttpModule } from '@angular/http';
import {MatCardModule} from '@angular/material/card';


import { AppComponent } from './app.component';
import { HomeComponent } from './home/home/home.component';
import { AboutComponent } from './about/about/about.component';
import { GalleryComponent } from './photos/gallery/gallery.component';
import { JoinComponent } from './join/join/join.component';

import { RoutingModule } from './routing/routing.module';
import { NavigationComponent } from './navigation/navigation.component';
import { FooterComponent } from './footer/footer.component';

import { OsloService } from './_services/oslo.service';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    GalleryComponent,
    JoinComponent,
    NavigationComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RoutingModule,
    MatButtonModule,
    MatCardModule,
    LazyLoadImageModule,
    HttpModule
  ],
  providers: [
    OsloService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
