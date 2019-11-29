import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../auth/auth.service';
import { RegisterInfo } from '../../auth/register-info';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialogbox/dialogbox.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form: any = {};
  signupInfo: RegisterInfo;
  isSignedUp = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(
      private authService: AuthService, 
      private router: Router,
      private dialog: MatDialog){ }

  ngOnInit() {}

  onSubmit() {
    this.signupInfo = new RegisterInfo(
      this.form.name,
      this.form.username,
      this.form.email,
      this.form.password,
      this.form.role_type);
      
    /*
      alert("Your registration is successful.\n" +
            "Credential are as follows: \n" + 
            "\t\t Full name: " + this.signupInfo.name  + "\n" +
            "\t\t User name: " + this.signupInfo.name  + "\n" +
            "\t\t Email add: " + this.signupInfo.email + "\n" +
            "\t\t Role type: " + this.signupInfo.name  + "\n\n" +
            "Redirecting to login page!")   
      this.router.navigate(['login']);
    */

    this.authService.signUp(this.signupInfo).subscribe(
      data => {
        console.log(data);
        this.isSignedUp = true;
        this.isSignUpFailed = false;
        this.openDialog()
            .afterClosed()
            .subscribe(() => {
                this.router.navigate(['login']);
            })
      },
      error => {
        console.log(error);
        this.errorMessage = error.error.message;
        this.isSignUpFailed = true;
      }
    )
    
  }

  openDialog(): MatDialogRef<DialogBoxComponent> {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
        title: "注冊成功",
        message:  "你的帳號已注冊成功，謝謝!",
        btnCaption: "確認",
        type: "INFO"
    };

    return this.dialog.open(DialogBoxComponent, dialogConfig);
  }  
}
