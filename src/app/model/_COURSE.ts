import { _TEST } from "./_TEST";

export class _COURSE {
    id: number;
    studentId: number;
    classId: number;
    name: string;
    tests: _TEST[];
    count: number;

    constructor(data: any){
        data = data || {};
        this.id = data.id;
        this.studentId = data.studetnId;
        this.classId = data.classId;
        this.name = data.name;
        this.tests = [];
        data.exams.forEach(t => { 
            this.tests.push(new _TEST(t));
        });
        this.count = this.tests.length
    }
}