import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })
export class ExaminationService {

    SERVER_URL: string = "https://192.168.1.75:8443/api/auth";
    constructor(private httpClient: HttpClient) { }

    public getExamType(){
        let getURL = `${this.SERVER_URL}/getExamTypeList`; 
        return this.httpClient.get<any>(getURL,{
            observe: 'events',
            responseType: 'json'
        });
    }

    public getExamSubject(){
        let getURL = `${this.SERVER_URL}/getExamSubjectList`; 
        return this.httpClient.get<any>(getURL,{
            observe: 'events',
            responseType: 'json'
        });      
    }

    public getExamQuestions(exTypeId, exSubjId){

        let getURL = `${this.SERVER_URL}/getQuestionList`;
        const httpParams = {
            examTypeId: `${exTypeId}`, 
            examSubjId: `${exSubjId}`
        };
        return this.httpClient.get<any>(getURL,{
            observe: 'events',
            params: httpParams,
            responseType: 'json'
        });
    }

    static shuffle(array) {
        let currentIndex = array.length, temp, randomIndex;
    
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
    
          temp = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temp;
        }
        return array;
    }      
}