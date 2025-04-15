import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TicketList } from '../../models/ticket-list';
import { TicketsService } from '../../services/tickets.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Ticket } from '../../models/ticket';
import { WebSocketService } from '../../services/web-socket.service';

@Component({
  selector: 'app-display-list',
  imports: [NgFor],
  templateUrl: './display-list.component.html',
  styleUrl: './display-list.component.css'
})
export class DisplayListComponent implements OnInit,OnDestroy {
  subs: Subscription = new Subscription();
  loading=false
  list: TicketList[] = [
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"CO","CO"),
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"P","Pediatria"),
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"C","Clinica"),
  ];

  constructor(private service:TicketsService, private webSocket:WebSocketService) {
    
  }
  ngOnInit(): void {
    this.charge();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  charge() {
    this.loading=true
    this.subs.add(
      this.service.getAll().subscribe({
        next: (value) => {
          this.list = value["data"];
        },
        error: (err) => {
          alert(
            'Error inesperado en el servidor, revise su conexion a internet'
          );
        },
        complete: ()=>{
          this.loading=false
        }
      })
    );

    
    this.subs.add(
      this.webSocket.getMessages().subscribe({
      next: (value) => {
        if(value["message"]["type"]=="update"){
          this.list = value["message"]["data"];
        }
      },
      error: (err) => {
        alert(
          'Error inesperado en el servidor, revise su conexion a internet'
        );
      },
    }))
  }

}
