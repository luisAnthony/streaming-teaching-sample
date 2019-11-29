import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { apiGetway } from 'src/app/app-config';
import { Func } from '@extend/helper';
import { JwtStorageService } from '@service/jwt-storage';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public IsBusy: boolean = false;

  constructor(
    private http: HttpClient,
    private jwtService: JwtStorageService
  ) { }

  adapterBody(obj: Object = {}) {
    if (obj instanceof Array) {
      return obj.map(a => {
        if (a instanceof Date)
          return a.toISOString();
        else if (a instanceof Array || typeof a === "object")
          return this.adapterBody(a);
        else
          return a;
      })
    } else {
      let retval = {};
      for (let kv in obj) {
        if (!obj[kv]) continue;
        if (obj[kv] instanceof Date) {
          retval[kv] = obj[kv].toISOString();
        } else if (obj[kv] instanceof Array) {
          retval[kv] = obj[kv].map(a => this.adapterBody(a))
        } else if (typeof obj[kv] === 'object') {
          retval[kv] = this.adapterBody(obj[kv]);
        } else {
          retval[kv] = obj[kv];
        }
      }
      return retval;
    }
  }

  buildParames(obj: Object = {}) {
    let params = new HttpParams();
    for (let kv in obj) {
      if (!obj[kv]) {
        params = params.append(kv, '');
      } else {
        params = obj[kv] instanceof Date ? params.append(kv, obj[kv].toISOString()) : params.append(kv, obj[kv]);
      }
    }
    return {
      headers: Func(this.jwtService.JwtToken, token => {
        let headers = { 'Content-Type': 'application/json' };
        Object.assign(headers, token ? { 'Authorization': `Bearer ${token}` } : { });
        return new HttpHeaders(headers);
      }),
      withCredentials: true,
      responseType: 'json' as 'json',
      params: params
    };
  }

  get$<T>(api: string, params: Object = {}): Observable<T> {
    this.IsBusy = true;
    let apiUrl = /^https?:\/\//.test(api) ? api : `${apiGetway}/${api}`;
    return this.http.get<T>(apiUrl, this.buildParames(params)).pipe(
      tap(_ => this.IsBusy = false),
      catchError(this.handleError<T>(api)));
  }

  get<T>(api: string, params: Object = {}): Promise<T> {
    return this.get$<T>(api, params).toPromise();
  }

  post$<T>(api: string, body: Object = {}, params: Object = {}): Observable<T> {
    this.IsBusy = true;
    let apiUrl = /^https?:\/\//.test(api) ? api : `${apiGetway}/${api}`;
    return this.http.post<T>(apiUrl, this.adapterBody(body), this.buildParames(params)).pipe(
      tap(_ => this.IsBusy = false),
      catchError(this.handleError<T>(api)));
  }

  post<T>(api: string, body: Object = {}, params: Object = {}): Promise<T> {
    return this.post$<T>(api, body, params).toPromise();
  }

  put$<T>(api: string, body: Object = {}, params: Object = {}): Observable<T> {
    this.IsBusy = true;
    let apiUrl = /^https?:\/\//.test(api) ? api : `${apiGetway}/${api}`;
    return this.http.put<T>(apiUrl, this.adapterBody(body), this.buildParames(params)).pipe(
      tap(_ => this.IsBusy = false),
      catchError(this.handleError<T>(api)));
  }

  put<T>(api: string, body: Object = {}, params: Object = {}): Promise<T> {
    return this.put$<T>(api, body, params).toPromise();
  }

  delete$<T>(api: string, params: Object = {}): Observable<T> {
    this.IsBusy = true;
    let apiUrl = /^https?:\/\//.test(api) ? api : `${apiGetway}/${api}`;
    return this.http.delete<T>(apiUrl, this.buildParames(params)).pipe(
      tap(_ => this.IsBusy = false),
      catchError(this.handleError<T>(api)));
  }

  delete<T>(api: string, params: Object = {}): Promise<T> {
    return this.delete$<T>(api, params).toPromise();
  }

  private handleError<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<T> => {
      console.log(error);
      this.IsBusy = false;
      return of(null as T);
    }
  }
}
