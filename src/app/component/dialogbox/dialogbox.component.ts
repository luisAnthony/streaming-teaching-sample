import {Component, OnInit, ViewEncapsulation, Inject} from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material'

@Component({
    selector: 'app-dialog',
    templateUrl: './dialogbox.component.html',
    styleUrls: ['./dialogbox.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class DialogBoxComponent implements OnInit {
    title: String;
    message: String;
    btnCaption: String;
    dialogType: String;
    proceedCaption: String;

    constructor(
        private matDialogRef: MatDialogRef<DialogBoxComponent>,
        @Inject(MAT_DIALOG_DATA) private data){

        this.title = data.title;
        this.message = data.message; 
        this.dialogType = data.type;
        if(data.type == "WARN")
            this.proceedCaption = data.btnCaption;
        else {
            this.btnCaption = data.btnCaption;
            this.proceedCaption = "是";
        }
    }

    ngOnInit(){}

    close(){
        this.matDialogRef.close();
    }   
    
}