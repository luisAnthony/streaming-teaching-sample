import { Component, OnInit, ViewChild } from '@angular/core';
import { DataAccessStorageService } from '../../../service/data-access-storage.service';
import { _CLASS } from '../../../model/_INDEX';
import { Router } from '@angular/router';
import { MatTable } from '@angular/material';

@Component({
    selector: 'dash-main',
    templateUrl: './dash-main.component.html',
    styleUrls: ['./dash-main.component.css']
})
export class DashMainComponent implements OnInit{
    jsonData: any[];
    classes: _CLASS[];
    classUrl: string;
    displayedColumns = ['id', 'name', 'date', 'count','view'];

    constructor(private dataService: DataAccessStorageService,
                private router: Router){}

    ngOnInit(){
        this.jsonData = this.dataService.getAll();
        this.loadJsonData();
        console.log(this.classes);
    }

    @ViewChild(MatTable) table: MatTable<any>;

     loadJsonData(){
        this.classes = [];
        this.jsonData.forEach(data => {
            let res: string = data.id;
            this.dataService.get(res).subscribe(cls => {
                this.classes.push(new _CLASS(cls));
                this.table.renderRows();
            });
        });
    }

    openClassRouteDetails(_class : _CLASS){
        console.log(_class);
        this.dataService.setClass(_class);
        this.router.navigate(['dash/class/classinfo']);
    }

}
