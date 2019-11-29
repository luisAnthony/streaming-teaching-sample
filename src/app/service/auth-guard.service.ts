import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {TokenStorageService } from '../auth/token-storage.service';
import { DataAccessStorageService } from './data-access-storage.service';
// old code
//import { JwtStorageService } from '@service/jwt-storage';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    private router: Router,
    private jwtService: TokenStorageService,
    private dataService: DataAccessStorageService
    //private jwtService: JwtStorageService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    var strUname = this.jwtService.getUsername()
    var strToken = this.jwtService.getToken()
    var int_AuthLen = this.jwtService.getAuthorities().length;
    if((strUname == null) ||  
       (strToken == null) ||
       (int_AuthLen == 0)){
    //if (!this.jwtService.JUser || this.jwtService.JUser.isExpire) {

      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  canActivateDash(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if(!this.dataService.getClass()){
      this.router.navigate(['/dash/class']);
      return false;
    }
    return true;
  }
  

}
