import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Highcharts from "highcharts/highstock";
import { Options } from "highcharts/highstock";
//import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit, OnChanges{

  @Input() descr;
  @Input() latestPrice;
  @Input() dailyPrice;
  @Input() changeColor;
  @Input() marketStatus;

  mid:string;
  symbol:string;
  color:string;

  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  chartOptions: Options = {
    
    rangeSelector: {
      enabled: false
    },

    series: [
      {
        type: 'line'
      }     
    ]

    
  };


  ngOnChanges(changes: SimpleChanges) {
    //console.log(changes.dailyPrice);
    //console.log(changes.dailyPrice.currentValue);
    if (changes.dailyPrice && changes.dailyPrice.currentValue ) {
      //console.log('change work');
      this.handleUpdate(this.descr, this.dailyPrice, this.changeColor);
    }
  }

  handleUpdate(descr, dailyPrice, changeColor) {
    //console.log('update work');
    this.chartOptions.title =  {
      text: descr['ticker']
    };

    this.chartOptions.navigator = {
      series: {
        color: changeColor,
      }
    }

    this.chartOptions.plotOptions = {
      series: {
        color: changeColor,
      }
    }

    this.chartOptions.series[0] = {
      type: 'line',
      name: descr['ticker'],
      data: dailyPrice,
      tooltip: {
        valueDecimals: 2
      }
    }

    this.updateFlag = true;
  }
 

  constructor() { }


  ngOnInit(): void {

  }

  
  
  
}
