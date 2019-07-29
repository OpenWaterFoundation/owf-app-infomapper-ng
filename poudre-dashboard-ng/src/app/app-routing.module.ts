import { NgModule }             from '@angular/core';
import { RouterModule, Routes}  from '@angular/router';
import { MapComponent }         from './map-components/map.component';
import { MapErrorComponent }    from './map-components/map-error/map-error.component';
import { NotFoundComponent }    from './not-found/not-found.component';
import { GenericPageComponent } from './generic-page/generic-page.component';

const routes: Routes = [
  {path: 'home', redirectTo:'generic-page/home'},
  {path: '', redirectTo: 'generic-page/home', pathMatch: 'full'},
  {path: 'map/:id', component: MapComponent},
  {path: 'generic-page/:markdownFilename', component: GenericPageComponent },
  {path: '404', component: NotFoundComponent },
  {path: 'map-error', component: MapErrorComponent },
  {path: '**', component: NotFoundComponent},
]

@NgModule({
  imports: [ RouterModule.forRoot(routes, {onSameUrlNavigation:"reload", initialNavigation: 'enabled'})],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
