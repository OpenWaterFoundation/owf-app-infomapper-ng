import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

/*
 * Custom error page developed using the following tutorial:
 * https://www.thecodecampus.de/blog/angular-universal-handle-404-set-status-codes/
 * Also see app-routing.module.ts
 */

const routes: Routes = [{
  path: '',
  component: NotFoundComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotFoundRoutingModule { }
