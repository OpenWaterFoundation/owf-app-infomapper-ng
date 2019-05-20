import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { MapComponent } from './map-components/map.component';
import { MapErrorComponent } from './map-components/map-error/map-error.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'map/:id', component: MapComponent},
  {path: 'about', component: AboutComponent},
  {path: 'error', component: MapErrorComponent}
]

@NgModule({
  imports: [ RouterModule.forRoot(routes, {onSameUrlNavigation:"reload"})],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
