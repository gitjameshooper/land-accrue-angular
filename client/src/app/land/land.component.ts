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
  public statusColorArr = [{ color: 'red', status: true},{ color:'green', status: true},{ color:'yellow', status: true}];
 
 
  constructor(private landService: LandService, private sortPipe:ArraySortPipe){
  }
 	public ngOnInit() {
   		this.land$ = this.landService.getLandData();
  	}

   public toggleStatusColor(event) {
   	let i = this.statusColorArr.findIndex(obj => obj.color == event.target.value);
   	    this.statusColorArr[i].status = event.target.checked ? true: false;
   }
}
