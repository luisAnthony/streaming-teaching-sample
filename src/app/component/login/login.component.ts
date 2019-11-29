import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../auth/auth.service';
import { TokenStorageService } from '../../auth/token-storage.service';
import { AuthLoginInfo } from '../../auth/login-info';
import { Router } from '@angular/router'
import { LogMessagingService } from '../../service/log-messaging.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {};
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  private loginInfo: AuthLoginInfo;

  constructor(private authService: AuthService, 
              private tokenStorage: TokenStorageService, 
              private router: Router, 
              private logMsg: LogMessagingService) { }

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getAuthorities();
    }
  }

  onSubmit() {
    console.log(this.form);

    this.loginInfo = new AuthLoginInfo(
      this.form.username,
      this.form.password);

    this.authService.attemptAuth(this.loginInfo).subscribe(
      data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUsername(data.username);
        this.tokenStorage.saveAuthorities(data.authorities);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getAuthorities();

        let date: Date = new Date();
        let content: string = "Log message: 使用者登入系統! || " +
                              "Current User: " + this.tokenStorage.getUsername() + " || " +
                              "User Role: " + this.tokenStorage.getAuthorities().toString() + " || " +
                              "DateTimeStamp: " + date.toDateString() + " - " + date.toTimeString();
        let url: string = "LogData_" + date.getMonth().toString() + date.getDate().toString() + date.getFullYear().toString();
        
        this.logMsg.sendLogMessage(content,url);

        this.roles.every(role => {
          switch(role){
            case "ROLE_ADMIN": 
            case "ROLE_TEACHER": {
              this.router.navigate(['main']);
              return false;
            }
            case "ROLE_STUDENT": {
              this.router.navigate(['student']);
              return false;
            }
            default: {
              this.reloadPage();
              return true;
            }
          }
        });        
        
        //this.reloadPage();
      },
      error => {
        console.log(error);
        this.errorMessage = error.error.message;
        this.isLoginFailed = true;
      }
    );
  }

  reloadPage() {
    window.location.reload();
  }
}
