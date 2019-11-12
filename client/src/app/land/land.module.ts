import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandComponent } from './land.component';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [
    LandComponent,
  ],
  exports: [LandComponent]
})
export class LandModule {}

