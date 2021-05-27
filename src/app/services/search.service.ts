import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { map } from "rxjs/operators";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Suggestion } from '../models/Suggestion';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  url:string = 'https://stock-search-921.wl.r.appspot.com';

  constructor(private http:HttpClient,
    private route: ActivatedRoute) { }

  getTicker(symbol:string):Observable<any> {
    return this.http.get<any>(`${this.url}/description/${symbol}`)   
  }

  getPrice(symbol:string):Observable<any> {
    return this.http.get<any>(`${this.url}/latestPrice/${symbol}`)      
  }

  getDailyData(symbol:string, date:string):Observable<any> {
    return this.http.get<any>(`${this.url}/dailyData/${symbol}/${date}`)      
  }

  getHistoricalData(symbol:string, date:string):Observable<any> {
    return this.http.get<any>(`${this.url}/historicalData/${symbol}/${date}`)      
  }

  getNews(symbol:string):Observable<any> {
    return this.http.get<any>(`${this.url}/news/${symbol}`)      
  }

  getAutocomplete(symbol:string):Observable<Suggestion[]> {
    
    return this.http.get<any>(`${this.url}/autocomplete/${symbol}`)      
  }

  
}
