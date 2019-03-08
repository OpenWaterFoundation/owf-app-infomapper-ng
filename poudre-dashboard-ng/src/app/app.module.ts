import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { HomeComponent } from './home/home.component';
import { MapPageComponent } from './map-page/map-page.component';
import { AppRoutingModule } from './app-routing.module';
import { MapComponent } from './map/map.component';
import {HttpClientModule} from '@angular/common/http';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarTopComponent } from './sidebar-top/sidebar-top.component';
import { SidebarBottomComponent } from './sidebar-bottom/sidebar-bottom.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    HomeComponent,
    MapPageComponent,
    MapComponent,
    SidebarComponent,
    SidebarTopComponent,
    SidebarBottomComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
