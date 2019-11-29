import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _CLASS, _STUDENT } from '../model/_INDEX';

@Injectable({
    providedIn: 'root'
  })
export class DataAccessStorageService {
    private _class : _CLASS;
    private _student : _STUDENT;

    constructor(private http: HttpClient){}

    get(url: string){
        return this.http.get(url);
    }

    getAll() {
        return [
            { id: 'data/Class-A.json', name: 'Class A'},
            { id: 'data/Class-B.json', name: 'Class B'}
        ];
    }

    public setClass(_class: _CLASS){
        this._class = _class;
    }

    public getClass(): _CLASS {
        return this._class;
    }

    public setStudent(_student: _STUDENT){
        this._student = _student;
    }

    public getStudent(): _STUDENT {
        return this._student;
    }   
}