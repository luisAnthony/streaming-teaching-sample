import { Injectable } from '@angular/core';
import { _JUSER } from '@model/_JUSER';

const JwtToken: string = 'jwtToken';

@Injectable({
  providedIn: 'root'
})
export class JwtStorageService {

  public JUser: _JUSER = new _JUSER('Kinish', 'Kinlish', [''], 1554000000, 1554000000);

  constructor() {
    this.setJwtUser(this.JwtToken);
  }

  private setJwtUser(token: string) {
    if (!token || token.indexOf('.') < 0) return;
    let json64 = token.split('.')[1];
    let user = JSON.parse(atob(json64)) as _JUSER;
    this.JUser = new _JUSER(user.sub, user.displayName, user.authority, user.exp, user.iat);
  }

  set JwtToken(token: string) {
    localStorage.setItem(JwtToken, token);
    this.setJwtUser(token);
  }

  get JwtToken() {
    return localStorage.getItem(JwtToken);
  }

  clear() {
    this.JUser = null;
    localStorage.removeItem(JwtToken);
  }
}
