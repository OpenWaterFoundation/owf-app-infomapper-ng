import { NgModule }             from '@angular/core';
import { RouterModule,
          Routes}               from '@angular/router';

// The MapComponent from the OWF Common package (Angular Library).
import { MapComponent }         from '@OpenWaterFoundation/common/leaflet';
// The DashboardComponent from the OWF Common package (Angular library).
import { DashboardComponent }   from '@OpenWaterFoundation/common/ui/dashboard';
import { NotFoundComponent }    from './not-found/not-found.component';
import { ContentPageComponent } from './content-page/content-page.component';

export const routes: Routes = [
  { path: 'home', redirectTo:'content-page/home' },
  { path: '', redirectTo: 'content-page/home', pathMatch: 'full' },
  { path: 'map/:id', component: MapComponent },
  { path: 'dashboard/:id', component: DashboardComponent },
  { path: 'content-page/:markdownFilename', component: ContentPageComponent },
  { path: '**', component: NotFoundComponent }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
})
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
