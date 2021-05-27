import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router'
import { SearchService } from '../../../services/search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from '../../../models/Article';
import { NgbdModalContentComponent } from './ngbd-modal-content/ngbd-modal-content.component'

@Component({
  selector: 'app-top-news',
  templateUrl: './top-news.component.html',
  styleUrls: ['./top-news.component.css']
})
export class TopNewsComponent implements OnInit {

  symbol:string;
  articles:Article[] = [];
  


  constructor(private searchService:SearchService,
    private route: ActivatedRoute,
    private modalService: NgbModal) { 
      
    }


  ngOnInit(): void {
  
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.symbol = params.get('symbol');
      //console.log(this.symbol);
    })

    this.searchService.getNews(this.symbol).subscribe(data => {
      
      for(let i = 0; i < data.length; i++){

        this.articles.push({
          title: data[i]['title'],
          date: data[i]['publishedAt'].substring(0,10),
          source: data[i]['source']['name'],
          image: data[i]['urlToImage'],
          url: data[i]['url'],
          description: data[i]['description']
        });
        
      }
    });
                 
    
  }

  open(article){
    const modalRef = this.modalService.open(NgbdModalContentComponent);
    //console.log(article['date']);
    modalRef.componentInstance.source = article['source'];
    modalRef.componentInstance.date = article['date'];
    modalRef.componentInstance.title = article['title'];
    modalRef.componentInstance.description = article['description'];
    modalRef.componentInstance.url = article['url'];
    
    
  }

}
