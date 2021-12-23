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
  @Input() firstSeriesValues: number[];
  @Input() secondSeriesValues: number[];
  @Input() firstSeriesTitle: string;
  @Input() secondSeriesTitle: string;
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
    this.addSecondXAxisIf();
    this.barChart.update();
  }

  public ngAfterViewInit(): void {
    this.buildChart();
    this.loaded = true;
  }

  public ngOnInit() {}

  private copy() {
    this.copyIf(this.firstSeriesValues, this.internalUsageValues);
    this.copyIf(this.secondSeriesValues, this.internalProductionValues);


    this.labels.forEach(x => {
      this.internalLabels.push(x);
    });
  }

  private copyIf(series: number[], target: number[]) {
    if(series == null) {
      return;
    }

    series.forEach(v => {
      target.push(v);
    });
  }

  private buildChart() {
    this.barChart = new Chart(this.energyCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.internalLabels,
        datasets: []
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

    this.buildXAxis();
  }

  private buildXAxis() {
    this.barChart.data.datasets.push(this.buildFirstAxis());
    this.addSecondXAxisIf();
  }

  private addSecondXAxisIf() {
    if(this.barChart.data.datasets.length >= 2) {
      return;
    }

    if(this.secondSeriesValues != null && this.secondSeriesValues.length > 0) {
      this.barChart.data.datasets.push(this.buildSecondAxis());
    }
  }

  private buildFirstAxis() {
    return {
      yAxisID: 'power',
      label: this.firstSeriesTitle ?? 'Usage',
      data: this.internalUsageValues,
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)'
      ],
      borderColor: [
        'rgba(255,99,132,1)'
      ],
      borderWidth: 1
    };
  }

  private buildSecondAxis() {
    return {
      yAxisID: 'power',
      label: this.secondSeriesTitle ?? 'Production',
      data: this.internalProductionValues,
      backgroundColor: [
        'rgba(99, 255, 132, 0.2)'
      ],
      borderColor: [
        'rgba(99,255,132,1)'
      ],
      borderWidth: 1
    };
  }
}
