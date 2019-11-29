export class _TEST {
    id: number;
    courseId: number;
    studentId: number;
    classId: number;
    tid: number;
    type: string;
    name: string;
    score: number;
    date: string;

    constructor(data: any){
        data = data || {};
        this.id = data.id;
        this.courseId = data.courseId;
        this.studentId = data.studetnId;
        this.classId = data.classId;
        this.name = data.name;
        this.tid = data.tid;
        this.type = data.type;
        this.score = data.score;
        let tempDate: string = data.date;
        var arrTemp = tempDate.split(" ");
        this.date = arrTemp[0];
    }
}