import { DatePipe, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Cons, Subscription, timer } from 'rxjs';
import { Consult } from '../../models/consult';
import { environment } from '../../../environments/environment';
import { ConsultsService } from '../../services/consults.service';
import { WebSocketService } from '../../services/web-socket.service';
import { TtsService } from '../../services/tts.service';

@Component({
  selector: 'app-consult-list',
  imports: [DatePipe, NgFor],
  templateUrl: './consult-list.component.html',
  styleUrl: './consult-list.component.css',
})
export class ConsultListComponent implements OnInit, OnDestroy {
  list: Consult[] = [];
  calledList: Consult[] = [];

  subs = new Subscription();

  loading = false;

  audio = new Audio();
  processing = false;
  consult?: Consult;

  timeout: any;

  datetime = new Date();

  constructor(
    private service: ConsultsService,
    private ttsService: TtsService
  ) {}
  ngOnInit(): void {
    this.charge();
    this.subs.add(
      timer(0, 1000).subscribe({
        next: (value) => {
          this.datetime = new Date();
        },
      })
    );

    this.startProcessing();

    // this.ttsService.getTextToSpeech('texto').subscribe({
    //   next: (blob) => {
    //     const audioUrl = URL.createObjectURL(blob);
    //     const audio = new Audio(audioUrl);
    //     audio.onended = () => {
    //       URL.revokeObjectURL(audioUrl); // liberar memoria
    //       console.log('Audio reproducido correctamente');
    //     };
    //     audio.onerror = () => {
    //       console.error('Error al reproducir audio');
    //     };
    //     audio.play();
    //   },
    //   error: (err) => {
    //     console.error('Error al descargar audio:', err);
    //   },
    // });
  }
  charge() {
    this.loading = true;
    this.startHTTP();
    this.startWS();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    clearInterval(this.timeout);
  }

  startHTTP() {
    this.subs.add(
      this.service.getConsults().subscribe({
        next: (value) => {
          this.calledList = value['consults'];
          console.log(value);
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
            this.list.push(value['message']['data']);
          }
          console.log(value);
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
        this.calledList.push(this.consult);
        this.processing = true;
        await this.downloadAndPlayAudio(this.consult);
        this.processing = false;
      }
      await this.delay(500); // Espera medio segundo entre chequeos
    }
  }

  async downloadAndPlayAudio(data: Consult): Promise<void> {
    const text = `Llamando a ${data.patient} al consultorio ${data.room}`;
    return new Promise<void>((resolve) => {
      this.ttsService.getTextToSpeech(text).subscribe({
        next: (blob) => {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl); // liberar memoria
            resolve();
          };
          audio.onerror = () => {
            console.error('Error al reproducir audio');
            resolve();
          };
          audio.play();
        },
        error: (err) => {
          console.error('Error al descargar audio:', err);
          resolve();
        },
      });
    });
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
