import { Component, OnInit, Input } from '@angular/core';
import { MediaPlayerService } from '../../service/media-player.service';

const I_CAN_START = 0;
const I_CAN_STOP  = 1;
const I_AM_STARTING = 2;

declare function getLoadDuration(): any;

//declare function start_script() : any;
//declare function pause_script() : any;
//declare function resume_script() : any;
//declare function stop_script() : any;
//declare function getViewers(): any;

@Component({
  selector: 'app-video-stream',
  templateUrl: './video-stream.component.html',
  styleUrls: ['./video-stream.component.css']
})

export class VideoStreamComponent implements OnInit {

  private video: any;
  public style: any;
  private resolution: any;
  private videoLabel: any;

  private pauseText : string;
  public poster    : string;
  
  private playDisable    : boolean;
  private stopDisable    : boolean;
  private pauseDisable   : boolean;
  private checkDisable   : boolean;
  private connectDisable : boolean;
  private continue       : boolean;
  public canHaveHD       : boolean;

  //private userTypeHtmlTag: any;

  public dropdownList     = [];
  public selectedItems    = [];
  public dropdownSettings = {};

  @Input() userType : string;
  //@Input() dropdownList : [];

  constructor(private playerService: MediaPlayerService) {
      this.canHaveHD = (getLoadDuration() < 13);
  }

  ngOnInit() {
    this.continue = true;
    this.playDisable = false;
    this.stopDisable = true;
    this.pauseDisable = true;
    this.checkDisable = true;
    this.connectDisable = true;
    this.pauseText = "Pause";
    this.poster = "assets/webrtc.png";
    this.style = {};
    this.dropdownSettings = {
      singleSelection: false,
      text:"選擇觀看者",
      selectAllText:'全選',
      unSelectAllText:'取消全選',
      enableSearchFilter: true,
      classes:"myclass custom-class"
    };
    this.loadDefaultSettings();
  }

  ngOnChanges() {}

  loadDefaultSettings(){
    var self = this;
    this.playerService.setClassObject(this);
    this.video = document.getElementById('main-video');
    this.videoLabel = document.getElementById('start');
    //this.userTypeHtmlTag = document.getElementById('userType');
    this.resolution = document.getElementById('resType');
    self.video.controls = false;
    //if(self.userType ==  "Media Server"){
    //  self.video.addEventListener('ended', self.clickStopButton.bind(self));
    //  self.video.removeAttribute('autoplay');
      this.playerService.setVideo(self.video);
    //}
    //else {
    /*  this.canHaveHD = (getLoadDuration() < 13);
      if (this.resolution){
        this.resolution.value = this.canHaveHD ? 'HQ' : 'LQ';
        this.resolution.disabled = !this.canHaveHD;
        console.log(this.resolution.value);
      }*/

     // self.video.removeEventListener('ended', self.clickStopButton.bind(self));
    //}


  }

  clickStartButton() {
    //if (!this.video.getAttribute('src')){
    //  alert("請選擇一部影片")
    //  this.continue = false;
    //}
    //else {
      this.continue = true
    //}
    if(this.continue){
      //this.userTypeHtmlTag.disabled = true;
      this.playDisable = true;
      this.showSpinner();
      this.stopDisable = false;
    //this.videoLabel.innerHTML = '已建立連線';
     // if (this.userType == "Media Server"){
     //  this.connectDisable = false;
     //   this.checkDisable = false;
     // }
      //this.loadDefaultSettings();
      //this.streamService.setVideo(this.video);
      this.playerService.start();
    }
  }

  clickStopButton() {
   // this.userTypeHtmlTag.disabled = false;
    this.playDisable = false;
    this.stopDisable = true;
    this.pauseDisable = true;
    this.checkDisable = true;
    this.connectDisable = true;
    this.videoLabel.innerHTML = '建立連線';
    this.playerService.stop();
    this.hideSpinner();
  }

  showSpinner() {
    this.poster = "assets/transparent-1px.png";
    this.style = {
      'background-position' : 'center',
      'background-image' : "url('assets/spinner.gif')",
      'background-repeat' : 'no-repeat',
      'background-color' : 'transparent'
    };
  }

  hideSpinner() {
   // this.video.setAttribute('src','');
    this.video.load();
    this.poster = "assets/webrtc.png";
    this.style = {};
  }

  onItemSelect(item:any){
    console.log(item);
    console.log(this.selectedItems);
  }

  onItemDeSelect(item:any){
    console.log(item);
    console.log(this.selectedItems);
  }

  onSelectAll(items: any){
      console.log(items);
  }

  onDeSelectAll(items: any){
      console.log(items);
  }

  //checkViewerList(){
  //    this.streamService.checkViewers();
  //}
/*
  connectToViewers(){
    if(this.selectedItems){
      this.selectedItems.forEach((element) => {
          this.streamService.connectToEndPoint(<String>element.id);
      });
      this.videoLabel.innerHTML = '已連線 ...';
    } else {
      console.log("還沒有選擇觀看者，請選擇觀看者來連線");
      alert("還沒有選擇觀看者，請選擇觀看者來連線");
    }
  }

  viewTrackConstraints(){
    this.streamService.getConstraintsInfo();
  }  */

  setResolutionType(resType: any){
    if(this.playerService.isStreaming()){
      console.log("resolution: ", resType.value)
      this.playerService.setResolution(resType.value);
    }
  }

  /*clickToPlay(){
    this.streamService.requestPlayer();
    this.video.play();
  }*/

  togglePauseResume(){
    var toggle = document.getElementById('togglePauseResume');
    if(toggle.innerHTML == "暫停"){
      this.playerService.pause();
      toggle.innerHTML = "恢復";
      //this.video.pause();
    }
    else {
      this.playerService.resume();
      toggle.innerHTML = "暫停";
      //this.video.play();
    }
  }

}
