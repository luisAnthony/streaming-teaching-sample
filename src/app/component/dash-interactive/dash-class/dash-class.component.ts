import { Component, OnInit, ViewChild } from '@angular/core';
import { DataAccessStorageService } from '../../../service/data-access-storage.service';
import { _CLASS,_STUDENT } from '../../../model/_INDEX';
import { Router } from '@angular/router';
import { MatTable } from '@angular/material';

@Component({
    selector: 'dash-class',
    templateUrl: './dash-class.component.html',
    styleUrls: ['./dash-class.component.css']
})
export class DashClassComponent implements OnInit{
    jsonData: any[];
    classObj: _CLASS;
    _studList: _STUDENT[];
    classUrl: string;
    displayedColumns = ['id', 'name', 'date', 'count','view'];

    constructor(private dataService: DataAccessStorageService,
                private router: Router){}

    @ViewChild(MatTable) table: MatTable<any>;                

    ngOnInit(){
        this.classObj = this.dataService.getClass();
        if (this.classObj){
            console.log(this.classObj);
            this._studList = [];
            this.classObj.students.forEach((stud: _STUDENT) => {
                console.log(stud);
                this._studList.push(stud);
            });
            console.log(this._studList);
        } else {
            alert('No class selected, redirecting to Class List page');
            this.router.navigate(['dash/class']);
        }
    }

   

    openStudentRouteDetails(_stud : _STUDENT){
        this.dataService.setStudent(_stud);
        this.router.navigate(['dash/class/studentinfo']);
    }

}
