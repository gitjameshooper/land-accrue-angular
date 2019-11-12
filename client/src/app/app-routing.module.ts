import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LandComponent } from './land/land.component';


@NgModule({
  imports: [
    /* define app module routes here, e.g., to lazily load a module
         (do not place feature module routes here, use an own -routing.module.ts in the feature instead)
       */
    RouterModule.forRoot([
    	      {
        path: '',
        component: LandComponent,
      }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

