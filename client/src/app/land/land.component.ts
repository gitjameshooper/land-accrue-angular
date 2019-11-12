import { Component, OnInit } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { share } from 'rxjs/operators';
import { CinemaModel, FilmModel, FilmSourceModel } from '../shared/all-models.models';
import { ArraySortPipe } from '../shared/pipes/sort.pipe';
import { LandService } from '../shared/services/land.service';

@Component({
  selector: 'land',
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.scss'],
  providers: [ArraySortPipe]
})
export class LandComponent implements OnInit{
  public land$: Observable<Array<any>> = new Observable;
 
 
  constructor(private landService: LandService, private sortPipe:ArraySortPipe){
  }
 public ngOnInit() {
   	this.land$ = this.landService.getLandData();
   	 }
  
}
