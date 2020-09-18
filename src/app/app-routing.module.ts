import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';

const routes: Routes = [
  { path: '', redirectTo: 'scatter-plot', pathMatch: 'full' },
  { path: 'scatter-plot', component: ScatterPlotComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
