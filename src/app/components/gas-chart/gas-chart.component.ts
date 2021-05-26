import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-gas-chart',
  templateUrl: './gas-chart.component.html',
  styleUrls: ['./gas-chart.component.scss'],
})
export class GasChartComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('gasCanvas') gasCanvas: ElementRef;
  @Input() labels: string[];
  @Input() barGasUsage: number[];

  private readonly internalBarGasUsage: number[];
  private readonly internalLabels: string[];
  private gasChart: Chart;
  private loaded: boolean;

  public constructor() {
    this.internalBarGasUsage = [];
    this.internalLabels = [];
    this.loaded = false;
  }

  public ngOnInit() {}

  public ngAfterViewInit(): void {
    this.loadGraphs();
    this.loaded = true;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!this.loaded) {
      return;
    }

    this.internalLabels.length = 0;
    this.internalBarGasUsage.length = 0;

    this.copy();
    this.gasChart.update();
  }

  private copy() {
    this.labels.forEach(x => {
      this.internalLabels.push(x);
    });

    this.barGasUsage.forEach(x => {
      this.internalBarGasUsage.push(x);
    });
  }

  private loadGraphs() {
    this.gasChart = new Chart(this.gasCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.internalLabels,
        datasets: [
          {
            yAxisID: 'gas',
            label: 'Gas Usage',
            data: this.internalBarGasUsage,
            backgroundColor: [
              'rgba(99, 99, 255, 0.2)'
            ],
            borderColor: [
              'rgba(99,99,255,1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          gas: {
            position: 'left',
            type: 'linear',
            ticks: {
              callback: (tickValue, _) => `${tickValue}m3`
            }
          }
        }
      }
    });
  }
}
