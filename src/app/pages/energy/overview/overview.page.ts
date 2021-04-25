import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart, DoughnutController, Legend,
  LinearScale,
  LineController, LineElement,
  PointElement,
  Title
} from 'chart.js';

import {DsmrService} from '../../../services/dsmr.service';
import {Subject} from 'rxjs';
import {mergeMap, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {EnergyDataPoint} from '../../../models/energydatapoint';
import {EnvironmentService} from '../../../services/environment.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
})
export class OverviewPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barCanvas') barCanvas: ElementRef;
  @ViewChild('doughnutCanvas') doughnutCanvas: ElementRef;
  @ViewChild('lineCanvas') lineCanvas: ElementRef;

  public gasUsageToday: string;
  public temperature: string;
  public powerUsage: string;
  public powerProduction: string;

  private barChart: Chart;
  private doughnutChart: Chart;
  private lineChart: Chart;

  private readonly barChartPowerUsage: number[];
  private readonly barChartPowerProduction: number[];
  private readonly doughnutPowerData: number[];
  private readonly lineGasUsageToday: number[];
  private readonly lineTemperatureToday: number[];
  private readonly lineGasUsageLabels: string[];
  private readonly labels: string[];

  private readonly destroy$;

  public constructor(private readonly dsmr: DsmrService,
                     private readonly env: EnvironmentService) {
    this.destroy$ = new Subject();
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.doughnutPowerData = [];
    this.lineGasUsageLabels = [];
    this.lineGasUsageToday = [];
    this.lineTemperatureToday = [];
    this.labels = [];
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit() {
    this.loadGraphs();
    this.loadData().then();
  }

  public refresh(event: any) {
    this.clearGraph();

    this.loadData().then(() => {
      event.target.complete();
    });
  }

  private loadPowerToday() {
    const todayStart = OverviewPage.getStartToday();
    const todayEnd = OverviewPage.getEndToday();

    return this.dsmr.getPowerData(1, todayStart, todayEnd, 'hour');
  }

  private loadEnvironmentToday() {
    const todayStart = OverviewPage.getStartToday();
    const todayEnd = OverviewPage.getEndToday();

    return this.env.getEnvironmentData(1, todayStart, todayEnd, 'hour');
  }

  private clearGraph() {
    this.barChartPowerProduction.length = 0;
    this.barChartPowerUsage.length = 0;
    this.doughnutPowerData.length = 0;
    this.lineGasUsageLabels.length = 0;
    this.lineGasUsageToday.length = 0;
    this.lineTemperatureToday.length = 0;
    this.labels.length = 0;
  }

  private loadData() {
    return new Promise((resolve, reject) => {
      const device = this.dsmr.getSelectedDevice();

      this.dsmr.getLatestData(device.id)
        .pipe(takeUntil(this.destroy$), mergeMap(resp => {
          const data = resp.data;

          this.temperature = data.temperature.toFixed(2);
          this.powerUsage = data.powerUsage.toFixed(2);
          this.powerProduction = data.powerProduction.toFixed(2);
          const gas = data.gasFlow * 1000;
          this.gasUsageToday = gas.toFixed(2);

          return this.loadPowerToday();
        }), mergeMap(resp => {
          const now = moment(new Date()).add(-12, 'hours');

          resp.data.forEach(dp => {
            const dpMoment = moment(dp.timestamp).local();

            if(dpMoment < now) {
              return;
            }

            this.barChartPowerProduction.push(dp.energyProduction);
            this.barChartPowerUsage.push(dp.energyUsage);
            this.labels.push(OverviewPage.getHourMinutes(dp.timestamp));
          });

          this.computeAndSetUsageToday(resp.data);
          return this.loadEnvironmentToday();
        })).subscribe(resp => {
        resp.data.forEach(dp => {
          this.lineTemperatureToday.push(dp.insideTemperature);
        });

        this.refreshView();
        resolve();
      }, error => {
        console.error(error);
        reject();
      });
    });
  }

  private refreshView() {
    this.barChart.update();
    this.doughnutChart.update();
    this.lineChart.update();
  }

  private computeAndSetUsageToday(today: EnergyDataPoint[]) {
    let energyUsage = 0;
    let gasUsage = 0;
    let lowTariffTotal = 0;
    let normalTariffTotal = 0;

    today.forEach(dp => {
      gasUsage += dp.gasFlow / 1000.0;
      energyUsage += dp.energyUsage;

      this.lineGasUsageToday.push(dp.gasFlow);
      this.lineGasUsageLabels.push(OverviewPage.getHourMinutes(dp.timestamp));

      if(dp.tariff === 'Normal') {
        normalTariffTotal += dp.energyUsage;
      } else {
        lowTariffTotal += dp.energyUsage;
      }
    });

    this.doughnutPowerData.push(normalTariffTotal / energyUsage * 100);
    this.doughnutPowerData.push(lowTariffTotal / energyUsage * 100);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static getHourMinutes(date: Date) {
    return moment(date).local().format('HH:mm');
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static getStartToday() {
    const todayStart = new Date();

    todayStart.setHours(0,0,0);
    todayStart.setMilliseconds(0);

    return todayStart;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static getEndToday() {
    const todayEnd = new Date();

    todayEnd.setHours(23, 59,59);
    todayEnd.setMilliseconds(999);

    return todayEnd;
  }

  private loadGraphs() {
    // @ts-ignore
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [
          {
            yAxisID: 'power',
            label: 'Power Usage',
            data: this.barChartPowerUsage,
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
            label: 'Power Production',
            data: this.barChartPowerProduction,
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
              callback: (tickValue, _) => `${tickValue}W`
            }
          }
        }
      }
    });

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Normal Tariff', 'Low Tariff'],
        datasets: [
          {
            label: '% of low/high tariff',
            data: this.doughnutPowerData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(99, 255, 132, 0.2)'
            ],
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: true,
          }
        }
      }
    });

    // @ts-ignore
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.lineGasUsageLabels,
        datasets: [
          {
            label: 'Gas Usage',
            fill: false,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(75,192,192,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.lineGasUsageToday,
            spanGaps: false,
            yAxisID: 'gas'
          },
          {
            label: 'Temperature',
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
            data: this.lineTemperatureToday,
            spanGaps: false,
            yAxisID: 'temperature'
          }
        ]
      },
      options: {
        scales: {
          gas: {
            position: 'left',
            type: 'linear',
            ticks: {
              callback: (tickValue, _) => `${tickValue}L/min`
            }
          },
          temperature: {
            position: 'right',
            type: 'linear',
            ticks: {
              callback: (tickValue, _) => `${tickValue}°C`
            }
          }
        }
      }
    });
  }
}
