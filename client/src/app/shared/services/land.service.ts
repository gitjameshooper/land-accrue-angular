import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import 'rxjs/Rx';

@Injectable()
export class LandService {
  
  constructor(private http: HttpClient) {
    
  }

  // Get Land Data
  public getLandData(): Observable<any> {
      return this.http.get('assets/json/total.json') 
        .pipe(
            tap(data => data), 
            catchError(err => {return Observable.throw(err);})
        );
  }

  
}