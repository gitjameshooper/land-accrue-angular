import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { LandService } from './services/land.service';
import { ArraySortPipe } from "./pipes/sort.pipe";
import { NgLetDirective } from "./directives/ng-let.directive";
import { JsonpModule } from '@angular/http';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    JsonpModule
  ],
  declarations: [
    NgLetDirective,
    ArraySortPipe,
    HeaderComponent,
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgLetDirective,
    HeaderComponent,
    ArraySortPipe,
  ],
  providers: [
    LandService,
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule
    };
  }
}
