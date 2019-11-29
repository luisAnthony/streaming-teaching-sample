import { Component, OnInit, OnDestroy, Inject, HostListener} from '@angular/core';
import { HttpEventType} from '@angular/common/http';
import { Router } from '@angular/router';
import { ExaminationService } from '../../../service/exam.service';
import { EXAM_TYPE } from '@entity/EXAM_TYPE';
import { EXAM_SUBJECT } from '@entity/EXAM_SUBJECT';
import { EXAM_QUESTION } from '@entity/EXAM_QUESTION';
import { EXAM_CHOICES } from '@entity/EXAM_CHOICES';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TokenStorageService } from 'src/app/auth/token-storage.service';
import { DialogBoxComponent } from '@component/dialogbox/dialogbox';
import { LogMessagingService } from '../../../service/log-messaging.service';

@Component({
    selector: 'student-exam',
    templateUrl: './student-exam.component.html',
    styleUrls: ['./student-exam.component.css']
  })

  export class StudentExamPageComponent implements OnInit ,OnDestroy{

    SERVER_URL: string = "https://192.168.1.75:8443";
    httpExamType: any;
    httpExamSubj: any;
    httpResult: any;
    examTypeList: EXAM_TYPE[] = [];
    examSubjList: EXAM_SUBJECT[] = [];
    examQueList: EXAM_QUESTION[] = [];
    examType_ID: number;
    examSubj_ID: number;
    isStartExam: boolean;
    exmTypeName: string;
    exmSubjName: string;
    mode: string
    resultScore: number;
    elem: any;
    hasleftApp: boolean;

    testMapping:{[k:string]:string} = {'=0': 'No msg', '=1': 'one msg', 'other':"# messages"};
    examTypeMap:any = {'Weekly Exam':'週考','Monthly Exam':'月考','Midterm Exam':'期中考', 'Final Exam':'期末考'}
    examSubjectMap:any = {'English':'英文', 'Math':'數學', 'Science':'科學'}

    pager = {
        index: 0,
        size: 1,
        count: 1
    };

    config = {
        allowBack : true,
        allowReview : true,
        pageSize : 1
    }

    dialogRef: MatDialogRef<DialogBoxComponent>;

    constructor(private examService: ExaminationService,
                private router: Router,
                private tokenStorage: TokenStorageService,
                private dialog: MatDialog,
                private logMsg: LogMessagingService,            
                @Inject(DOCUMENT) private document: any){
                    this.elem = this.document.documentElement;
                    this.getExamTypeList();
                    this.getExamSubjectList();                  
                }

    ngOnInit(){  
        this.hasleftApp = false;
        this.isStartExam = false;
        this.mode = 'quiz';
        this.addFullScreenEventHandler();
        this.resultScore = 0;
        console.log("this.testMapping:")
        console.log(this.testMapping);
    }    

    ngOnDestroy() {
      if(this.httpResult) this.httpResult.unsubscribe();
      if(this.httpExamSubj) this.httpExamSubj.unsubscribe();
      if(this.httpExamType) this.httpExamType.unsubscribe();
      if(this.elem) this.elem = null;
      if(this.document) this.document = null;
    }

    async getExamTypeList(){
        var self = this;
        this.httpExamType = await this.examService.getExamType()
        .subscribe(event => {
            if (event.type == HttpEventType.Response){
                console.log("Exam Type: ", event.body);
                
                let subjArr = event.body;

                self.examType_ID = subjArr[0].et_id;
                self.exmTypeName = subjArr[0].et_name;

                for(var value of subjArr){
                    self.examTypeList.push(new EXAM_TYPE(value.et_id, value.et_name));
                }                
            }
        });   
        
        console.log("Angular Exam Type List: ",this.examTypeList);
    }

    async getExamSubjectList(){
        var self = this;
        this.httpExamSubj = await this.examService.getExamSubject()
        .subscribe(event => {
            if (event.type == HttpEventType.Response){
                console.log("Exam Subject: ", event.body);
                
                let subjArr = event.body;

                self.examSubj_ID = subjArr[0].es_id;
                self.exmSubjName = subjArr[0].es_name;

                for(var value of subjArr){
                    self.examSubjList.push(new EXAM_SUBJECT(value.es_id, value.es_name));
                }
            }
        }); 

        console.log("Angular Exam Subject List: ",this.examSubjList);
    }

    async getQuestionList(examTypeId, examSubjId){
        var self = this;

        console.log("testing getting data from server spring boot!");
       
        this.httpResult = await this.examService.getExamQuestions(examTypeId,examSubjId)
            .subscribe(event => {
                if (event.type == HttpEventType.Response){
                    console.log("Exam Type: ", event.body);
                     
                    var queArr = event.body;
                    if(queArr.length > 2)
                    queArr = ExaminationService.shuffle(queArr);

                    self.pager.count = queArr.length;
                    for(var queVal of queArr){
                        let examOptions: EXAM_CHOICES[] = [];
                        let choArr = queVal.examChoices;
                        if(choArr.length > 2)
                        choArr = ExaminationService.shuffle(choArr);
                        for(var choVal of choArr){
                            examOptions.push(new EXAM_CHOICES(choVal.ec_id, choVal.ec_cho, choVal.ec_ans));
                        }
                        self.examQueList.push(new EXAM_QUESTION(queVal.eq_id,queVal.eq_desc, examOptions))
                    }                  
                }
            });          
        console.log("Angular Exam Question List: ",this.examQueList);    
    }

    updateExamTypeName(examType_ID){
        this.exmTypeName = this.examTypeList.find(x => x.id == examType_ID).name;
    }   

    updateExamSubjName(examSubj_ID){
        this.exmSubjName = this.examSubjList.find(x => x.id == examSubj_ID).name;
    }    

    startExam(){
        console.log("starting exam");
        console.log("exam type param: ", this.examType_ID);
        console.log("exam subject param: ", this.examSubj_ID);
        this.openFullscreen();
        this.examQueList = [];
        this.getQuestionList(this.examType_ID, this.examSubj_ID);
        this.isStartExam = true;
    }

    get filteredQuestions() {
        return (this.examQueList) ?
          this.examQueList.slice(this.pager.index, this.pager.index + this.pager.size) : [];
    }
    
    onSelect(question: EXAM_QUESTION, option: EXAM_CHOICES) {
         question.choices.forEach((x) => { if (x.id !== option.id) x.selected = false; });
        /*
        if (this.config.autoMove) {
          this.goTo(this.pager.index + 1);
        }
        */
    }
    
    goTo(index: number) {
        if (index >= 0 && index < this.pager.count) {
          this.pager.index = index;
        }
    }
    
    isAnswered(question: EXAM_QUESTION) {
        return question.choices.find(x => x.selected) ? '已作答' : '未作答';
    };
    
    isCorrect(question: EXAM_QUESTION) {
        return question.choices.every(x => x.selected === (x.answer===1)) ? '對' : '錯';
    };    

    onClickButton(){}

    closeConfirmation(){
        var self = this;
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        let strMessage: string = "你確定要離開測驗功能，回到學生面板嗎？";

        if(this.isStartExam)
            strMessage = "你確定要停止此次測驗並且離開嗎？ \n" + 
                         "請注意你將會回到學生面板並且將放棄此次測驗！！！\n\n"
        dialogConfig.data = {
            title: "離開確認",
            message:  strMessage,
            btnCaption: "否",
            type: "CONFIRM"
        };

        this.dialogRef = this.dialog.open(DialogBoxComponent, dialogConfig);
        this.dialogRef
            .beforeClosed()
            .subscribe(result => {
                if(result){
                    let date: Date = new Date();
                    let content: string = "Log message: 使用者停止測驗並離開線上測驗！ || " +
                                          "Current User: " + self.tokenStorage.getUsername() + " || " +
                                          "User Role: " + self.tokenStorage.getAuthorities().toString() + " || " +
                                          "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
                    let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
                        
                    self.logMsg.sendLogMessage(content,url);
                    self.removeFullScreenEventHandler();   
                    if(this.isExitFullScreen)
                      self.closeFullscreen();  
                    
                    self.backToMainBoard();
                } 
            });         
    }   
    
    exitFullScreenConfirmation(){
        var self = this;
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
    
        dialogConfig.data = {
            title: "離開全螢幕?",
            message:  "你是否要離開全螢幕停止測驗並離開呢？",
            btnCaption: "否",
            type: "CONFIRM"
        };
    
        this.dialogRef = this.dialog.open(DialogBoxComponent, dialogConfig);
        this.dialogRef
            .beforeClosed()
            .subscribe(result => {
                if(result){
                        let date: Date = new Date();
                        let content: string = "Log message: 使用者離開了全螢幕並停止測驗，線上測驗被關閉！ || " +
                                              "Current User: " + self.tokenStorage.getUsername() + " || " +
                                              "User Role: " + self.tokenStorage.getAuthorities().toString() + " || " +
                                              "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
                        let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
                        
                        self.logMsg.sendLogMessage(content,url);
                        self.removeFullScreenEventHandler();
                        
                        self.backToMainBoard();
                } else {
                  self.openFullscreen();  
                }
            });              
    }    

    backToMainBoard(){
        this.router.navigate(['student']);
    } 
    
    onSubmit() {
        let answers = [];
        this.examQueList
            .forEach(x => {
                answers.push({ 'examId': this.examType_ID + '_' + this.examSubj_ID, 'questionId': x.id, 'answered': x.answered })
                if (this.isCorrect(x) === '對') this.resultScore++;
            });
        
        console.log("answers: ", answers);
        // Post your data to the server here. answers contains the questionId and the users' answer.
        console.log("question: ",this.examQueList);
        this.mode = 'result';
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

    addFullScreenEventHandler(){
        var self = this;         
        this.document.addEventListener('fullscreenchange', self.fullScreenExitHandler.bind(self), false);
        this.document.addEventListener('webkitfullscreenchange', self.fullScreenExitHandler.bind(self), false);
        this.document.addEventListener('mozfullscreenchange', self.fullScreenExitHandler.bind(self), false);
        this.document.addEventListener('MSFullscreenChange', self.fullScreenExitHandler.bind(self), false);           
    }

    removeFullScreenEventHandler(){
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
             let content: string = "Log message: 使用者現在專注在線上測驗! || " +
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
         let content: string = "Log message: 使用者現在不再專注在線上測驗! || " +
                               "Current User: " + this.tokenStorage.getUsername() + " || " +
                               "User Role: " + this.tokenStorage.getAuthorities().toString() + " || " +
                               "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
         let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
          
         this.logMsg.sendLogMessage(content,url); 
         this.hasleftApp = true;
    }     
  }