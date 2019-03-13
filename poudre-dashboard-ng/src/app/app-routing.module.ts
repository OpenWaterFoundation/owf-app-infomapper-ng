import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MapComponent } from './map/map.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'map', component: MapComponent}
]

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
