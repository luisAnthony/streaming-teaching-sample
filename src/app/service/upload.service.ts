import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from  '@angular/common/http';
import { map } from  'rxjs/operators';
import { RE_SUBJECT } from '@entity/RE_SUBJECT';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  SERVER_URL: string = "https://192.168.1.75:8443";
  constructor(private httpClient: HttpClient) { }

  public upload(data) {
    let uploadURL = `${this.SERVER_URL}/api/auth/upload`;
    console.log(uploadURL);
    return this.httpClient.post<any>(uploadURL, data, {
      reportProgress: true,
      observe: 'events',
      responseType: 'json'
    });/*.pipe(map((event) => {

      switch (event.type) {
        case HttpEventType.UploadProgress:
          const progress = Math.round(100 * event.loaded / event.total);
          return { status: 'progress', message: progress };

        case HttpEventType.Response:
          return event.body;
        default:
          return `Unhandled event: ${event.type}`;
      }
    })
    );*/
  }
/*
  public getFile(data) {
    let dataURL =  `${this.SERVER_URL}/list`;
    console.log(dataURL);
    return this.httpClient.get<RE_SUBJECT>(dataURL)
      .pipe(map((event) => {
        if (event.type == HttpEventType.Response.toString()){
          return event.video;
        }
      })
    );
  }
  */

}
