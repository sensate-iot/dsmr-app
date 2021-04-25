import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DsmrService} from '../../../services/dsmr.service';
import {
  ArcElement,
  BarController,
  BarElement, CategoryScale,
  Chart,
  DoughnutController, Legend, LinearScale,
  LineController,
  LineElement,
  PointElement, Title
} from 'chart.js';
import {EnergyDataPoint} from "../../../models/energydatapoint";
import {SettingsService} from "../../../services/settings.service";

@Component({
  selector: 'app-weekly',
  templateUrl: './weekly.page.html',
  styleUrls: ['./weekly.page.scss'],
})
export class WeeklyPage implements OnInit, AfterViewInit {
  @ViewChild('barCanvas') barCanvas: ElementRef;
  @ViewChild('doughnutCanvas') doughnutCanvas: ElementRef;
  @ViewChild('lineCanvas') lineCanvas: ElementRef;

  public gasUsageToday: string;
  public cost: string;
  public powerUsage: string;
  public powerProduction: string;

  private barChart: Chart;
  private doughnutChart: Chart;
  private lineChart: Chart;

  private readonly barChartPowerUsage: number[];
  private readonly barChartPowerProduction: number[];
  private readonly doughnutPowerData: number[];
  private readonly lineGasUsage: number[];
  private readonly labels: string[];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  public constructor(private readonly dsmr: DsmrService,
                     private readonly settings: SettingsService) {
    this.lineGasUsage = [];
    this.labels = [];
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.doughnutPowerData = [];

    Chart.register(LineController, BarController,
      PointElement,
      BarElement,
      DoughnutController,
      ArcElement,
      LineElement,
      Legend,
      CategoryScale, LinearScale, Title);
  }

  public ngOnInit() {
  }

  public ngAfterViewInit(): void {
    this.loadGraphs();
    this.loadData().then();
  }

  public refresh(event: any): void {
  }

  private refreshView() {
    this.barChart.update();
    this.doughnutChart.update();
    this.lineChart.update();
  }

  private loadData() {
    return new Promise((resolve, reject) => {
      const startDate = WeeklyPage.getStartLastWeek();
      const endDate = WeeklyPage.getEndToday();
      const device = this.dsmr.getSelectedDevice();

      this.dsmr.getPowerData(device.id, startDate, endDate, 'day').subscribe(result => {
        this.computeCards(result.data);
        this.computeCharts(result.data);

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

    this.doughnutPowerData.push(usage);
    this.doughnutPowerData.push(production);

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

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Energy Usage', 'Energy Production'],
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
}
