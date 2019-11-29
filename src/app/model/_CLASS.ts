import { _STUDENT } from "./_STUDENT";

export class _CLASS{
    id: number;
    name: string;
    date: string;
    count: number;
    students: _STUDENT[];

    constructor(data: any){
        data = data || {};
        this.id = data.id;
        this.name = data.name;
        this.date = data.date;
        this.students = [];
        data.students.forEach(s => {
            this.students.push(new _STUDENT(s));
        });
        this.count = this.students.length;
    }
}