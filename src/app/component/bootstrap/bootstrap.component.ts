//import { DOCUMENT } from '@angular/common';
import { Component } from '@angular/core';
import { JwtStorageService } from '@service/jwt-storage';
import { fadeAnimation } from '../../transition/animations';
/*
interface FsDocument extends HTMLDocument {
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  msExitFullscreen?: () => void;
  mozCancelFullScreen?: () => void;
}

export function fullScreenListener(){
  const fsDoc = <FsDocument> document;
  fsDoc.addEventListener("fullscreenchange", onFullScreenChange, false);
  fsDoc.addEventListener("webkitfullscreenchange", onFullScreenChange, false);
  fsDoc.addEventListener("mozfullscreenchange", onFullScreenChange, false);
}

export function onFullScreenChange() {
  if(!isFullScreen()){
    setFullScreen(true);
  }
}

export function isFullScreen(): boolean {
  const fsDoc = <FsDocument> document;

  return !!(fsDoc.fullscreenElement || fsDoc.mozFullScreenElement || fsDoc.msFullscreenElement);
}

interface FsDocumentElement extends HTMLElement {
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
}

export function toggleFullScreen(): void {
  const fsDoc = <FsDocument> document;

  if (!isFullScreen()) {
    const fsDocElem = <FsDocumentElement> document.documentElement;

    if (fsDocElem.requestFullscreen)
      fsDocElem.requestFullscreen();
    else if (fsDocElem.msRequestFullscreen)
      fsDocElem.msRequestFullscreen();
    else if (fsDocElem.mozRequestFullScreen)
      fsDocElem.mozRequestFullScreen();
  }
  else if (fsDoc.exitFullscreen)
    fsDoc.exitFullscreen();
  else if (fsDoc.msExitFullscreen)
    fsDoc.msExitFullscreen();
  else if (fsDoc.mozCancelFullScreen)
    fsDoc.mozCancelFullScreen();
}

export function setFullScreen(full: boolean): void {
  if (full !== isFullScreen())
    toggleFullScreen();
}*/
@Component({
  selector: 'app-bootstrap',
  templateUrl: './bootstrap.component.html',
  styleUrls: ['./bootstrap.component.css'],
  animations: [fadeAnimation]
})
export class BootstrapComponent {
  elem: any;

  constructor(
    private jwtService: JwtStorageService,
  ) {}

}
