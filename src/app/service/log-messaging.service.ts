import { Injectable } from '@angular/core';
import { Observable as RxObservable, BehaviorSubject as RxSubject } from "rxjs"
import { map } from 'rxjs/operators';
import { WebsocketService } from "./websocket.service";

@Injectable({
    providedIn: 'root'
  })
  export class LogMessagingService {
    private wsMessages$: RxSubject<any>;

    constructor(wsService: WebsocketService){
        var self = this;
        const connectionUrl = "wss://192.168.1.75:8443/api/auth/LogService";
        this.wsMessages$ = <RxSubject<any>>wsService.connectLog(connectionUrl)
        .pipe(
          map((response: MessageEvent): any => {
            let parsedMessage = JSON.parse(response.data);
            console.info('Received message: ' + response.data);
            return parsedMessage;
          })
        );  
        this.wsMessages$.asObservable().subscribe(parsedMessage => {
          self.logResponse(parsedMessage);
        });            
    }

    private logResponse(msg: any){
      if(msg.response != 'accepted'){
        var errorMsg = msg.message ? msg.message : 'Unknow error';
        console.info('logging service denied for the following reason: ' + errorMsg);
      }  
      else {
        console.info('log successfully saved');
      }   
    }

    public sendLogMessage(content: string, filename: string){
      var message = {
        id: 'log',
        msg: content,
        file: filename
      }
      this.sendMessage(message);
    }

    private sendMessage(message){
      this.wsMessages$.next(message);
    }    

  }