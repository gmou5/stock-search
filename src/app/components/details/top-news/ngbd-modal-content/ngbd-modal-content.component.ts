//import { APP_BASE_HREF } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './ngbd-modal-content.component.html',
  styleUrls: ['./ngbd-modal-content.component.css']
})
export class NgbdModalContentComponent implements OnInit, OnChanges{

  @Input() source:string;
  @Input() date:string;
  @Input() title:string;
  @Input() description:string;
  @Input() url:string;

  @ViewChild('twttr') twttr: ElementRef;
  @ViewChild('fb') fb: ElementRef;


  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    
  }


  ngOnChanges(changes: SimpleChanges): void {
    
  }

  ngAfterViewInit(): void {
    const regex = /\'/g;
    const url = encodeURIComponent(this.url).replace(regex, '%27');
    const title = encodeURIComponent(this.title).replace(regex, '%27');
    this.twttr.nativeElement.href = `https://twitter.com/intent/tweet?ref_src=twsrc%5Etfw&text=${title}&url=${url}`;
    this.fb.nativeElement.href = `https://www.facebook.com/sharer/sharer.php?u=${url}&amp;src=sdkpreparse`;
    //console.log(url);
  }
 
  
}