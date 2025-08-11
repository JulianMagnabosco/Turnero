import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TtsService {

  private baseUrl = 'http://'+environment.ttsUrl+"api/";

  constructor(private http: HttpClient) {
  }

  getTextToSpeech(text: string) {
    const url = `${this.baseUrl}text-to-speech?text=${encodeURIComponent(text)}`;
    return this.http.get(url, { responseType: 'blob'});
  }
}
