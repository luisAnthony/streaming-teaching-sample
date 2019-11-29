import { Injectable } from '@angular/core';
import { BehaviorSubject as RxSubject } from 'rxjs';
import { Observable as RxObservable } from 'rxjs';
import { Observer as RxObserver } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() {}

  private subject: RxSubject<MessageEvent>;
  private logSubject: RxSubject<MessageEvent>;
  private convertSubject: RxSubject<MessageEvent>;

  public connect(url): RxSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.subject;
  }

  public connectLog(url): RxSubject<MessageEvent> {
    if (!this.logSubject) {
      this.logSubject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.logSubject;
  }  

  public connectCnv(url): RxSubject<MessageEvent> {
    if (!this.convertSubject) {
      this.convertSubject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.convertSubject;
  } 

  private create(connectionUrl : string): RxSubject<MessageEvent> {
    let ws = new WebSocket(connectionUrl);

    let observable = RxObservable.create((obs: RxObserver<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          var jsonMessage = JSON.stringify(data);
          console.log('Sending message: ' + jsonMessage);          
          ws.send(jsonMessage);
        }
      }
    };
    return RxSubject.create(observer, observable);
  } 
}
