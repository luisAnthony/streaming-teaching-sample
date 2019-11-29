//**************** BuiltIn and Imported Angular Modules ********************
import { BrowserModule }                  from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA }     from '@angular/core';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { BrowserAnimationsModule }        from '@angular/platform-browser/animations';
import { FormsModule }                    from '@angular/forms';
import { ReactiveFormsModule}             from '@angular/forms';
import { HttpClientModule }               from '@angular/common/http';
import { MatDialogModule, 
         MatDividerModule, 
         MatMenuModule, 
         MatCardModule,
         MatTableModule}                   from '@angular/material';
import { FlexLayoutModule }               from '@angular/flex-layout';         

//**************** App Components ********************
import { BootstrapComponent }          from '@component/bootstrap/bootstrap';
import { LoginComponent }              from '@component/login/login';
import { AppHeaderComponent }          from './component/app-header/app-header.component';
import { MainComponent }               from './component/main/main.component';
import { UploadVideoComponent }        from './component/upload-video/upload-video.component';
import { VideoStreamComponent }        from './component/video-stream/video-stream.component';
import { RegisterComponent }           from './component/register/register.component';
import { DialogBoxComponent }          from './component/dialogbox/dialogbox.component';
import { StudentBoardComponent }       from './component/student-board/student-board.component';
import { VideoPlayerModal }            from './component/student-board/video-player/video-player.modal';
import { StudentBrowseVideoComponent } from './component/student-board/student-browse-video/student-browse-video.component';
import { StudentExamPageComponent }    from './component/student-board/student-exam/student-exam.component';
import { DashMainComponent }           from './component/dash-interactive/dash-main/dash-main.component';
import { DashClassComponent }          from './component/dash-interactive/dash-class/dash-class.component';
import { DashStudComponent }           from './component/dash-interactive/dash-stud/dash-stud.component'

//**************** App Services ********************
import { InMemoryDataService }      from '@service/in-memory-data';
import { WebsocketService }         from './service/websocket.service';
import { MediaStreamingService }    from './service/media-streaming.service';
import { httpInterceptorProviders } from './auth/auth-interceptor';
import { LogMessagingService }      from './service/log-messaging.service';
import { MediaConversionService }   from './service/media-conversion.service';
import { ExaminationService }       from './service/exam.service';
import { MediaRecordingService }    from './service/media-recording.service';
import { DataAccessStorageService } from './service/data-access-storage.service';

//**************** External Angular Wrapper Module  ********************
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ChartjsModule }            from '@ctrl/ngx-chartjs';

//**************** Custom Angular Module ********************
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AppShareModule }   from 'src/app/app-share.module';

@NgModule({
  declarations: [
    BootstrapComponent,
    LoginComponent,
    AppHeaderComponent,
    MainComponent,
    UploadVideoComponent,
    VideoStreamComponent,
    RegisterComponent,
    DialogBoxComponent,
    StudentBoardComponent,
    StudentBrowseVideoComponent,
    StudentExamPageComponent,
    VideoPlayerModal,
    DashMainComponent,
    DashClassComponent,
    DashStudComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularMultiSelectModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppShareModule.forRoot(),
    MatDialogModule,
    MatDividerModule,
    MatMenuModule,
    MatCardModule,
    FlexLayoutModule,
    MatTableModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { dataEncapsulation: false, passThruUnknownUrl: true}),
    ChartjsModule
  ],
  providers: [
    WebsocketService,
    MediaStreamingService,
    httpInterceptorProviders,
    LogMessagingService,
    MediaConversionService,
    ExaminationService,
    MediaRecordingService,
    DataAccessStorageService
  ],
  bootstrap: [BootstrapComponent],
  schemas: [
    NO_ERRORS_SCHEMA
  ],
  entryComponents: [DialogBoxComponent, VideoPlayerModal]
})
export class AppRootModule { }
