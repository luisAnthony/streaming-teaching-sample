import { _COURSE } from "./_COURSE";

export class _STUDENT{
    id: number;
    classId: number;
    name: string; 
    courses: _COURSE[];
    count: number;
    date: string;
    
    constructor(data: any){
        data = data || {};
        this.id = data.id;
        this.classId = data.classId;
        this.name = data.name;
        this.date = data.date;
        this.courses = [];
        data.courses.forEach(c => {
            this.courses.push(new _COURSE(c));
        });
        this.count = this.courses.length;
    }
}