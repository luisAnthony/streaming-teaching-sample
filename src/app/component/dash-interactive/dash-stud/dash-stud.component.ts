import { Component, OnInit, ViewChild} from '@angular/core';
import { DataAccessStorageService } from '../../../service/data-access-storage.service';
import { _STUDENT, _COURSE, _TEST} from '../../../model/_INDEX';
import { MatTable } from '@angular/material';
import { ChartType } from 'chart.js';
import { t } from '@angular/core/src/render3';

declare function setMuuri(): any;
declare function removeLayout(grid: any);
declare function setNewSavableMuuri(): any;
declare function loadLayout(p1, p2);
declare function serializeLayout(param);

const examTypeLabel = ["攻擊","防禦","偵察","戰略"];
//const examTypeLabel = ["Attack","Defense","Reconnaissance","Strategy"];
const lineColor = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)'   
];

const backColorRGBA = [
    'rgba(255, 99, 132, 0.5)',
    'rgba(255, 159, 64, 0.5)',
    'rgba(255, 205, 86, 0.5)',
    'rgba(75, 192, 192, 0.5)',
];

@Component({
    selector: 'dash-stud',
    templateUrl: './dash-stud.component.html',
    styleUrls: ['./dash-stud.component.css']
})

export class DashStudComponent implements OnInit{
    studentObj: _STUDENT;
    studCourse: _COURSE[];
    testList: _TEST[];
    courseColumns = ['id', 'name', 'count'];
    testColumns = ['id', 'name', 'type', 'score', 'date'];
    pieData: any;
    lineData: any;
    barData: any;
    polarData: any;
    legends: any;
    barOptions: any = {
        maintainAspectRatio: true,
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
        events: [],
    };
    polarOptions: any = {
        events: [],
    }
    

    @ViewChild('courseTable') cTable: MatTable<any>;
    @ViewChild('testTable') tTable: MatTable<any>;
    
    @ViewChild('pieChart') pieChart: any;
    @ViewChild('lineChart') lineChart: any;
    @ViewChild('barChart') barChart: any;
    @ViewChild('polarChart') polarChart: any;
    
    
    constructor(private dataService: DataAccessStorageService){}

    ngOnInit(){
        var self = this;
        this.studentObj = this.dataService.getStudent();
        this.studCourse = [];
        this.testList = [];

        this.studentObj.courses.forEach((c : _COURSE) => {
            this.studCourse.push(c);
        });

        this.studCourse[0].tests.forEach((t: _TEST) => {
            this.testList.push(t);
        });

        this.pieData = this.calculatePieData();
        this.lineData = this.calculateLineData();
        this.calculateBarPolarData(0);

        this.legends = {
            position: 'bottom',
          
            onHover: (e, item) => {
                console.log(item.index);
                var lineLabel = [];
                var typeScore = [];
                self.studCourse.forEach((sc: _COURSE) => {
                    sc.tests.forEach((ts: _TEST) => {
                        if(ts.tid == (item.index + 1))
                            typeScore.push(ts.score);
                    });
                });

                var examType = examTypeLabel[item.index];

                for(var i = 1; i<= typeScore.length; i++){
                    lineLabel.push(`e${i}`);
                }

                self.lineData = {
                    labels: lineLabel,
                    datasets: [
                        {
                            label: `Exam Type: ${examType}`,
                            data: typeScore,
                            fill: false,
                            borderColor: [
                            `${lineColor[item.index]}`,
                            ],
                            lineTension: 0.1,  
                        },
                        ],
                    };

                self.lineChart.type = "line";
                self.lineChart.data = self.lineData;
                self.lineChart.renderChart();
                self.lineChart.updateChart();
            },

            onLeave: (e, item) => {
                self.lineData = self.calculateLineData();
                self.lineChart.type = "line";
                self.lineChart.data = self.lineData;
                self.lineChart.renderChart();
                self.lineChart.updateChart();
            },
        };
        /*
        var grid = setMuuri();
        removeLayout(grid);
        */
        var grid = setNewSavableMuuri();

        var layout = window.localStorage.getItem('layout');
        if (layout) {
            loadLayout(grid, layout);
          } else {
            grid.layout(true);
        }        

    }

    updateExamData(course: _COURSE){
        this.testList= [];
        course.tests.forEach((t: _TEST) => {
            this.testList.push(t);
            this.tTable.renderRows();
        });

        var index = this.studCourse.findIndex((s: _COURSE) => {
            return (s.id == course.id);
        });
        this.calculateBarPolarData(index);
    }

    calculatePieData(): any{
        var sampleData
        if(this.studCourse && this.testList){
            var pieAverageScore = [];
            var totalScores = [];
            var totalCount = [];

            examTypeLabel.forEach(() => {
                totalScores.push(0);
                totalCount.push(0);
            });

            this.studCourse.forEach((s: _COURSE) => {
                s.tests.forEach((ts: _TEST) => {
                    totalScores[ts.tid - 1] = totalScores[ts.tid - 1] + ts.score;
                    totalCount[ts.tid - 1]++;
                });
            });

            var index = 0;
            examTypeLabel.forEach(() => {
                pieAverageScore.push(Math.round(
                    totalScores[index]/totalCount[index]
                ));
                index++;
            });

            sampleData = {
                labels: examTypeLabel,
                datasets: [
                {
                    label: 'Average Student Scoure for All Courses',
                    data: pieAverageScore,
                    fill: false,
                    backgroundColor: [
                    'rgba(255, 99, 132)',
                    'rgba(255, 159, 64)',
                    'rgba(255, 205, 86)',
                    'rgba(75, 192, 192)',
                    ],
                    borderColor: [
                    'rgb(255, 255, 255)',
                    'rgb(255, 255, 255)',
                    'rgb(255, 255, 255)',
                    'rgb(255, 255, 255)',
                    ],
                    borderWidth: 1,
                },
                ],
            };
        }

        return sampleData;
    }

    calculateLineData(): any {
        var sampleData;
        var tempDataSets = [];

        var index = 0;
        var lineLabel = [];

        var examData  = [];

        for(var i = 0; i<examTypeLabel.length; i++){
            var arr = [];
            examData.push({
                data: arr
            });
        }

        if(this.studCourse && this.testList){
            this.studCourse.forEach((s: _COURSE) => {

                s.tests.forEach((ts: _TEST) => {
                    examData[ts.tid - 1].data.push(ts.score);
                });

            });

            var maxLen = 0;
            examData.forEach(s => {
                if(maxLen < s.data.length)
                    maxLen = s.data.length;
            });

            for( var i = 1; i <= maxLen; i++){
                lineLabel.push(`e${i}`);
            }

            examTypeLabel.forEach(lbl => {
                tempDataSets.push({
                    label: `${lbl}`,
                    data: examData[index].data,
                    fill: false,
                    borderColor: `${lineColor[index]}`,
                    lineTension: 0.1,                    
                });
                index++;               
            });

 
            
            sampleData = {
                labels: lineLabel,
                datasets: tempDataSets,
            }            
        }

        return sampleData;
    }

    calculateBarPolarData(idx: number){

        var bData = [];
        var dtLbl;
        var totalScores = [];
        var totalCount = [];

        examTypeLabel.forEach(() => {
            totalScores.push(0);
            totalCount.push(0);
        }); 
        

        if(this.studCourse && this.testList){
            dtLbl = this.studCourse[idx].name;
            this.studCourse[idx].tests.forEach((ts: _TEST) => {
                totalScores[ts.tid - 1] = totalScores[ts.tid - 1] + ts.score;
                totalCount[ts.tid - 1]++;
            });
        }   

        var index = 0;

        examTypeLabel.forEach(lbl => {
            bData.push(Math.round(
                totalScores[index]/totalCount[index]
            ));
            index++;               
        });
        
        this.barData = {
            labels: examTypeLabel,
            datasets: [
            {
                label: `${dtLbl} 平均分數`,
                data: bData,
                fill: false,
                backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(255, 205, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                ],
                borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                ],
                borderWidth: 1,
            },
            ],
        };
        this.barChart.type = "bar";
        this.barChart.data = this.barData;
        this.barChart.options = this.barOptions;
        this.barChart.renderChart();
        this.barChart.updateChart();

        this.polarData = {
            labels: examTypeLabel,
            datasets: [
            {
                label: `${dtLbl} dataset`,
                data: bData,
                fill: false,
                backgroundColor: [
                'rgba(255, 99, 132,0.5)',
                'rgba(255, 159, 64,0.5)',
                'rgba(255, 205, 86,0.5)',
                'rgba(75, 192, 192,0.5)',
                ],
                borderColor: [
                'rgb(255, 255, 255)',
                'rgb(255, 255, 255)',
                'rgb(255, 255, 255)',
                'rgb(255, 255, 255)',
                ],
                borderWidth: 1,
            },
            ],
        };

        this.polarChart.type = "polarArea";
        this.polarChart.data = this.polarData;
        this.polarChart.renderChart();
        this.polarChart.updateChart();        
        
    }    

}
