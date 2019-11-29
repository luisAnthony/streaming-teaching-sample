/// <reference types="@types/dom-mediacapture-record" />

import { Injectable } from '@angular/core';

const sUsrAg = navigator.userAgent;

@Injectable({
    providedIn: 'root'
})
export class MediaRecordingService {

   private mediaRecorder: MediaRecorder;
   private mediaSource: MediaSource;
   private recordedBlobs: any[] = [];
   private sourceBuffer: any;
   private video: any;
   private stream: any;
   private userType: string;
   
    constructor(){}

    public initializeRecorder(video: any, usertype: string){
        var self = this;

        this.video = video;
        this.userType = usertype;

        if(this.video){
            this.mediaSource = new MediaSource();
            this.mediaSource.addEventListener('sourceopen', self.handleSourceOpen.bind(self), false);
            this.video.addEventListener("playing", self.handlePlaying.bind(self), false);
            this.video.addEventListener("pause", self.handlePause.bind(self), false);
            this.video.addEventListener("emptied", self.handleEnded.bind(self), false);
            if (sUsrAg.indexOf('Firefox') > -1) this.stream = this.video.mozCaptureStream();
            else this.stream = this.video.captureStream(); 
        }

    }

    private handlePlaying(){
        if(this.userType != "Media Server"){
            if(this.stream)
                this.startRecording();
        }       
    }  

    private handlePause(){
        if(this.userType != "Media Server"){
          if(this.stream)
              this.mediaRecorder.pause();
        }  
      }    
    
    private handleEnded(){
        if(this.userType != "Media Server"){
            if(this.mediaRecorder){
                this.stopRecording();
                this.download();
            }
        }       
    }

    private handleSourceOpen(){
        console.log('MediaSource opened');
        this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        console.log('Source buffer: ', this.sourceBuffer);        
    }

    private handleDataAvailable = function(event: BlobEvent) {
        if (event.data && event.data.size > 0) {
          this.recordedBlobs.push(event.data);
        }
    }    

    private startRecording() {
        if(!this.mediaRecorder){
          let options = {mimeType: 'video/webm'};
          this.recordedBlobs = [];
          try {
            this.mediaRecorder = new MediaRecorder(this.stream, options);
          } catch (e0) {
            console.log('Unable to create MediaRecorder with options Object: ', e0);
            try {
              options = {mimeType: 'video/webm,codecs=vp9'};
              this.mediaRecorder = new MediaRecorder(this.stream, options);
            } catch (e1) {
              console.log('Unable to create MediaRecorder with options Object: ', e1);
              try {
                options = {mimeType: 'video/vp8'}; // Chrome 47
                this.mediaRecorder = new MediaRecorder(this.stream, options);
              } catch (e2) {
                alert('MediaRecorder is not supported by this browser.\n\n' +
                  'Try Firefox 29 or later, or Chrome 47 or later, ' +
                  'with Enable experimental Web Platform features enabled from chrome://flags.');
                console.error('Exception while creating MediaRecorder:', e2);
                return;
              }
            }
          }
          console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
          this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
          this.mediaRecorder.start(100); // collect 100ms of data
          console.log('MediaRecorder started', this.mediaRecorder);
        } else {
          this.mediaRecorder.resume();
        }
    }   
    
    private stopRecording() {
        this.mediaRecorder.stop();
        console.log('Recorded Blobs: ', this.recordedBlobs);
    }
    
    private download() {
      const blob = new Blob(this.recordedBlobs, {type: 'video/webm;'});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'test.webm';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    }    

}