import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-cost-chart',
  templateUrl: './cost-chart.component.html',
  styleUrls: ['./cost-chart.component.scss'],
})
export class CostChartComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('costCanvas') costCanvas: ElementRef;

  @Input() labels: string[];
  @Input() values: number[];

  private lineChart: Chart;
  private loaded: boolean;
  private readonly internalLabels: string[];
  private readonly internalValues: number[];

  public constructor() {
    this.loaded = false;
    this.internalLabels = [];
    this.internalValues = [];
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!this.loaded) {
      return;
    }

    this.internalLabels.length = 0;
    this.internalValues.length = 0;
    this.copy();

    this.lineChart.update();
  }

  public ngAfterViewInit(): void {
    this.buildChart();
    this.loaded = true;
  }

  public ngOnInit() {}

  private copy() {
    this.values.forEach(x => {
      this.internalValues.push(x);
    });

    this.labels.forEach(x => {
      this.internalLabels.push(x);
    });
  }

  private buildChart() {
    this.lineChart = new Chart(this.costCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.internalLabels,
        datasets: [
          {
            label: 'Cost',
            fill: false,
            backgroundColor: 'rgba(75,255,75,0.4)',
            borderColor: 'rgba(75,255,75,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(75,255,75,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(75,255,75,1)',
            pointHoverBorderColor: 'rgba(220,255,75,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.internalValues,
            spanGaps: false,
            yAxisID: 'cost'
          }
        ]
      },
      options: {
        scales: {
          cost: {
            position: 'right',
            type: 'linear',
            ticks: {
              callback: (tickValue, _) => `€${tickValue}`
            }
          }
        }
      }
    });
  }
}
