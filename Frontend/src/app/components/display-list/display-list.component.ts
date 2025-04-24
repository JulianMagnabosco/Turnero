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

  calledTicket:Ticket|undefined;
  list: Ticket[] = [
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
          console.error("Reintentando")
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
            this._callticket(value['message']);
          }
        },
        error: (err) => {
          console.error("Reintentando")
          this.charge()
        },
      })
    );
  }

  // callticket() {
  //   let message = {
  //     type: 'call',
  //     id: this.list[0].id,
  //     number: this.list[0].number
  //   };

  //   this.calledTicket = new Ticket(this.list[0].code,this.list[0].number,this.list[0].code);
  //   clearTimeout(this.timeout);
  //   this.timeout = setTimeout(() => {
  //     this.unsetSelected();
  //   }, this.timer * 1000);

  //   this.webSocket.sendMessage({ message: message });
  // }

  _callticket(data: any) {
    this.calledTicket = new Ticket(data['code'],data['number'],data['user']);
    this.playSound();

    clearTimeout(this.timeout);
    setTimeout(() => {
      this.calledTicket = undefined;
    }, this.timer * 1000);
    
    this.timeout = setTimeout(() => {
      this.stopSound();
    }, this.timer * 1000);
  }

  playSound(){
    try{
      this.audio.play();
    }catch{
      console.error("Error de audio")
    }
  }
  stopSound(){
    try{
      this.audio.pause();
    }catch{
      console.error("Error de audio")
    }
  }

  saveData(data: any) {
    let newList: Ticket[] = data;
    newList.forEach((ticket) => {
      let findTicket = this.list.find((e) => {
        return e.id == ticket.id;
      });
      if(findTicket){
        ticket.selected=findTicket.selected
      }
    });
    this.list=newList;
  }
}
