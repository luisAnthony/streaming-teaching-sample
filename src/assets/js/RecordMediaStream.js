/*
*  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';

/* globals main */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

/* globals main, MediaRecorder */

var mediaSource 
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;
var userType;

var video;
var stream;

const sUsrAg = navigator.userAgent;

window.onload = function() {
  mediaSource = new MediaSource();
  mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
  userType = document.getElementById('userType');
  video = document.getElementById('main-video');
    if(video != null){
      video.addEventListener("playing", handlePlaying, false);
      video.addEventListener("pause", handlePause, false);
      video.addEventListener("emptied", handleEnded, false);
      if (sUsrAg.indexOf('Firefox') > -1) stream = video.mozCaptureStream();
      else stream = video.captureStream();      
    }
    
}

function handlePlaying(){
    if(userType.value != "Media Server"){
        if(stream != null){
            requestVideoFullScreen();
            startRecording();
        }
    }
}

function handlePause(){
  if(userType.value != "Media Server"){
    if(stream != null){
        mediaRecorder.pause();
    }
  }  
}

function handleEnded(){
    if(userType.value != "Media Server"){  
      if(mediaRecorder != null){    
        stopRecording();
        download();
      }
    }    
}


function handleSourceOpen() {
    console.log('MediaSource opened');
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    console.log('Source buffer: ', sourceBuffer);
  }
  
  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }
  // The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
    if(mediaRecorder == null){
      let options = {mimeType: 'video/webm'};
      recordedBlobs = [];
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e0) {
        console.log('Unable to create MediaRecorder with options Object: ', e0);
        try {
          options = {mimeType: 'video/webm,codecs=vp9'};
          mediaRecorder = new MediaRecorder(stream, options);
        } catch (e1) {
          console.log('Unable to create MediaRecorder with options Object: ', e1);
          try {
            options = 'video/vp8'; // Chrome 47
            mediaRecorder = new MediaRecorder(stream, options);
          } catch (e2) {
            alert('MediaRecorder is not supported by this browser.\n\n' +
              'Try Firefox 29 or later, or Chrome 47 or later, ' +
              'with Enable experimental Web Platform features enabled from chrome://flags.');
            console.error('Exception while creating MediaRecorder:', e2);
            return;
          }
        }
      }
      console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(100); // collect 100ms of data
      console.log('MediaRecorder started', mediaRecorder);
    } else {
      mediaRecorder.resume();
    }
  }
  
  function stopRecording() {
      mediaRecorder.stop();
      console.log('Recorded Blobs: ', recordedBlobs);
  }
  
  function download() {
    const blob = new Blob(recordedBlobs, {type: 'video/webm;'});
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

  function requestVideoFullScreen(){
    try{
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(err => {
          console.log('Error in requesting video fullscreen for the ff. reason: ', err.message);
        });
      } else if (video.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        video.webkitRequestFullscreen().catch(err => {
          console.log('Error in requesting video fullscreen for the ff. reason: ', err.message);
        });;
      } else if (video.mozRequestFullScreen) { /* Firefox */
        video.mozRequestFullScreen().catch(err => {
          console.log('Error in requesting video fullscreen for the ff. reason: ', err.message);
        });;
      } else if (video.msRequestFullscreen) { /* IE/Edge */
        video.msRequestFullscreen().catch(err => {
          console.log('Error in requesting video fullscreen for the ff. reason: ', err.message);
        });;
      }
    } catch(exc){
      console.log("unable to execute fullscreen for the ff. reason: ", exc);
    }  
  }