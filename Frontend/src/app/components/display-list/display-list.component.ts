import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TicketList } from '../../models/ticket-list';
import { TicketsService } from '../../services/tickets.service';
import { NgClass, NgFor } from '@angular/common';
import { Ticket } from '../../models/ticket';

@Component({
  selector: 'app-display-list',
  imports: [NgFor],
  templateUrl: './display-list.component.html',
  styleUrl: './display-list.component.css'
})
export class DisplayListComponent implements OnInit,OnDestroy {
  subs: Subscription = new Subscription();
  list: TicketList[] = [
    new TicketList([new Ticket(),new Ticket(),new Ticket()],"CO","CO"),
    new TicketList([new Ticket(),new Ticket(),new Ticket()],"P","Pediatria"),
    new TicketList([new Ticket(),new Ticket(),new Ticket()],"C","Clinica"),
  ];

  constructor(private service:TicketsService) {
    console.log(this.list)
  }
  ngOnInit(): void {
    // this.charge();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  charge() {
    this.subs.add(
      this.service.getAll().subscribe({
        next: (value) => {
          this.list = value;
        },
        error: (err) => {
          alert(
            'Error inesperado en el servidor, revise su conexion a internet'
          );
        },
      })
    );
  }

}
