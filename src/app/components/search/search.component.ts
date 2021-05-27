import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
//import { startWith } from 'rxjs/operators';
import { tap, switchMap, finalize, startWith, debounceTime} from 'rxjs/operators';

import { SearchService } from '../../services/search.service'
import { Suggestion } from '../../models/Suggestion';




@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  control = new FormControl();
  //suggestions:Observable<Suggestion[]>;
  suggestions:Suggestion[];
  
  loading:boolean;

  constructor(private router: Router,
    private searchService:SearchService) {
      
  }

  ngOnInit(): void {
    
    //console.log(this.suggestions == undefined);
    // this.control.valueChanges.subscribe(value => {
    //   startWith(''),  
    //   console.log(value);
    //   this.suggestions = this.searchService.getAutocomplete(value);
    //   this.loading = true;
           
    // })
    this.control.valueChanges.pipe(
      debounceTime(300),
      tap(() => this.loading = true),
      
      switchMap(value => 
        this.searchService.getAutocomplete(value)
        .pipe(finalize(() => this.loading = false))
      )
    ).subscribe(data => {
        this.suggestions = data;
      });

  }
 

  onSubmit(){
    
    this.router.navigate(['/details', this.control.value]);
  }

}
