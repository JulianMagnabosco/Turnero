import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TicketList } from '../../models/ticket-list';
import { TicketsService } from '../../services/tickets.service';
import { Ticket } from '../../models/ticket';
import { NgFor, NgIf } from '@angular/common';
import { WebSocketService } from '../../services/web-socket.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-manage-list',
  imports: [NgFor,NgIf],
  templateUrl: './manage-list.component.html',
  styleUrl: './manage-list.component.css',
})
export class ManageListComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();
  loading = false;
  hasSelections=false

  calledTicket:Ticket|undefined;
  lastSelectedTicket:Ticket|undefined;
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
    this.audio.loop = true;
    this.charge();
    // this.subs.add(
    //   this.activeRoute.queryParams.subscribe({
    //     next: (value)=>{
    //       this.listSelected=value["code"]||""
    //     }
    //   })
    // )
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  charge() {
    console.log(this.subs);
    this.loading = true;
    this.subs.add(
      this.service.getAll().subscribe({
        next: (value) => {
          this.saveData(value["data"])
        },
        error: (err) => {
          // alert(
          //   'Error inesperado en el servidor, revise su conexion a internet'
          // );
          // this.charge()
          // return
        },
        complete: ()=>{
          this.loading=false
        }
      })
    );

    this.subs.add(
      this.webSocket.getMessages().subscribe({
        next: (value) => {
          console.log(value);
          if (value['message']['type'] == 'update') {
            this.saveData(value['message']['data']);
          } else if (value['message']['type'] == 'call') {
            this._callticket(value['message']);
          }
        },
        error: (err) => {
          alert(
            'Error inesperado en el servidor, revise su conexion a internet'
          );
          this.charge();
        },
        complete: () => {
          this.loading = false;
        },
      })
    );
  }

  selectTicket(
    event: PointerEvent | MouseEvent,
    ticket: Ticket
  ) {
    if (event.shiftKey) {
      const firstItem = this.lastSelectedTicket
      if (firstItem) {
        const firstIndex = this.list.indexOf(firstItem);
        const secondIndex = this.list.indexOf(ticket);
        const startIndex = Math.min(firstIndex, secondIndex);
        const endIndex = Math.max(firstIndex, secondIndex);
        this.list.slice(startIndex, endIndex).forEach((v) => {
          v.selected = true;
        });
      } else {
        ticket.selected = true;
      }
    } else {
      ticket.selected = !ticket.selected;
    }

    this.lastSelectedTicket=ticket
    this.hasSelections = !!this.list.find((t) => {
      return t.selected;
    });
  }

  deleteSelected() {
    let message = {
      type: 'dellist',
      tickets: this.list
        .filter((t) => {
          return t.selected;
        })
        .map((t) => {
          return { id: t.id };
        }),
    };
    this.hasSelections = false;
    this.lastSelectedTicket = undefined;

    this.webSocket.sendMessage({ message: message });
  }

  callticket() {
    let message = {
      type: 'call',
      id: this.list[0].id,
      number: this.list[0].number,
      code: this.list[0].code,
      user: this.list[0].user
    };

    this.calledTicket = new Ticket(this.list[0].code,this.list[0].number,this.list[0].user);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.unsetSelected();
    }, this.timer * 1000);

    this.webSocket.sendMessage({ message: message });
  }

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

  addticket(code: string) {
    let message = {
      type: 'add',
      code: code,
    };

    this.webSocket.sendMessage({ message: message });
  }

  deleteTicket(id: number) {
    let message = {
      type: 'del',
      id: id,
    };

    this.webSocket.sendMessage({ message: message });
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

  unsetSelected() {
    this.calledTicket = undefined;
    this.stopSound();
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
