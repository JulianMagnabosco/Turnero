import { DatePipe, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Cons, Subscription, timer } from 'rxjs';
import { Consult } from '../../models/consult';
import { environment } from '../../../environments/environment';
import { ConsultsService } from '../../services/consults.service';
import { WebSocketService } from '../../services/web-socket.service';

@Component({
  selector: 'app-consult-list',
  imports: [DatePipe, NgFor],
  templateUrl: './consult-list.component.html',
  styleUrl: './consult-list.component.css',
})
export class ConsultListComponent implements OnInit,OnDestroy {
  list: Consult[] = [];

  subs = new Subscription();

  loading = false;

  audio = new Audio();
  processing = false;
  consult?:Consult

  timeout: any;

  datetime = new Date();

  constructor(
    private service: ConsultsService
  ) {}
  ngOnInit(): void {
    this.audio.loop = true;
    this.charge();
    this.subs.add(
      timer(0, 1000).subscribe({
        next: (value) => {
          this.datetime = new Date();
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    clearInterval(this.timeout);
  }
  charge() {
    this.loading = true;
    this.startWS();
  }

  startHTTP() {
    this.subs.add(
      this.service.getConsults().subscribe({
        next: (value) => {
          // this.saveData(value['data']);
        },
        error: (err) => {
          console.error('Reintentando');
        },
        complete: () => {
          this.loading = false;
        },
      })
    );
  }

  startWS() {
    this.subs.add(
      this.service.getMessages().subscribe({
        next: (value) => {
          if (value['message']['type'] == 'update') {
            // this.saveData(value['message']['data']);
          } else if (value['message']['type'] == 'call') {
            this.list.push(value['message']);
            console.log('call');
          }
        },
        error: (err) => {
          console.error('Reintentando');
          this.charge();
        },
      })
    );
  }

  async startProcessing() {
    while (true) {
      if (!this.processing && this.list.length > 0) {
        this.consult = this.list.shift()!;
        this.processing = true;
        await this.downloadAndPlayAudio(this.consult);
        this.processing = false;
      }
      await this.delay(500); // Espera medio segundo entre chequeos
    }
  }

  async downloadAndPlayAudio(data: Consult): Promise<void> {
    try {
      // Suponé que tu backend devuelve un archivo de audio para un texto:
      const text = `Llamando a ${data.patient} al consultorio ${data.room}`;
      const audioUrl = `${environment.ttsUrl}/api/text-to-speech?text=${encodeURIComponent(text)}`;

      return new Promise<void>((resolve, reject) => {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          console.log('Finalizó:', text);
          resolve();
        };
        audio.onerror = (e) => {
          console.error('Error al reproducir:', e);
          resolve(); // igual continuamos con el siguiente
        };
        audio.play();
      });
    } catch (e) {
      console.error('Error al descargar o reproducir:', e);
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
