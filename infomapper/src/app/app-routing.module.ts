import { NgModule }             from '@angular/core';
import { RouterModule,
          Routes}               from '@angular/router';

// The Map, Dashboard, & Story components from the OWF Common package (Angular Library).
import { MapComponent }         from '@OpenWaterFoundation/common/leaflet';
import { DashboardComponent }   from '@OpenWaterFoundation/common/ui/dashboard';
import { StoryComponent }       from '@OpenWaterFoundation/common/ui/story';

import { NotFoundComponent }    from './not-found/not-found.component';
import { ContentPageComponent } from './content-page/content-page.component';

export const routes: Routes = [
  { path: 'home', redirectTo:'content-page/home' },
  { path: '', redirectTo: 'content-page/home', pathMatch: 'full' },
  { path: 'map/:id', component: MapComponent },
  { path: 'dashboard/:id', component: DashboardComponent },
  { path: 'story/:id', component: StoryComponent },
  { path: 'content-page/:menuId', component: ContentPageComponent },
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
