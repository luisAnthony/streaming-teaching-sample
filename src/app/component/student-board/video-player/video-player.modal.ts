import { DOCUMENT } from '@angular/common';
import {Component, OnInit, ViewEncapsulation, Inject, OnDestroy, HostListener} from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef, MatDialog, MatDialogConfig} from '@angular/material'
import { TokenStorageService } from 'src/app/auth/token-storage.service';
import { DialogBoxComponent } from '@component/dialogbox/dialogbox';
import { LogMessagingService } from '../../../service/log-messaging.service';

const TOTALCOUNT: number = 60;
const IDLECOUNT: number = 10;

@Component({
    selector: 'app-video-modal',
    templateUrl: './video-player.modal.html',
    styleUrls: ['./video-player.modal.css'],
    encapsulation: ViewEncapsulation.None
})

export class VideoPlayerModal implements OnInit, OnDestroy {
    videoHtmlTag: any;
    videoUrl: string;
    category: string;
    interval: any;
    idleInterval: any;
    idleCounter: number;
    timeLeft: number;
    elem: any;
    hasleftApp: boolean;


    dialogRef: MatDialogRef<DialogBoxComponent>;

    constructor(
        private matDialogRef: MatDialogRef<VideoPlayerModal>,
        private tokenStorage: TokenStorageService,
        private dialog: MatDialog,
        private logMsg: LogMessagingService,
        @Inject(DOCUMENT) private document: any,
        @Inject(MAT_DIALOG_DATA) private data
    ){
        this.videoUrl = this.data.videoUrl;
        this.category = this.data.category;
        this.elem = this.document.documentElement;
    }

    ngOnInit(){
        var self = this;
        this.idleCounter = IDLECOUNT;
        this.timeLeft = TOTALCOUNT;
        this.hasleftApp = false;

        this.addFullScreenEventListener();

        this.videoHtmlTag = document.getElementById('vidPlayer');
        
        if(this.videoHtmlTag){
            this.videoHtmlTag.addEventListener("play", self.checkTimer.bind(self), false);
            this.videoHtmlTag.addEventListener("pause", self.pauseHandler.bind(self), false)
        }

        this.openFullscreen();

    }  
    
    ngOnDestroy(){
        this.elem = undefined;
        this.document = undefined;
    }

    close(){
        this.clearTimer(this.interval);
        this.clearTimer(this.idleInterval);
        this.matDialogRef.close();
    }

    closeConfirmation(){
        var self = this;
        const dialogConfig = new MatDialogConfig();

        this.videoHtmlTag.pause();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
    
        dialogConfig.data = {
            title: "你要關閉嗎？",
            message:  "你確定要停止播放影片並離開嗎？",
            btnCaption: "否",
            type: "CONFIRM"
        };
        self.clearTimer(self.interval);
        this.dialogRef = this.dialog.open(DialogBoxComponent, dialogConfig);
        this.dialogRef
            .beforeClosed()
            .subscribe(result => {
                if(result){
                    if(self.videoHtmlTag){
                        let date: Date = new Date();
                        let content: string = "Log message: 使用者停止播放影片並離開！ || " +
                                              "Current User: " + self.tokenStorage.getUsername() + " || " +
                                              "User Role: " + self.tokenStorage.getAuthorities().toString() + " || " +
                                              "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
                        let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
                        
                        self.logMsg.sendLogMessage(content,url);                        
                        self.videoHtmlTag.pause();
                        self.videoHtmlTag.src = "";
                        self.videoHtmlTag.load();
                    }
                    self.removeFullScreenEventListener();
                    self.closeFullscreen();
                    self.elem = null;
                    self.document = null;
                    self.close();                    
                } else {
                    if(self.videoHtmlTag.currentTime > 0)
                        self.videoHtmlTag.play();                   
                }
            });        
    }

    idleConfirmation() {
        var self = this;
        const dialogConfig = new MatDialogConfig();


        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
    
        dialogConfig.data = {
            title: "與我互動吧！",
            message:  "Hi, 你還在嗎？請按下確認鍵繼續！.\n\n" +
                      "[NOTE: 你需要在10秒內按下確認鍵，否則將停止播放影片並關閉！]" ,
            btnCaption: "確認",
            type: "WARN"
        };   
        
        this.videoHtmlTag.pause();
        self.idleTimer();

        this.dialogRef = this.dialog.open(DialogBoxComponent, dialogConfig);
            
        this.dialogRef
            .beforeClosed()
            .subscribe(result =>{
                if(result){
                    self.videoHtmlTag.play();
                    self.clearIdleHandler();
                    self.idleCounter = IDLECOUNT;
                    self.timeLeft = TOTALCOUNT;
                }
            });
    }

    exitFullScreenConfirmation(){
        var self = this;
        const dialogConfig = new MatDialogConfig();

        this.videoHtmlTag.pause();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
    
        dialogConfig.data = {
            title: "離開全螢幕?",
            message:  "你是否要離開全螢幕停止播放影片並離開呢？",
            btnCaption: "否",
            type: "CONFIRM"
        };
        self.pauseHandler();
        this.dialogRef = this.dialog.open(DialogBoxComponent, dialogConfig);
        this.dialogRef
            .beforeClosed()
            .subscribe(result => {
                if(result){
                    if(self.videoHtmlTag){
                        let date: Date = new Date();
                        let content: string = "Log message: 使用者離開全螢幕並停止播放影片，播放影片被強制關閉！ || " +
                                              "Current User: " + self.tokenStorage.getUsername() + " || " +
                                              "User Role: " + self.tokenStorage.getAuthorities().toString() + " || " +
                                              "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
                        let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
                        
                        self.logMsg.sendLogMessage(content,url);                        
                        self.videoHtmlTag.pause();
                        self.videoHtmlTag.src = "";
                        self.videoHtmlTag.load();
                    }
                    self.removeFullScreenEventListener();
                    self.elem = null;
                    self.document = null;
                    self.close();                   
                } else {
                    self.openFullscreen();
                    if(self.videoHtmlTag.currentTime > 0)
                        self.videoHtmlTag.play();
                }
            });              
    }

    checkTimer() {
        var self = this;
        console.log(this.interval);
        if (!this.interval){
            this.interval = setInterval(()=> {
                if(self.timeLeft > 0) {
                    self.timeLeft--;
                    console.log(self.timeLeft);
                } else {
                    self.pauseHandler();
                    self.idleConfirmation();
                }
            },1000);
        }
    }

    idleTimer() {
        var self = this;
        if(!this.idleInterval){
            this.idleInterval = setInterval(() => {
                if(self.idleCounter > 0) {
                    self.idleCounter--;
                } else {
                    if(self.videoHtmlTag){
                        self.videoHtmlTag.pause();
                        self.videoHtmlTag.src = "";
                        self.videoHtmlTag.load();
                    }
                    let date: Date = new Date();
                    let content: string = "Log message: 使用者好像在觀看影片時發呆了，播放影片被強制關閉囉！ || " +
                                        "Current User: " + self.tokenStorage.getUsername() + " || " +
                                        "User Role: " + self.tokenStorage.getAuthorities().toString() + " || " +
                                        "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
                    let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
                    
                    self.logMsg.sendLogMessage(content,url);
                    self.removeFullScreenEventListener();
                    self.closeFullscreen();
                    self.elem = null;
                    self.document = null;
                    self.dialogRef.close()
                    self.close();               
                }
            },1000);
        }
    }

    pauseHandler(){
        this.clearTimer(this.interval);
        this.interval = undefined;
    }

    clearIdleHandler(){
        this.clearTimer(this.idleInterval);
        this.idleInterval = undefined;       
    }

    clearTimer(obj: any){
        clearInterval(obj);
    }  
    
    openFullscreen() {
        if (this.elem.requestFullscreen) {
          this.elem.requestFullscreen();
        } else if (this.elem.mozRequestFullScreen) {
          /* Firefox */
          this.elem.mozRequestFullScreen();
        } else if (this.elem.webkitRequestFullscreen) {
          /* Chrome, Safari and Opera */
          this.elem.webkitRequestFullscreen();
        } else if (this.elem.msRequestFullscreen) {
          /* IE/Edge */
          this.elem.msRequestFullscreen();
        }
      }
    
      /* Close fullscreen */
    closeFullscreen() {
        if (this.document.exitFullscreen) {
          this.document.exitFullscreen();
        } else if (this.document.mozCancelFullScreen) {
          /* Firefox */
          this.document.mozCancelFullScreen();
        } else if (this.document.webkitExitFullscreen) {
          /* Chrome, Safari and Opera */
          this.document.webkitExitFullscreen();
        } else if (this.document.msExitFullscreen) {
          /* IE/Edge */
          this.document.msExitFullscreen();
        }
    }   

    addFullScreenEventListener(){
        var self = this;       
        this.document.addEventListener('fullscreenchange', self.fullScreenExitHandler.bind(self), false);
        this.document.addEventListener('webkitfullscreenchange', self.fullScreenExitHandler.bind(self), false);
        this.document.addEventListener('mozfullscreenchange', self.fullScreenExitHandler.bind(self), false);
        this.document.addEventListener('MSFullscreenChange', self.fullScreenExitHandler.bind(self), false);           
    }

    removeFullScreenEventListener(){
        var self = this;         
        this.document.removeEventListener('fullscreenchange', self.fullScreenExitHandler.bind(self), false);
        this.document.removeEventListener('webkitfullscreenchange', self.fullScreenExitHandler.bind(self), false);
        this.document.removeEventListener('mozfullscreenchange', self.fullScreenExitHandler.bind(self), false);
        this.document.removeEventListener('MSFullscreenChange', self.fullScreenExitHandler.bind(self), false); 
    } 
      
    fullScreenExitHandler(){
        if (this.isExitFullScreen()){
            this.exitFullScreenConfirmation();
        }
    }     

    isExitFullScreen(): boolean {
        return this.document ? (!this.document.fullscreenElement && !this.document.webkitIsFullScreen && !this.document.mozFullScreen && !this.document.msFullscreenElement) : false;
    }

    @HostListener('window:focus', ['$event'])
    focusEventHandler(event: FocusEvent){
        if(this.hasleftApp){
            let date: Date = new Date();
            let content: string = "Log message: 使用者再次專注在影片學習！ || " +
                                "Current User: " + this.tokenStorage.getUsername() + " || " +
                                "User Role: " + this.tokenStorage.getAuthorities().toString() + " || " +
                                "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
            let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
            
            this.logMsg.sendLogMessage(content,url);   
            this.hasleftApp = false;
        }       
    }

    @HostListener('window:blur', ['$event'])
    blurEventHandler(event: FocusEvent){
        this.blurAction();
    } 
    
    @HostListener('window:keydown',['$event'])
    onKeyPress($event: KeyboardEvent) {
        if(($event.altKey || $event.metaKey) && $event.keyCode == 84)
            this.blurAction();
    }

    blurAction(){
        let date: Date = new Date();
        let content: string = "Log message: 使用者似乎不再專注於影片學習! || " +
                                "Current User: " + this.tokenStorage.getUsername() + " || " +
                                "User Role: " + this.tokenStorage.getAuthorities().toString() + " || " +
                                "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
        let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
        
        this.logMsg.sendLogMessage(content,url); 
        this.hasleftApp = true;
    }

}