import { Injectable } from '@angular/core';
import { Observable as RxObservable, BehaviorSubject as RxSubject } from "rxjs"
import { map } from 'rxjs/operators';
import { WebsocketService } from "./websocket.service";

@Injectable({
    providedIn: 'root'
  })
  export class MediaConversionService {
    private wsMessages$: RxSubject<any>;
    private socketResponse: string;
    private completionPercentage: string;
    private userClass: any;

    constructor(wsService: WebsocketService){
        var self = this;
        const connectionUrl = "wss://192.168.1.75:8443/api/auth/MediaConversion";
        this.wsMessages$ = <RxSubject<any>>wsService.connectCnv(connectionUrl)
        .pipe(
          map((response: MessageEvent): any => {
            let parsedMessage = JSON.parse(response.data);
            console.info('Received message: ' + response.data);
            return parsedMessage;
          })
        );  
        this.wsMessages$.asObservable().subscribe(parsedMessage => {
          self.conversionResponse(parsedMessage);
        });        
    }

    private conversionResponse(msg: any){
        var self = this;
        if(msg.response == 'failure'){
            var errorMsg = msg.message ? msg.message : 'Unknow error';
            console.info('Conversion process interrupted for the following reason: ' + errorMsg);
          }  
        else {
            this.userClass.convertPercentage = msg.percentage;
            if(this.userClass.convertPercentage == '100' && msg.response == "complete"){
               this.userClass.openDialog()
                    .afterClosed()
                    .subscribe(result => {
                      if(result){
                          self.userClass.ngOnInit();
                      } else {
                          self.userClass.router.navigate(['/main']);
                      }
                    })               
            }
        }        
    }

    public getResponse() : string {
        return this.socketResponse;
    }

    public getCompletionPercentage(): string{
      return this.completionPercentage;
    }

    public startConversion(filename: string){
        var message = {
          file: filename
        }
        this.sendMessage(message);
      }
  
      private sendMessage(message){
        this.wsMessages$.next(message);
      } 

    public setUserClass(obj: any){
      this.userClass = obj;
    }

  }