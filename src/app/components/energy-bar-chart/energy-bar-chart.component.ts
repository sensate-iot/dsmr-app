import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-energy-bar-chart',
  templateUrl: './energy-bar-chart.component.html',
  styleUrls: ['./energy-bar-chart.component.scss'],
})
export class EnergyBarChartComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('energyCanvas') energyCanvas: ElementRef;

  @Input() labels: string[];
  @Input() productionValues: number[];
  @Input() usageValues: number[];
  @Input() unit: string;
  @Input() title: string;

  private barChart: Chart;
  private loaded: boolean;
  private readonly internalLabels: string[];
  private readonly internalUsageValues: number[];
  private readonly internalProductionValues: number[];

  public constructor() {
    this.loaded = false;
    this.internalLabels = [];
    this.internalProductionValues = [];
    this.internalUsageValues = [];
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!this.loaded) {
      return;
    }

    this.internalLabels.length = 0;
    this.internalProductionValues.length = 0;
    this.internalUsageValues.length = 0;

    this.copy();
    this.barChart.update();
  }

  public ngAfterViewInit(): void {
    this.buildChart();
    this.loaded = true;
  }

  public ngOnInit() {}

  private copy() {
    this.productionValues.forEach(x => {
      this.internalProductionValues.push(x);
    });

    this.usageValues.forEach(x => {
      this.internalUsageValues.push(x);
    });

    this.labels.forEach(x => {
      this.internalLabels.push(x);
    });
  }

  private buildChart() {
    this.barChart = new Chart(this.energyCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.internalLabels,
        datasets: [
          {
            yAxisID: 'power',
            label: 'Usage',
            data: this.internalUsageValues,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)'
            ],
            borderColor: [
              'rgba(255,99,132,1)'
            ],
            borderWidth: 1
          },
          {
            yAxisID: 'power',
            label: 'Production',
            data: this.internalProductionValues,
            backgroundColor: [
              'rgba(99, 255, 132, 0.2)'
            ],
            borderColor: [
              'rgba(99,255,132,1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          power: {
            position: 'left',
            type: 'linear',
            ticks: {
              callback: (tickValue, _) => `${tickValue}${this.unit}`
            }
          }
        }
      }
    });
  }
}
