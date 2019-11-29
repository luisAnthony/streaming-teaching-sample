import { Component, OnInit } from '@angular/core';
import { MediaStreamingService } from '../../../service/media-streaming.service';
import { RE_SUBJECT } from '@entity/RE_SUBJECT';
import { HttpService } from '../../../service/http.service';
import { TokenStorageService } from '../../../auth/token-storage.service';
import { MatDialog, MatDialogRef, MatDialogConfig} from '@angular/material';
import { VideoPlayerModal } from '../video-player/video-player.modal';
import { LogMessagingService } from '../../../service/log-messaging.service';
import { Router } from '@angular/router';

@Component({
    selector: 'student-browse-video',
    templateUrl: './student-browse-video.component.html',
    styleUrls: ['./student-browse-video.component.css']
  })

  export class StudentBrowseVideoComponent implements OnInit{
    videos: RE_SUBJECT[] = [];
    title: String;
    constructor(
        private mediaService: MediaStreamingService,
        private logMsg: LogMessagingService,
        private httpService: HttpService,
        private tokenStorage: TokenStorageService,
        private router: Router,
        private dialog: MatDialog
    ){
        this.title = tokenStorage.getUsername();
    }
   
    ngOnInit(){
      this.getVideos();
    }

    async getVideos() {
        this.videos = await this.httpService.get<RE_SUBJECT[]>('videos');
      }   

    openVideoPlayer(paramUrl: string, paramCat: string){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '1280px';
      dialogConfig.height = '790px';

      dialogConfig.data = {
          videoUrl: paramUrl,
          category: paramCat
      };
  
      this.dialog.open(VideoPlayerModal, dialogConfig);
    }

    backToMainBoard(){
      this.router.navigate(['student']);
    }
  }