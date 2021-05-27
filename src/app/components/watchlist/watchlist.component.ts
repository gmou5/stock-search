import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
//import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  watchlist = JSON.parse(localStorage.getItem("watchlist"));
  items = [];
  loading:boolean;
  empty:boolean = false;

  constructor(private searchService:SearchService,
    private router: Router) { }

  ngOnInit(): void {

    this.loading = true;
    if(this.watchlist == null || this.watchlist.length == 0){
      this.loading = false;
      this.empty = true;
      return;
    }
    let arr = [];
    let tickers = '';
    for(let i = 0; i < this.watchlist.length; i++){
      arr.push(this.watchlist[i]['ticker']);     
    }
    arr.sort();
    //console.log(arr);
    for(let i = 0; i < arr.length; i++){    // 用arr.join()方法
      tickers += arr[i] + ',';
    }


    this.searchService.getPrice(tickers).subscribe(data => { 
      this.loading = false;

      for(let i = 0; i < arr.length; i++){
        //console.log(arr.length);
        let j = 0
        for(; j < data.length; j++){
          if(arr[i] == data[j]['ticker']){
            break;
          }                   
        }


        // watchlist是array，可以每次向watchlist里面存值时先sort好，然后下面这一步就不用做了
        // 因为arr里的ticker顺序和watchlist是一一对应的
        let k = 0;
        for(; k < this.watchlist.length; k++){
          if(arr[i] == this.watchlist[k]['ticker']){
            break; 
          }                   
        }

        let diff:number = data[j]['last']*100 - data[j]['prevClose']*100;
        let change = (diff/100).toFixed(2);
        let changePercentage = (diff / data[j]['prevClose']).toFixed(2);
        let color:string;
        if( diff > 0 ){
          color = 'green';
        }else if(diff < 0){
          color = 'red';
        }else{
          color = 'black';
        }

        //console.log(name);
        this.items.push({
          ticker: arr[i],
          name: this.watchlist[k]['name'],
          lastPrice: data[j]['last'],
          change: change,
          changePercentage: changePercentage,
          color: color,
          show: true
        });       

      }
      
    
    })
  }


  openDetails(ticker){
    this.router.navigate(['/details', ticker]);
  }

  remove(item){
    item.show = false;
    
    let index = 0;
    for(let i = 0; i < this.watchlist.length; i++){
      if(this.watchlist[i]['ticker'] == item.ticker){
        //console.log(this.items[i]['show']);
        index = i;
      }
    }
    this.watchlist.splice(index, 1);
    localStorage.setItem("watchlist", JSON.stringify(this.watchlist));

    if(this.watchlist.length == 0){
      this.empty = true;
    }
    
  }

}
