import { Injectable } from '@angular/core';
import { Observable as RxObservable, BehaviorSubject as RxSubject } from "rxjs"
import { map } from 'rxjs/operators';
import { WebsocketService } from "./websocket.service";
import * as kurentoUtils from "kurento-utils";
import { MediaRecordingService } from './media-recording.service';

const app_protocol     = "http://";
const app_ip_address 	 = "192.168.1.75";
const app_port         = "4200";
const default_mediaURL = "assets/Addiction_HQ.webm";
const socket_protocol = "wss://";			   // socket protocol for signalling to server (secure)
const server_port     = "8443";					 // port which backend server listens
const server_api      = "api/auth/MediaBroadCast";// API for the media player

const I_CAN_START   = 0;
const I_CAN_STOP    = 1;
const I_AM_STARTING = 2

const iceConfig = {'iceServers':[
                    {
                      'urls':'turn:192.168.1.75:3478',
                      'credential':'rtcpass',
                      'username':'rtcuser'
                    }]
                  }

const defaultConstraints: any = {
  audio: true,
  video: {
      width: 1280,
      height: 720,
      framerate: 30
  }
}

@Injectable({
  providedIn: 'root'
})
export class MediaStreamingService {
  private wsMessages$: RxSubject<any>;
  private webRtcPeer: any;
  private state: number;
  private streamStatus: boolean = false;
  private userType: string;
  private video: any;
  private classObject: any;
  private mediaSourceURL: String;

  constructor(wsService: WebsocketService,
              private recorderService: MediaRecordingService) { 
    var connectionUrl = socket_protocol +
                        app_ip_address  + ':' +
                        server_port     + '/' +
                        server_api;
    var self = this;
    //this.connection = wsService.connect(connectionUrl);
     this.wsMessages$ = <RxSubject<any>>wsService.connect(connectionUrl)
       .pipe(
         map((response: MessageEvent): any => {
           let parsedMessage = JSON.parse(response.data);
           console.info('Received message: ' + response.data);
           return parsedMessage;
         })
       );    
    this.wsMessages$.asObservable().subscribe(parsedMessage => {
      switch (parsedMessage.id) {
        case 'presenterResponse':
        case 'viewerResponse':
            self.offerResponse(parsedMessage);
            break;
        case 'iceCandidate':
            self.webRtcPeer.addIceCandidate(parsedMessage.candidate, function(error) {
              if (error) return console.error('Error adding candidate: ' + error);
            });
          break;
        case 'streamResponse':	
          self.streamResponse(parsedMessage);
          break;
        case 'checkViewerResponse':
          self.checkViewerResponse(parsedMessage);
          break;
        case 'connectionResponse':
          self.connectEndpointResponse(parsedMessage);
          break;	
        case 'senderHasStopCommunication':
          self.senderEndsConnection();	
          break;
        case 'viewerHasStopCommunication':
          self.viewerEndsConnection();
          break;
        case 'stopBeingPresenter':
          self.senderDisconnected();
          break;
        case 'streamIsPlayable':
          self.viewerPlayStream();
        break;
        case 'videoInfo':
          self.showVideoData(parsedMessage);
        break;
        case 'playerResponse':
          self.playerResponse();
          break;
        default:
          if (self.state == I_AM_STARTING) {
            console.log('default');
          }
          self.onError('Unrecognized message'+ parsedMessage);
      }
    });
    this.userType = 'default';
    this.video = null;
    this.mediaSourceURL = app_protocol 	+ 
                          app_ip_address + ':' + 
                          app_port 		   + '/' +
                          default_mediaURL; 
  }

  public start(){
    var options;
    var self = this;
    if(!this.webRtcPeer){

      console.log('Creating WebRtcPeer and generating local sdp offer ...');

      if(this.userType == "Media Server"){

          options = {
            onicecandidate : self.onIceCandidate.bind(self),
            configuration  : iceConfig
          }
            
          self.webRtcPeer =  kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
            function(error) {
              if (error) 
                return console.error(error);
                this.generateOffer(self.onOffer.bind(self));
            }
          );         

      } else {
        this.recorderService.initializeRecorder(this.video,this.userType);
        
        options = {
          remoteVideo      : self.video,
          onicecandidate   : self.onIceCandidate.bind(self),
          configuration    : iceConfig
        }
        
        self.webRtcPeer =  kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
          function(error) {
            if (error) 
              return console.error(error);
            this.generateOffer(self.onOffer.bind(self));
          }
        ); 

      }     

    } else {
      console.log("webRtcPeer not empty: ", this.webRtcPeer);
    }
  }

  public getConstraintsInfo(){
    var mediaStream;


    const sUsrAg = navigator.userAgent;

    if (sUsrAg.indexOf('Firefox') > -1) {
      mediaStream = this.video.mozCaptureStream();
    } else {
      mediaStream = this.video.captureStream();
    }    

    if(mediaStream){
      let streamTrack: any = mediaStream.getVideoTracks()[0];
      let trackConstraints: any = streamTrack.getConstraints();
      let trackCapabilities: any = streamTrack.getCapabilities();
      let trackSettings: any = streamTrack.getSettings();
      console.log('constraints: '  + JSON.stringify(trackConstraints));
      console.log('track constraint: ', trackConstraints) ;
      console.log('capabilities: ', trackCapabilities);
      console.log('settigns: ', trackSettings);
    }

  }  

  private viewStreaminfo(mediaStream){  
    console.log("inside view Stream: ", mediaStream);
    if(mediaStream){
      let streamTrack: any = mediaStream.getVideoTracks()[0];
      let trackConstraints: any = streamTrack.getConstraints();
      let trackCapabilities: any = streamTrack.getCapabilities();
      let trackSettings: any = streamTrack.getSettings();
      console.log('constraints: '  + JSON.stringify(trackConstraints));
      console.log('track constraint: ', trackConstraints) ;
      console.log('capabilities: ', trackCapabilities);
      console.log('settigns: ', trackSettings);
    }

  }   

  public connectToEndPoint(psessionId){
    if(this.userType == "Media Server"){
      var message = {
        id : 'connectToEndPoint',
        sessionID : psessionId
      }
      this.sendMessage(message);
    }
  }  

  //public checkViewers(){
  //  if(this.userType == "Media Server"){
  //    var message = { id: 'checkViewers' }
  //    this.sendMessage(message);
  //  }
  //}  

  public setClassObject(obj){
    this.classObject = obj;
  }

  public stop(){
    console.log('Stopping video ...');
    this.streamStatus = false;
    var message = {
      id: 'stop'
    }
    this.sendMessage(message);
  }

  public setUserType(value: string){
    console.log(value);
    this.userType = value;
  }  

  public setVideo(video){
    this.video = video;
    if((this.video != null) && 
       (this.userType == "Media Server")){
        //this.video.addEventListener("play", this.handleStreamCheck.bind(this))
        this.video.setAttribute('src',this.mediaSourceURL);
    }
  }

  public setVideoSource(urlString){
    /*
    this.mediaSourceURL = app_protocol 	+ 
                         app_ip_address + ':' + 
                         app_port 		+ '/' +
                         urlString; 
    */
   this.mediaSourceURL = urlString;  
   this.video.setAttribute('poster',"");
   this.video.setAttribute('src',this.mediaSourceURL);
   this.video.load();                  
  }

  public isStreaming(){
    return this.streamStatus;
  }

  public setResolution(resType){
    console.log("changing resolution...");
    var message = {
      id: 'changeResolution',
      resolution : resType
    }

    this.sendMessage(message);

  }

  public closeWebSocket(){
    console.log('closing websocket connection...');
    this.wsMessages$.complete();
  }

  public requestPlayer(){
    var message = {
      id : 'startMedia'
    }

    this.sendMessage(message);
  }

  public requestPause(){
    var message = {
      id : 'pauseMedia'
    }
    this.sendMessage(message);
  }

  public requestResume(){
    var message = {
      id : 'resumeMedia'
    }
    this.sendMessage(message);
  }

  //=======================================================================

  private playerResponse(){
    console.log("media is playing....")
  }

  private onOffer(error, offerSdp){
    var message;
    var newOfferSdp: any;

    console.log('onOffer went here');
    console.log('sdp offer: ', offerSdp);
    console.log('error: ', error);
    if(error) 
      return console.error('Error generating the offer');
    console.info('Invoking SDP offer callback function ' + location.host);
    this.streamStatus = true;

    newOfferSdp = this.setVideoBitrates(this.setOpusAttributes(this.setMediaBandwidths(offerSdp))); 

    if(this.userType == "Media Server"){
      var videoUrl = this.mediaSourceURL;
      message = {
        id: 'presenter',
        url: videoUrl,
        sdpOffer : newOfferSdp
      }
    } else {
      var details = this.userType + '_Participant' + Math.floor(Math.random()*100);
      message = {
        id : 'viewer',
        details: details,
        sdpOffer : newOfferSdp
      }
    }
    this.sendMessage(message);
  }

  private offerResponse(message){
    if(message.response != 'accepted'){
      var errorMsg = message.message ? message.message : 'Unknow error';
		  console.info('Connection not accepted for the following reason: ' + errorMsg);
      this.stop();
    }
    else {
      this.webRtcPeer.processAnswer(message.sdpAnswer,
        function(error){
          if (error) return console.error(error);
        }
      );
      if (this.userType == "Media Server")
         this.video.removeAttribute("type");     
    }
  }

  private onIceCandidate(candidate) {
    console.log('Local candidate' + JSON.stringify(candidate));
    var message = {
      id : 'onIceCandidate',
      candidate : candidate
    }
    this.sendMessage(message);
  }  

  private handleStreamCheck(){
    if(this.userType == "Media Server"){
      var message = {
        id : 'streamReady'
      }
      this.sendMessage(message);
    }    
  }

  private streamResponse(message){
    if (message.response != 'accepted') {
      var errorMsg = message.message ? message.message : 'Unknow error';
      console.info('Connection not accepted for the following reason: ' + errorMsg);
      this.video.pause();
      this.video.currentTime = 0;
      alert('Connection not accepted for the following reason: ' + errorMsg);	
    } else {
      if(this.userType == "Media Server")
        this.video.play();	
    }   
  }

  private viewerPlayStream(){
    console.log("Went here: stream playable on viewer");
    if(this.userType != "Media Server"){
      if(!this.classObject.canHaveHD) this.setResolution("LQ");
      console.log("viewer is not a media server admin");
      this.video.autoplay = true;	
      this.video.play();
      console.log("end of play");
    }
  }

  private checkViewerResponse(message){
    if(message.response != 'accepted'){
      var errorMsg = message.message ? message.message : 'Unknow error';
      console.info('Connection not accepted for the following reason: ' + errorMsg);
      alert('Connection not accepted for the following reason: ' + errorMsg);
    } else {
      var viewersList = message.viewers.split(";");
      if(viewersList){
        console.log(viewersList);
        this.updateData(viewersList);
      }
    }    
  }

  private connectEndpointResponse(message){
    if(message.response != 'success'){
      var errorMsg = message.message ? message.message : 'Unknow error';
      console.info('Connection not accepted for the following reason: ' + errorMsg);
      alert('Connection not accepted for the following reason: ' + errorMsg);
    } else {
      console.info('Connection Success');		
    }    
  }

  private dispose(){
    if (this.webRtcPeer){
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
    }
  }

  private senderDisconnected(){
    this.classObject.selectedItems = [];
    this.classObject.dropdownList = [];
    this.dispose();
    console.log("End Sender Session");
  }

  private senderEndsConnection(){
    this.dispose();
    this.exitVideoFullScreen();
    this.clientProgrammaticStop();
    console.log("Sender has ended communication from all connected Viewers");
  }

  private viewerEndsConnection(){
    this.dispose();
    this.exitVideoFullScreen();
    console.log("Viewer has ended communication from the sender...");
  }

  private onError(error){
    console.error(error);
  }

  private sendMessage(message){
    this.wsMessages$.next(message);
  }

  private updateData(paramdata){
    console.log("param list: ", paramdata);
    var tempArr = [];
    this.classObject.dropdownList = [];
    paramdata.forEach((element: String)=>{
      if((element != "")){
        tempArr = element.split('|');
        this.classObject.dropdownList.push({
          "id" : tempArr[0],
          "itemName" : tempArr[1]
        });
      }
    });
    console.log("drop down list", this.classObject.dropdownList);
  }

  //exit full video screen.
  private exitVideoFullScreen(){
    if(this.userType != "Media Server"){
      try{
        if (this.video.exitFullscreen) {
          this.video.exitFullscreen();
        } else if (this.video.mozCancelFullScreen) { /* Firefox */
          this.video.mozCancelFullScreen();
        } else if (this.video.webkitExitFullscreen) { /* Chrome, Safari & Opera */
          this.video.webkitExitFullscreen();
        } else if (this.video.msExitFullscreen) { /* IE/Edge */
          this.video.msExitFullscreen();
        }	
      } catch(e){
        console.log("unable to exit fullscreen for the ff. reason: ", e);
      }
    }     
  }

  // stop communication
  private clientProgrammaticStop(){
    if(this.userType != "Media Server"){
      this.classObject.clickStopButton();
    }
  }

  //setting up bandwidth of specified media: audio or video.
  private setMediaBandwidths(sdp): any {
    return this.setMediaBandwidth(this.setMediaBandwidth(sdp, "video", 2000), "audio", 96);
  }

  private setMediaBandwidth(sdp, media, bitrate): any {
    var lines = sdp.split("\n");
    var line = -1;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf("m="+media) === 0) {
        line = i;
        break;
      }
    }
    if (line === -1) {
      console.debug("Could not find the m line for", media);
      return sdp;
    }
    console.debug("Found the m line for", media, "at line", line);
   
    // Pass the m line
    line++;
   
    // Skip i and c lines
    while(lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
      line++;
    }
   
    // If we're on a b line, replace it
    if (lines[line].indexOf("b") === 0){
      console.debug("Replaced b line at line", line);
      lines[line] = "b=AS:"+bitrate;
      return lines.join("\n");
    }
    
    // Add a new b line
    console.debug("Adding new b line before line", line);
    var newLines = lines.slice(0, line)
    newLines.push("b=AS:"+bitrate)
    newLines = newLines.concat(lines.slice(line, lines.length))
    return newLines.join("\n")
  }

  // setting up audio attributes
  private setOpusAttributes(sdp): any{ 
    sdp = sdp.replace('a=rtpmap:111 opus/48000/2' , 'a=rtpmap:111 opus/48000/2\r\na=fmtp:111 maxplaybackrate=48000; sprop-maxcapturerate=48000; maxaveragebitrate=510000; stereo=1; useinbandfec=0; usedtx=0; cbr=0;maxptime=120');
    sdp = sdp.replace('a=fmtp:111 minptime=10;','a=fmtp:111 minptime=60');
    sdp = sdp.replace('minptime=60; useinbandfec=1','minptime=60');
    return sdp;   
  }


  private findLine(sdpLines, prefix, substr):any {
    return this.findLineInRange(sdpLines, 0, -1, prefix, substr);
  }

  // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
  // and, if specified, contains |substr| (case-insensitive search).
  private findLineInRange(sdpLines, startLine, endLine, prefix, substr) : any {
      var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
      for (var i = startLine; i < realEndLine; ++i) {
          if (sdpLines[i].indexOf(prefix) === 0) {
              if (!substr ||
                  sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                  return i;
              }
          }
      }
      return null;
  }

  // Gets the codec payload type from an a=rtpmap:X line.
  private getCodecPayloadType(sdpLine): any {
    var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
    var result = sdpLine.match(pattern);
    return (result && result.length === 2) ? result[1] : null;
  }  

  // setting output bitrates
  private setVideoBitrates(sdp) {
    var xgoogle_min_bitrate = 1000;
    var xgoogle_max_bitrate = 3000;

    var sdpLines = sdp.split('\r\n');

    // check and get vp8 codec payload
    var vp8Index = this.findLine(sdpLines, 'a=rtpmap', 'VP8/90000');
    var vp8Payload;
    if (vp8Index) {
        vp8Payload = this.getCodecPayloadType(sdpLines[vp8Index]);
    }

    if (!vp8Payload) {
        return sdp;
    }

    //check rtx codec and get payload 
    var rtxIndex = this.findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
    var rtxPayload;
    if (rtxIndex) {
        rtxPayload = this.getCodecPayloadType(sdpLines[rtxIndex]);
    }

    // check if rtx has payload, if none return sdp with no changes
    if (!rtxIndex) {
        return sdp;
    }

    // else append ff. lines to sdp
    var rtxFmtpLineIndex = this.findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString(),'');
    if (rtxFmtpLineIndex !== null) {
        var appendrtxNext = '\r\n';
        appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=' + (xgoogle_min_bitrate || '228') + '; x-google-max-bitrate=' + (xgoogle_max_bitrate || '228');
        sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
        sdp = sdpLines.join('\r\n');
    }

    return sdp;
  }  

  private showVideoData(message){
    console.log("video data",message);
  }

}

