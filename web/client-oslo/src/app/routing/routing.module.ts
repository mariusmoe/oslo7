import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { HomeComponent } from '../home/home/home.component';
import { AboutComponent } from '../about/about/about.component';
import { GalleryComponent } from '../photos/gallery/gallery.component';
import { JoinComponent } from '../join/join/join.component';

import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: 'photos', component: GalleryComponent },
  { path: 'about', component: AboutComponent },
  { path: 'join', component: JoinComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class RoutingModule { }
