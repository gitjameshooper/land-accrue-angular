import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { LandModule } from './land/land.module';


@NgModule({
  imports: [
    AppRoutingModule,
    LandModule,
    BrowserAnimationsModule,
    BrowserModule,
    SharedModule.forRoot(),
  ],
  providers: [],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  exports: [AppComponent]
})
export class AppModule { }
