import { DatePipe, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { Consult } from '../../models/consult';

@Component({
  selector: 'app-consult-list',
  imports: [DatePipe, NgFor],
  templateUrl: './consult-list.component.html',
  styleUrl: './consult-list.component.css'
})
export class ConsultListComponent implements OnInit {
  datetime:any=""
  list:Consult[]=[]

  subs=new Subscription

  ngOnInit(): void {
      this.subs.add(timer(0,1000).subscribe({
      next: (value)=>{
        this.datetime=new Date()
      }
    }))
  }
}
