import { NgModule }             from '@angular/core';
import { RouterModule, Routes}  from '@angular/router';
import { HomeComponent }        from './home/home.component';
import { MapComponent }         from './map-components/map.component';
import { MapErrorComponent }    from './map-components/map-error/map-error.component';
import { NotFoundComponent }    from './not-found/not-found.component';
import { GenericPageComponent } from './generic-page/generic-page.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'map/:id', component: MapComponent},
  /*{path: 'error', component: MapErrorComponent},
  {path: 'not-found', component: NotFoundComponent},*/
  {path: 'generic-page/:markdownFilename', component: GenericPageComponent },
  {path: '**', redirectTo: 'not-found'}
]

@NgModule({
  imports: [ RouterModule.forRoot(routes, {onSameUrlNavigation:"reload", initialNavigation: 'enabled'})],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
