import { Component, OnInit, OnDestroy} from '@angular/core';
import { HttpService } from '@service/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CacheService } from '@service/cache';
import { RE_SUBJECT } from '@entity/RE_SUBJECT';
import { MediaStreamingService } from '../../service/media-streaming.service';
import { WebsocketService } from '../../service/websocket.service';
import { TokenStorageService } from 'src/app/auth/token-storage.service';
import { Router } from '@angular/router';
//declare function isStreaming(): any;
//declare function setVideoSource(urlString: any): any;

const SERVER_URL: string = "http://192.168.1.75:8442";

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy{
  public userType = "default";
  public userTypesList = [
    {type: "Undefined"}, 
    {type: "Media Server"},
    {type: "Teacher"}, 
    {type: "Student"}
  ];

  roles: string[];

  streaming = false;

  subject: RE_SUBJECT = new RE_SUBJECT('Informational', 'Nissan XTerra', 'assets/Nissan Xterra Tailgate wont stay up_ Lift Support Shock Replacement video.mp4', 'video/mp4', 14);
  videos: RE_SUBJECT[] = [];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  cdate: Date = new Date();
  sec: number = 10;

  _RESCOUNT: number = 10; //稽核數量/題目數量
  _CLOFFSET: { idx: number, offset: number, claim: boolean }[] = [];
  auditList: boolean[] = [];

  minAllow: number = 60;
  auditFreq: number = 0;    //每個稽核分段的時間長度
  minPassage: number = 60;  //每個分段至少看完多少時間才開始計算跳出提示的機率
  
  constructor(
    public cacheService: CacheService,
    private httpService: HttpService,
    private httpClient: HttpClient,
    private streamService: MediaStreamingService,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    if ((typeof this.tokenStorage.getToken() === "string") && 
        (this.tokenStorage.getToken().length > 0)){
      this.roles = this.tokenStorage.getAuthorities();
      console.log()
      this.roles.every(role => {
        console.log(role);
        switch(role){
          case "ROLE_ADMIN": {
            this.userType = "Media Server";
            return false;
          }
          case "ROLE_TEACHER": {
            this.userType = "Teacher";
            return false;
          }
          case "ROLE_STUDENT": {
            this.userType = "Student";
            this.router.navigate(['student']);
            return false;
          }
          default: {
            this.userType = "Undefined";
            return true;
          }
        }
      });
    }    
  }

  ngOnInit() {
    console.log(this.userType);
    this.setUserType(this.userType);

    var video = document.getElementById('main-video');
    this.streamService.setVideo(video);
    if(this.userType == "Media Server")
      this.getVideos();
  }

  ngOnDestroy() {
    this.streamService.closeWebSocket();
  } 

  /*
  async getVideos() {
    this.videos = await this.httpService.get<RE_SUBJECT[]>('videos');
  }
  */

 async getVideos() {
  let getURL = `${SERVER_URL}/api/auth/getvideofile`;
  let videoList: Observable<string[]> = await <Observable<string[]>>this.httpClient.get(getURL);
  await videoList.subscribe(data => {
    let index = 0;
    for(let i = 0 ; i< data.length; i++){
      var fileName = data[i];
      var extension = fileName.split('.').pop();
      if(extension.toUpperCase() == "MP4"){
        this.videos[index] = new RE_SUBJECT("sample","sample",data[i],"video/mp4",10);
        index++;
      }
    }
  });
  console.log(this.videos);
  //this.videos = await this.httpService.get<RE_SUBJECT[]>('videos');
}

  setResource(count: number) {
    this._CLOFFSET.length = 0;
    this.auditList.length = count;
    for(let i = 0; i < count; i++)
      this.auditList[i] = false;
  }

  videoPlay(duration: number) {
    //this.myMethod();
    if (this.isWatching || duration < this.minAllow) return;
    this.setResource(this._RESCOUNT);
    this.auditFreq = Math.floor(duration / this._RESCOUNT);
    this.frameIdx = 0;
    this.duration = duration;
    this.aduitIdx = 0;
    this.frameIdx = 0;
    this.passageTime = 0;
    this.isWatching = true;
    let index = 0;
    while(this._CLOFFSET.length < this._RESCOUNT) {
      let idx = Math.floor(Math.random() * this._RESCOUNT);
      if (this._CLOFFSET.map(s => s.idx).indexOf(idx) >= 0) continue;
      this._CLOFFSET.push({
        idx: idx, 
        offset: Math.random() * (this.auditFreq - this.minPassage - 5) + this.auditFreq * index++ + this.minPassage, 
        claim: false
      });
    }
    console.log(this._CLOFFSET)
  }

  videoPause(currentTime: number) {
    //this.lastTimeupdate = currentTime;
  }

  videoEnded() {
    this.isWatching = false;
    this.passageTime = 0;
    this.lastTimeupdate = 0;
  }

  //使用者若跳轉影片進度，則段落的觀看時間長度清為零
  videoSeeked() {
    this.passageTime = 0;
    this.lastTimeupdate = this.perTimeupdate;
  }

  duration: number = 0;         //影片時間長度
  isWatching: boolean = false;  //正在觀看影片
  isClaimed: boolean = false;   //已通過檢核點
  aduitIdx: number = 0;
  frameIdx: number = 0;
  subTime: number = 0;          //目前分段開始的時間
  passageTime: number = 0;      //目前分段觀看的時間
  lastTimeupdate: number = 0;   //前一次影片更新的時間秒
  perTimeupdate: number = 0;
  
  /*
  this is a multiple line comment, 
  that works like java 
  */

  videoTimeupdate(currentTime: number) {
    if (!this.isWatching) return;
    this.perTimeupdate = currentTime;
    let aduitIdx = Math.ceil(currentTime / this.auditFreq);     //稽核順序
    if (aduitIdx !== this.aduitIdx) { //當稽核進度段落變更時
      this.aduitIdx = aduitIdx;
      this.lastTimeupdate = currentTime;
    } else {                          //當稽核進度段落仍在進行時
      this.passageTime = currentTime - this.lastTimeupdate;
    }
    let dataIdx = this.aduitIdx - 1;
    let data = this._CLOFFSET[dataIdx];
    if (!!data && !data.claim && currentTime > data.offset) {
     data.claim = true;
     console.log(`data.claim: ${currentTime}`);
    }
  }

  changeMainVideo(param: RE_SUBJECT){
    this.streaming = this.streamService.isStreaming();
    if (!this.streaming){
      let tempUrl: string = "";
      var strArray = param.video.split('.');
      for(let i = 0; i<strArray.length-1; i++){
        tempUrl = tempUrl + strArray[i];
        if(i < (strArray.length-2))
          tempUrl = tempUrl + ".";
      }
      tempUrl = tempUrl + "_HQ.webm";
      this.streamService.setVideoSource(tempUrl);
      this.subject = param;
    }
    else alert('you must stop the video first before selecting new video!!!');
  }

  setUserType(parUserType : string) {
    this.streaming = this.streamService.isStreaming();
    if(!this.streaming) {
      //this.userType = userType.value;
      this.streamService.setUserType(parUserType);
    } else {
      alert("you must stop the video first before selecting user type!!!");
    }
  }  

  setViewerListData(){
    //this.dropdownList = getViewersData();
  }

  showQuestion() {

  }
}