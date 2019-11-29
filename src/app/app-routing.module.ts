import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '@component/login/login';
import { AuthGuardService } from '@service/auth-guard';
import { MainComponent } from '@component/main/main';
import { UploadVideoComponent } from '@component/upload-video/upload-video';
import { RegisterComponent } from '@component/register/register';
import { StudentBoardComponent } from '@component/student-board/student-board';
import { StudentBrowseVideoComponent } from '@component/student-board/student-browse-video/student-browse-video';
import { StudentExamPageComponent } from '@component/student-board/student-exam/student-exam';
import { DashMainComponent } from '@component/dash-interactive/dash-main/dash-main';
import { DashClassComponent } from '@component/dash-interactive/dash-class/dash-class';
import { DashStudComponent } from '@component/dash-interactive/dash-stud/dash-stud';

const routes: Routes = [
  //{ path: 'main', component: MainComponent, canActivate: [AuthGuardService] }, //=> TODO fix sessions before removing comments here (after login page development)
  //{ path: 'main', component: MainComponent },

  { path: '', redirectTo: '/main', pathMatch: 'full'},

  { path: 'login', component: LoginComponent }, 

  { path: 'upload', component: UploadVideoComponent},
  
  { path: 'register', component: RegisterComponent}, 

  { path: 'student', component: StudentBoardComponent, canActivate: [AuthGuardService] },

  { path: 'student/browse-video', component: StudentBrowseVideoComponent},

  { path: 'student/exam-page', component: StudentExamPageComponent},

  { path: 'dash/class', component: DashMainComponent },

  { path: 'dash/class/classinfo', component: DashClassComponent },

  { path: 'dash/class/studentinfo', component: DashStudComponent },
  
  { path: 'main', component: MainComponent, canActivate: [AuthGuardService] },

  { path: '**',  redirectTo: '/main', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
