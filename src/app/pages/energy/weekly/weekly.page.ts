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
  private readonly lineGasUsageToday: number[];
  private readonly lineGasUsageLabels: string[];
  private readonly labels: string[];

  public constructor(private readonly dsmr: DsmrService) {
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.doughnutPowerData = [];
    this.lineGasUsageLabels = [];
    this.lineGasUsageToday = [];
    this.labels = [];

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
        let usage = 0;
        let production = 0;
        let gasUsage = 0;

        result.data.forEach(data => {
          usage += data.energyUsage / 1000;
          production += data.energyProduction / 2000;
          gasUsage += data.gasFlow;
        });

        this.doughnutPowerData.push(usage);
        this.doughnutPowerData.push(production);

        this.powerUsage = usage.toFixed(2);
        this.powerProduction = production.toFixed(2);
        this.gasUsageToday = gasUsage.toFixed(2);

        this.refreshView();
        resolve();
      }, error => { reject(); });
    });
  }

  private loadGraphs() {
    const todayStart = new Date();
    const todayEnd = new Date();

    todayStart.setHours(0,0,0);
    todayStart.setMilliseconds(0);

    todayEnd.setHours(23, 59,59);
    todayEnd.setMilliseconds(999);
    // @ts-ignore
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        //labels: this.labels,
        labels: ['ma', 'di', 'wo'],
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
