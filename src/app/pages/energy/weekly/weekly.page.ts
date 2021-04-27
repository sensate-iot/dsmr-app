import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DsmrService} from '../../../services/dsmr.service';
import { Chart } from 'chart.js';
import {EnergyDataPoint} from '../../../models/energydatapoint';
import {SettingsService} from '../../../services/settings.service';
import {mergeMap} from 'rxjs/operators';

@Component({
  selector: 'app-weekly',
  templateUrl: './weekly.page.html',
  styleUrls: ['./weekly.page.scss'],
})
export class WeeklyPage implements OnInit, AfterViewInit {
  @ViewChild('barCanvas') barCanvas: ElementRef;
  @ViewChild('groupedBarCanvas') groupedBarCanvas: ElementRef;
  @ViewChild('lineCanvas') lineCanvas: ElementRef;

  public gasUsageToday: string;
  public cost: string;
  public powerUsage: string;
  public powerProduction: string;

  private barChart: Chart;
  private groupedBarChart: Chart;
  private lineChart: Chart;

  private readonly barChartPowerUsage: number[];
  private readonly barChartPowerProduction: number[];
  private readonly lineGasUsage: number[];
  private readonly labels: string[];

  private readonly groupedEnergyUsage: number[];
  private readonly groupedEnergyProduction: number[];
  private readonly groupedLabels: string[];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  public constructor(private readonly dsmr: DsmrService,
                     private readonly settings: SettingsService) {
    this.lineGasUsage = [];
    this.labels = [];
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.groupedEnergyProduction = [];
    this.groupedEnergyUsage = [];
    this.groupedLabels = [];
  }

  public ngOnInit() {
  }

  public ngAfterViewInit(): void {
    this.loadGraphs();
    this.loadData().then();
  }

  public refresh(event: any): void {
    this.clearGraph();
    this.loadData().then(() => {
      event.target.complete();
    });
  }

  private refreshView() {
    this.barChart.update();
    this.groupedBarChart.update();
    this.lineChart.update();
  }

  private clearGraph() {
    this.lineGasUsage.length = 0;
    this.labels.length = 0;
    this.barChartPowerProduction.length = 0;
    this.barChartPowerUsage.length = 0;
    this.groupedEnergyProduction.length = 0;
    this.groupedEnergyUsage.length = 0;
    this.groupedLabels.length = 0;
  }

  private loadData() {
    return new Promise((resolve, reject) => {
      const startDate = WeeklyPage.getStartLastWeek();
      const endDate = WeeklyPage.getEndToday();
      const device = this.dsmr.getSelectedDevice();

      this.dsmr.getPowerData(device.id, startDate, endDate, 'day').pipe(mergeMap(result => {
        this.computeCards(result.data);
        this.computeCharts(result.data);

        return this.dsmr.getGroupedPowerData(device.id);
      })).subscribe(result => {
        console.log(result);

        result.data.forEach(x => {
          if (x.hour < 6 || x.hour > 22) {
            return;
          }

          this.groupedEnergyProduction.push(x.production / 1000);
          this.groupedEnergyUsage.push(x.usage / 1000);

          const hour = WeeklyPage.padNumer(x.hour, 2);
          this.groupedLabels.push(`${hour}:00`);
        });

        this.refreshView();
        resolve();
      }, error => {
        console.error(error);
        reject();
      });
    });
  }

  private computeCharts(data: EnergyDataPoint[]) {
    data.forEach(dp => {
      this.barChartPowerProduction.push(dp.energyProduction / 1000);
      this.barChartPowerUsage.push(dp.energyUsage / 1000);
      this.lineGasUsage.push(dp.gasFlow);
      this.labels.push(WeeklyPage.weekDays[dp.timestamp.getDay()]);
    });
  }

  private computeCards(data: EnergyDataPoint[]) {
    let usage = 0;
    let production = 0;
    let gasUsage = 0;

    data.forEach(dp => {
      usage += dp.energyUsage / 1000;
      production += dp.energyProduction / 1000;
      gasUsage += dp.gasFlow;
    });

    this.powerUsage = usage.toFixed(2);
    this.powerProduction = production.toFixed(2);
    this.gasUsageToday = gasUsage.toFixed(2);
    this.cost = this.computeCost(usage, production, gasUsage).toFixed(2);
  }

  private computeCost(usage: number, production: number, gas: number) {
    const prices = this.settings.getPrices();
    let cost = 0;

    cost += prices.powerUsage * usage;
    cost += prices.gas * gas;
    cost -= prices.powerProduction * production;

    return cost;
  }

  private loadGraphs() {
    // noinspection DuplicatedCode
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [
          {
            yAxisID: 'power',
            label: 'Usage',
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
            label: 'Production',
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
              callback: (tickValue, _) => `${tickValue}kWh`
            }
          }
        }
      }
    });

    this.groupedBarChart = new Chart(this.groupedBarCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.groupedLabels,
        datasets: [
          {
            yAxisID: 'power',
            label: 'Usage',
            data: this.groupedEnergyUsage,
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
            data: this.groupedEnergyProduction,
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
              callback: (tickValue, _) => `${tickValue}kWh`
            }
          }
        }
      }
    });

    // @ts-ignore
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.labels,
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
            data: this.lineGasUsage,
            spanGaps: false,
            yAxisID: 'gas'
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

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static getStartLastWeek() {
    const todayStart = new Date();

    todayStart.setHours(0,0,0);
    todayStart.setMilliseconds(0);
    todayStart.setDate(todayStart.getDate() - 7);

    return todayStart;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static getEndToday() {
    const todayEnd = new Date();

    todayEnd.setHours(23, 59,59);
    todayEnd.setMilliseconds(999);

    return todayEnd;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static padNumer(input: number, size: number) {
    let num = input.toString();

    while (num.length < size) {
      num = '0' + num;
    }

    return num;
  }
}
