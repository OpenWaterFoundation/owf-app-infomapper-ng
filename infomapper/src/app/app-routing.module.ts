import { NgModule }             from '@angular/core';
import { RouterModule, Routes}  from '@angular/router';

import { MapComponent }         from './map-components/map.component';
import { MapErrorComponent }    from './map-components/map-error/map-error.component';
import { NotFoundComponent }    from './not-found/not-found.component';
import { ContentPageComponent } from './content-page/content-page.component';

const routes: Routes = [
  { path: 'home', redirectTo:'content-page/home' },
  { path: '', redirectTo: 'content-page/home', pathMatch: 'full' },
  { path: 'map/:id', component: MapComponent },
  { path: 'content-page/:markdownFilename', component: ContentPageComponent },
  { path: '404', component: NotFoundComponent },
  { path: 'map-error', component: MapErrorComponent },
  { path: '**', component: NotFoundComponent },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation:"reload",
      initialNavigation: 'enabled'
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
