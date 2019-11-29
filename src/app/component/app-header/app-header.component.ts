import { Component, OnInit } from '@angular/core';
//import { JwtStorageService } from '@service/jwt-storage';
import { CacheService } from '@service/cache';
import { TokenStorageService } from 'src/app/auth/token-storage.service';
import { ValueTransformer } from '@angular/compiler/src/util';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { DialogBoxComponent } from '../dialogbox/dialogbox.component';
import { LogMessagingService } from '../../service/log-messaging.service';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { httpClientInMemBackendServiceFactory } from 'angular-in-memory-web-api';

declare function getStartTime(): any;
declare function setLoadDuration(param: any): any;

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit {
  username: string;
  authName: string;
  SERVER_URL: string = "https://192.168.1.75:8443/api/auth";

  constructor(
    private router: Router,
    private jwtService: TokenStorageService,
    public cacheService: CacheService,
    private dialog: MatDialog,
    private logMsg: LogMessagingService,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    console.log("load duration: ", ((new Date()).getTime() - getStartTime())/1000);
    setLoadDuration(((new Date()).getTime() - getStartTime())/1000);    
  }

  hasUserLoggedIn(): boolean{
    let uName: String = this.jwtService.getUsername();
    this.jwtService.getAuthorities().every(role => {
      switch(role){
        case "ROLE_ADMIN": {
          this.username = uName + " (管理者)";
          this.authName = "admin";
          return false;
        }
        case "ROLE_TEACHER": {
          this.username = uName + " (教師)";
          this.authName = "teacher";
          return false;
        }
        case "ROLE_STUDENT": {
          this.username = uName + " (學生)";
          this.authName = "student";
          return false;
        }
        default: {
          this.username = uName + " (未定義)";
          this.authName = "undefined";
          return true;
        } 
      }    
    });
    return (typeof this.username === "string") && (this.username.length > 0);
  }

  userLog_out(){
    var self = this;
    this.openDialog()
    .afterClosed()
    .subscribe(result => {
      if(result){
        let date: Date = new Date();
        let content: string = "Log message: 使用者登出系統！！ || " +
                              "Current User: " + self.username + " || " +
                              "User Role: " + self.jwtService.getAuthorities().toString() + " || " +
                              "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
        let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
        
        self.logMsg.sendLogMessage(content,url);        
        self.username = "";
        self.jwtService.signOut();
        self.router.navigate(['/login']);
      }
    }) ; 

  }

  openDialog(): MatDialogRef<DialogBoxComponent> {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
        title: "登出確認",
        message:  "是否要登出系統呢？",
        btnCaption: "No",
        type: "CONFIRM"
    };

    return this.dialog.open(DialogBoxComponent, dialogConfig);
  }   

  getUserDetails(){
    let getURL = `${this.SERVER_URL}/getUserDetails`;
    const httpParams = {username: `${this.jwtService.getUsername()}`};
    this.httpClient.get<any>(getURL, {
        observe: 'events',
        params: httpParams,
        responseType: 'json'
    }).subscribe(event => {
      if(event.type == HttpEventType.Response){
        console.log(event.body);
      }
    });
  }

  browseUploadPage(){
    this.router.navigate(['upload']);
  }

  browseChartPage(){
    this.router.navigate(['dash/class']);
  }

}
