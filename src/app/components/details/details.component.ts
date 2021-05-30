import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { ActivatedRoute, ParamMap } from '@angular/router'
//import { MatTabsModule } from '@angular/material/tabs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
//import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { tap, switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';



@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy{
  
  // pass to child component
  price;
  description;
  dailyPrice;
  historicalPrice;
  timer;

  // param
  symbol:string;
  
  // basic information
  ticker:string;
  name:string;
  exchangeCode:string;

  // price information
  lastPrice:number;
  prevClose:number;
  change:string;
  changePercentage:string;
  currentTime:string = new Date().toISOString();
  lastTime:string;
  lastTimeInSec:number;
  status:string;
  color:string;

  // watchlist
  watchlist = JSON.parse(localStorage.getItem("watchlist"));
  symbolPresent:boolean;

  // toast
  loading:boolean;
  addTicker:boolean = false;
  removeTicker:boolean = false;
  buyTicker:boolean = false;
  valid:boolean = true;

  // portfolio
  portfolio = JSON.parse(localStorage.getItem("portfolio"));
  quantity:number = 0;
  totalCost:string = '0.00';
  index:number;
  absent:boolean;

  constructor(private searchService:SearchService,
    private route: ActivatedRoute,
    private modalService: NgbModal) { }


  ngOnInit(): void {
    this.loading = true;

      this.route.paramMap.pipe(
        tap((params: ParamMap) => {
          this.symbol = params.get('symbol');  
        }),
        switchMap((params: ParamMap) => forkJoin([
          this.searchService.getTicker(params.get('symbol')),
          this.searchService.getPrice(params.get('symbol'))
        ])),
        tap(data => {
          this.getStockInfo(data[0])
          this.getStockPrice(data[1])
        }),
        switchMap(data => {
          let time = data[1][0]['timestamp'].substring(0,10);
          return forkJoin([
            this.searchService.getHistoricalData(this.symbol, time),
            this.searchService.getDailyData(this.symbol, time)
          ])
        })
      ).subscribe(priceData => {
          this.loading = false;
          this.dailyPrice = priceData[1];
          this.historicalPrice = priceData[0];
          this.getNewData()
      })

  
    this.symbolPresent= this.checkSymbol();
  }

  ngOnDestroy(): void {
    if(this.timer) {
      clearInterval(this.timer)
    }
  }

  
  getStockInfo(data){
    if(data['detail'] == 'Not found.'){
      this.loading = false;
      this.valid = false;
      return;
    }
    this.description = data;
    this.ticker = data['ticker'];
    this.name = data['name'];
    this.exchangeCode = data['exchangeCode'];
  }

  getStockPrice(lastPriceData) {
    this.price = lastPriceData; 
        
        this.lastPrice = lastPriceData[0]['last'];
        this.prevClose = lastPriceData[0]['prevClose'];
        let diff:number = this.lastPrice*100 - this.prevClose*100;
        this.change = (diff/100).toFixed(2);
        this.changePercentage = (diff / this.prevClose).toFixed(2); 
        if( diff > 0 ){
          this.color = 'green';
        }else if(diff < 0){
          this.color = 'red';
        }else{
          this.color = 'black';
        }
  
        this.lastTime = lastPriceData[0]['timestamp'];
        let lastTimeInSec:number = new Date(`${this.lastTime.substring(0,19)}Z`).getTime();
        let offset:number = 5*60*60*1000;
        //console.log(Date.now() - (offset + lastTimeInSec));
        if(Date.now() - (offset + lastTimeInSec) < 60000) {
          this.status = 'open';
        }else{
          this.status = 'closed';
        }
  
        this.currentTime = new Date().toISOString();

  }


  getNewData() {
    if(this.status === 'open') {
      this.timer = setInterval(() => {  // ngOnDestroy() 处理掉
        this.searchService.getPrice(this.symbol).pipe(
          tap( data => {          
            this.getStockPrice(data)
          }),
          switchMap( data => {
            let time = data[0]['timestamp'].substring(0,10);
            return this.searchService.getDailyData(this.symbol, time)
          })
        ).subscribe(priceData => {      
          this.dailyPrice = priceData;          
        })           
      }, 15000);   
    }
  }


  add(){
    this.symbolPresent = true;
    
    if(this.watchlist == null){
      this.watchlist = [];
    }
    this.watchlist.push({ticker: this.ticker, name: this.name});
    localStorage.setItem("watchlist", JSON.stringify(this.watchlist));

    this.removeTicker = false;
    this.addTicker = true;
    setTimeout(() => {
      this.addTicker = false;
    }, 5000);
  }

  remove(){
    this.symbolPresent = false;
    
    let index = 0;
    for(let i = 0; i < this.watchlist.length; i++){
      if(this.watchlist[i]['ticker'] == this.ticker){
        index = i;
      }
    }
    this.watchlist.splice(index, 1);
    localStorage.setItem("watchlist", JSON.stringify(this.watchlist));

    this.addTicker = false;
    this.removeTicker = true;
    setTimeout(() => {
      this.removeTicker = false;
    }, 5000);
  }



  checkSymbol(){
    if(this.watchlist == null){
      return false;
    }

    for(let i = 0; i < this.watchlist.length; i++){
      if(this.watchlist[i]['ticker'] == this.symbol){
        
        return true;
      }
    }

    console.log(this.symbol);
    return false;
  }



  openModal(content){
    
    const modalRef = this.modalService.open(content);
    
  }


  onChange(event){  // event 改成 value
    this.totalCost = (this.lastPrice*event).toFixed(2);
  }


  checkValue(value){
    if(value <= 0){
      return true;
    }else{
      return false;
    }
  }


  buy(){

    if(this.portfolio == null){
      this.portfolio = [];
    }

    this.checkAbsence();

    if(this.absent){
      this.portfolio.push({
        ticker: this.ticker,
        name: this.name,
        quantity: this.quantity,
        totalCost: this.totalCost
      });
      localStorage.setItem("portfolio", JSON.stringify(this.portfolio));
    }else{
      let stock = {
        ticker: this.ticker,
        name: this.name,
        quantity: this.quantity + this.portfolio[this.index]['quantity'],
        totalCost: (Number(this.totalCost) + Number(this.portfolio[this.index]['totalCost'])).toFixed(2)
      }
      this.portfolio[this.index] = stock;
      localStorage.setItem("portfolio", JSON.stringify(this.portfolio));
    }

    this.modalService.dismissAll('Buy click');

    this.buyTicker = true;
    setTimeout(() => {
      this.buyTicker = false;
    }, 5000);
  }


  checkAbsence(){
    for(let i = 0; i < this.portfolio.length; i++){
      if(this.portfolio[i]['ticker'] == this.ticker){
        this.index = i;
        this.absent = false;
        return;
      }
    }
    this.absent = true;
  }


}
