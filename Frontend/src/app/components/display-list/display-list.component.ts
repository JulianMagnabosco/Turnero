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
  styleUrl: './display-list.component.css',
})
export class DisplayListComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();
  loading = false;
  list: TicketList[] = [
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"CO","CO"),
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"P","Pediatria"),
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"C","Clinica"),
  ];
  audio = new Audio('music.wav');

  timeout: any;
  timer = 5;
  constructor(
    private service: TicketsService,
    private webSocket: WebSocketService
  ) {}
  ngOnInit(): void {
    this.audio.loop=true
    this.charge();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  charge() {
    this.loading = true;
    this.subs.add(
      this.service.getAll().subscribe({
        next: (value) => {
          this.list = value['data'];
        },
        error: (err) => {
          alert(
            'Error inesperado en el servidor, revise su conexion a internet'
          );
        },
        complete: () => {
          this.loading = false;
        },
      })
    );

    this.subs.add(
      this.webSocket.getMessages().subscribe({
        next: (value) => {
          console.log(value)
          if (value['message']['type'] == 'update') {
            this.saveData(value['message']['data']);
          } else if (value['message']['type'] == 'call') {
            this.callticket(value['message']);
          }
        },
        error: (err) => {
          alert(
            'Error inesperado en el servidor, revise su conexion a internet'
          );
        },
      })
    );
  }

  callticket(data: any) {
    this.list.forEach((l) => {
      if (l.id == data["line"]) {
        const ticket = new Ticket(data["number"])
        console.log(ticket)
        l.selectedTicket = ticket;
        this.audio.play();

        clearTimeout(this.timeout);
        setTimeout(() => {
          l.selectedTicket = undefined;
        }, this.timer * 1000);
        this.timeout = setTimeout(() => {
          this.audio.pause();
        }, this.timer * 1000);
        return
      }
    });
  }

  unsetSelected(line: TicketList) {
    line.selectedTicket = undefined;
    this.audio.pause();
  }

  saveData(data: any) {
    let newList: TicketList[] = data;
    newList.forEach((line) => {
      let oldLine = this.list.find((e) => {
        return e.code == line.code;
      });
      line.tickets.map((t) => {
        t.selected = false;
        return t;
      });
      if (oldLine) {
        oldLine.tickets = line.tickets;
      } else {
        this.list.push(line);
      }
    });
  }
}
