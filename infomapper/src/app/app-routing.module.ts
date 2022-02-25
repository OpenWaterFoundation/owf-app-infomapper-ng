import { NgModule }             from '@angular/core';
import { RouterModule,
          Routes}               from '@angular/router';

// This import uses the MapComponent from the OWF Common package (Angular Library).
import { MapComponent }         from '@OpenWaterFoundation/common/leaflet';
import { NotFoundComponent }    from './not-found/not-found.component';
import { ContentPageComponent } from './content-page/content-page.component';

export const routes: Routes = [
  { path: 'home', redirectTo:'content-page/home' },
  { path: '', redirectTo: 'content-page/home', pathMatch: 'full' },
  { path: 'map/:id', component: MapComponent },
  { path: 'content-page/:markdownFilename', component: ContentPageComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    onSameUrlNavigation: "reload",
    initialNavigation: 'enabled',
    relativeLinkResolution: 'legacy'
})
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
