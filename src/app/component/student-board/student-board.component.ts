import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-student-board',
    templateUrl: './student-board.component.html',
    styleUrls: ['./student-board.component.css']
  })

  export class StudentBoardComponent implements OnInit{

    constructor(private router: Router){}
   
    ngOnInit(){}

    openBrowseVideoPage(){
      this.router.navigate(['student/browse-video']);
    }

    openExamPage(){
      this.router.navigate(['student/exam-page']);
    }
  }