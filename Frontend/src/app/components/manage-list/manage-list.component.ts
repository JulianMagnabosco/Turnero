import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TicketList } from '../../models/ticket-list';
import { TicketsService } from '../../services/tickets.service';
import { Ticket } from '../../models/ticket';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-manage-list',
  imports: [NgFor],
  templateUrl: './manage-list.component.html',
  styleUrl: './manage-list.component.css'
})
export class ManageListComponent  implements OnInit,OnDestroy {
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
