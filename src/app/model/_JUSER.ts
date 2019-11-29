import { ID_USER } from "@entity/ID_USER";

export class _JUSER {

  private _sub: string;
  private _displayName: string;
  private _authority: string[];
  private _exp: number;
  private _iat: number;

  public get sub() {
    return this._sub;
  }

  public get displayName() {
    return this._displayName;
  }

  public get authority() {
    return this._authority;
  }

  public get exp() {
    return this._exp;
  }

  public get iat() {
    return this._iat;
  }

  public get isExpire(): Boolean {
    let cdate = new Date().getTime() / 1000;
    return cdate > this._exp;
  }

  constructor(
    sub: string,
    displayName: string,
    authority: string[],
    exp: number,
    iat: number) {
    this._sub = sub;
    this._displayName = displayName ? decodeURIComponent(displayName) : sub;
    this._authority = authority;
    this._exp = exp;
    this._iat = iat;
  }

  ToID_USER(): ID_USER {
    return new ID_USER(this._sub, this._displayName);
  }
}