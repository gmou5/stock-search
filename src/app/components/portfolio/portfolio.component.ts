import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
//import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
//import { NgbdModalPortfolioComponent } from './ngbd-modal-portfolio/ngbd-modal-portfolio.component'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  portfolio = JSON.parse(localStorage.getItem("portfolio"));
  items = [];
  loading:boolean;
  empty:boolean = false;
  
  ticker:string;
  price:number;
  name:string;
  button:string;
  currQuantity:number;
  quantity:number = 0;
  totalCost:string = '0.00';
  index:number;

  constructor(private searchService:SearchService,
    private router: Router,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.loading = true;
    this.getItems();
  }

  

  openDetails(ticker){
    this.router.navigate(['/details', ticker]);
  }

  openModal(content, item, button){
    this.ticker = item.ticker;
    this.price = item.lastPrice;
    this.name = item.name;
    this.currQuantity = item.quantity;
    this.button = button;

    const modalRef = this.modalService.open(content);
  }


  getItems(){
    if(this.portfolio == null || this.portfolio.length == 0){
      this.loading = false;
      this.empty = true;
      return;
    }

    let arr = [];
    let tickers = '';
    for(let i = 0; i < this.portfolio.length; i++){
      arr.push(this.portfolio[i]['ticker']);     
    }
    arr.sort();
    //console.log(arr);
    for(let i = 0; i < arr.length; i++){
      tickers += arr[i] + ',';
    }
    //console.log(tickers);

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

        let k = 0;
        for(; k < this.portfolio.length; k++){
          if(arr[i] == this.portfolio[k]['ticker']){
            break;
          }                   
        }

        let avgCost = (this.portfolio[k]['totalCost'] / this.portfolio[k]['quantity']).toFixed(2);
        let change = data[j]['last'] - Number(avgCost);
        let value = (this.portfolio[k]['quantity']*data[j]['last']).toFixed(2);
        
        let color:string;
        if(change.toFixed(2) == '0.00' || change.toFixed(2) == '-0.00'){
          change = 0.00;
          color = 'black';
        }else if(change < 0){
          color = 'red';
        }else{
          color = 'green';
        }

        this.items[i] = {
          ticker: arr[i],
          name: this.portfolio[k]['name'],
          quantity: this.portfolio[k]['quantity'],
          avgCost: avgCost,
          totalCost: this.portfolio[k]['totalCost'],
          change: change.toFixed(2),
          lastPrice: data[j]['last'].toFixed(2),
          value: value,
          color: color,
          
        };
        
      }
  
    })
  }

  onChange(event){
    this.totalCost = (this.price*event).toFixed(2);
  }


  checkValue(value){
    if(this.button == 'buy'){
      if(value <= 0){
        return true;
      }else{
        return false;
      }
    }else{
      if(value > 0 && value <= this.currQuantity){
        return false;
      }else{
        return true;
      }
    }
  }


  buy(){

    this.checkIndex();
    let stock = {
      ticker: this.ticker,
      name: this.name,
      quantity: this.quantity + this.portfolio[this.index]['quantity'],
      totalCost: (Number(this.totalCost) + Number(this.portfolio[this.index]['totalCost'])).toFixed(2)
    }
    this.portfolio[this.index] = stock;
    localStorage.setItem("portfolio", JSON.stringify(this.portfolio)); 
    
    this.portfolio = JSON.parse(localStorage.getItem("portfolio"));  // 这步应该不需要了
    this.getItems();
    
    this.modalService.dismissAll('Buy click');
    this.quantity = 0;

  }


  sell(){

    this.checkIndex();
    if(this.quantity == this.portfolio[this.index]['quantity']){
      
      for(let i = 0; i < this.items.length; i++){
        if(this.portfolio[this.index]['ticker'] == this.items[i]['ticker']){
          this.items.splice(i, 1);
          break;
        }
      }
      this.portfolio.splice(this.index, 1);

    }else{
      let preCost = Number(this.portfolio[this.index]['totalCost']);
      let avgCost = preCost / this.portfolio[this.index]['quantity'];
      let stock = {
        ticker: this.ticker,
        name: this.name,
        quantity: this.portfolio[this.index]['quantity'] - this.quantity,
        totalCost: (preCost - this.quantity*avgCost).toFixed(2)   // 为啥不是quantity*price？
      }
      this.portfolio[this.index] = stock;      
    }
    
    localStorage.setItem("portfolio", JSON.stringify(this.portfolio));    
    this.portfolio = JSON.parse(localStorage.getItem("portfolio"));
    //console.log(this.portfolio);
    this.getItems();

    this.modalService.dismissAll('Sell click');
    this.quantity = 0;
  }



  checkIndex(){
    for(let i = 0; i < this.portfolio.length; i++){
      if(this.portfolio[i]['ticker'] == this.ticker){
        this.index = i;     
      }
    }
  }


}
