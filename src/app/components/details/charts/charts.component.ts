import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
//import { ActivatedRoute, ParamMap } from '@angular/router'
import * as Highcharts from "highcharts/highstock";
import { Options } from "highcharts/highstock";
import HC_indicators from 'highcharts/indicators/indicators-all';
HC_indicators(Highcharts);
//import { SearchService } from '../../../services/search.service';


@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, OnChanges {

  @Input() symbol:string;
  @Input() data;

  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  chartOptions: Options = {
    rangeSelector: {
      selected: 2
    },

  subtitle: {
      text: 'With SMA and Volume by Price technical indicators'
  },

  yAxis: [{
      startOnTick: false,
      endOnTick: false,
      labels: {
          align: 'right',
          x: -3
      },
      title: {
          text: 'OHLC'
      },
      height: '60%',
      lineWidth: 2,
      resize: {
          enabled: true
      }
  }, {
      labels: {
          align: 'right',
          x: -3
      },
      title: {
          text: 'Volume'
      },
      top: '65%',
      height: '35%',
      offset: 0,
      lineWidth: 2
  }],

  tooltip: {
      split: true
  },

  plotOptions: {
      series: {
          dataGrouping: {
              units: [[
                'week',                         // unit name
                [1]                             // allowed multiples
              ], [
                'month',
                [1, 2, 3, 4, 6]
              ]],
          }
      }
  },

  series: []

  };

  
  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue ) {    
      this.handleUpdate(this.symbol, this.data);
    }
  }


  handleUpdate(symbol, data){

    this.chartOptions.title =  {
      text: symbol + ' Historical'
    };

    this.chartOptions.series = [{
      type: 'candlestick',
      name: symbol,
      id: symbol,
      zIndex: 2,
      data: data['ohlc']
    }, {
      type: 'column',
      name: 'Volume',
      id: 'volume',
      data: data['volume'],
      yAxis: 1
    }, {
      type: 'vbp',
      linkedTo: symbol,
      params: {
          volumeSeriesID: 'volume'
      },
      dataLabels: {
          enabled: false
      },
      zoneLines: {
          enabled: false
      }
    }, {
      type: 'sma',
      linkedTo: symbol,
      zIndex: 1,
      marker: {
          enabled: false
      }
    }]

    this.updateFlag = true;
  }



  constructor() { }
     

  ngOnInit(): void {
  }

}
