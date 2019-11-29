import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, FormGroup } from  '@angular/forms';
import { UploadService } from '../../service/upload.service';
import { fileURLToPath } from 'url';
import { MediaConversionService } from '../../service/media-conversion.service';
import { HttpEventType } from '@angular/common/http';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { DialogBoxComponent } from '../dialogbox/dialogbox.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-video',
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.css']
})
export class UploadVideoComponent implements OnInit, OnDestroy {
  result: any;
  form: FormGroup;
  error: string;
  userId: number = 1;
  uploadResponse = { status: '', message: '', filePath: '' };
  fileName: string;
  proceedUpload: boolean;
  convertPercentage: string;

  constructor(private formBuilder: FormBuilder, 
              private uploadService: UploadService,
              private convertService: MediaConversionService,
              private dialog: MatDialog,
              public router: Router){}

  ngOnInit() {
    this.form = this.formBuilder.group({
      file_upload: ['']
    });
    document.getElementById('file-drag').addEventListener('dragover', this.onFileHover, false);
    document.getElementById('file-drag').addEventListener('dragleave', this.onFileHover, false);
    document.getElementById('file-drag').addEventListener('drop', this.onFileChange, false);
    this.fileName = "選擇檔案上傳";
    this.proceedUpload = false;
    this.convertPercentage = '0';
    this.uploadResponse.message = '0';
    document.getElementById('file-video').setAttribute('hidden','');
    document.getElementById('file-video').setAttribute('src',"#");    
  }

  ngOnDestroy() {
    if(this.result)
      this.result.unsubscribe();
  }

  onFileHover(event){
    var filedrag = document.getElementById('file-drag');
    event.stopPropagation();
    event.preventDefault();

    filedrag.className = (event.type === 'dragover' ? 'hover' : 'modal-body file-upload');
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];     
      
      const mimeType = file.type.substring(0,5);
      if(mimeType.toUpperCase() == "VIDEO"){
        document.getElementById('file-video').removeAttribute('hidden');
        document.getElementById('file-video').setAttribute('src',URL.createObjectURL(file));
        this.fileName = file.name;
        this.form.get('file_upload').setValue(file);
        this.proceedUpload = true;
      } else {
        alert("這不是正確的影片格式，請重新選擇!");
        document.getElementById('file-video').setAttribute('hidden','');
        document.getElementById('file-video').setAttribute('src',"#");
        this.fileName = "選擇檔案上傳";
        this.proceedUpload = false;
      }  
    }
  }

  onSubmit() {
    if (this.proceedUpload){
      const formData = new FormData();
      formData.append('file', this.form.get('file_upload').value);
      var self = this;
      this.result = this.uploadService.upload(formData).subscribe(
        event => {
          switch (event.type) {
            case HttpEventType.UploadProgress:{
              const progress = Math.round(100 * event.loaded / event.total);
              self.uploadResponse.status = 'progress';
              self.uploadResponse.message = progress.toString();
              break;
            }
    
            case HttpEventType.Response:{
              var resObj = event.body;
              console.log("Upload Complete! Conversion Starting!");
              self.convertService.setUserClass(self);
              self.convertService.startConversion(resObj.fileName);
              break;
            }
            default:
              return `Unhandled event: ${event.type}`;
          }
        }
      );
      console.log(this.result);
    } else alert("請選擇正確的影片格式！");
  }

  public openDialog(): MatDialogRef<DialogBoxComponent> {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
        title: "再上傳影片？",
        message:  "你還要上傳其他影片嗎?",
        btnCaption: "No",
        type: "CONFIRM"
    };

    return this.dialog.open(DialogBoxComponent, dialogConfig);
  }  

}
