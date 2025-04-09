import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TicketList } from '../../models/ticket-list';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-display-list',
  imports: [],
  templateUrl: './display-list.component.html',
  styleUrl: './display-list.component.css'
})
export class DisplayListComponent implements OnInit,OnDestroy {
  subs: Subscription = new Subscription();
  list: TicketList[] = [
  ];

  constructor(private service:TicketsService) {
  }
  ngOnInit(): void {
    this.charge();
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
          // alert(
          //   'Error inesperado en el servidor, revise su conexion a internet'
          // );
        },
      })
    );
  }

}
