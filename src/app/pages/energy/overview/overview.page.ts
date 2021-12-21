import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Chart } from 'chart.js';
import {DsmrService} from '../../../services/dsmr.service';
import {Subject} from 'rxjs';
import {mergeMap, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {EnergyDataPoint} from '../../../models/energydatapoint';
import {EnvironmentService} from '../../../services/environment.service';
import {Device} from '../../../models/device';
import {Response} from '../../../models/response';
import { EnvironmentDataPoint } from 'src/app/models/environmentdatapoint';
import { MeterReading } from 'src/app/models/meterreading';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
})
export class OverviewPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('doughnutCanvas') doughnutCanvas: ElementRef;
  @ViewChild('lineCanvas') lineCanvas: ElementRef;

  public gasUsageToday: string;
  public temperature: string;
  public powerUsage: string;
  public powerProduction: string;
  public outsideAirTemperature: string;
  public barChartPowerUsage: number[];
  public barChartPowerProduction: number[];
  public energyLabels: string[];
  public device: Device;

  private doughnutChart: Chart;
  private lineChart: Chart;

  private readonly doughnutPowerData: number[];
  private readonly lineEnergyUsageToday: number[];
  private readonly lineTemperatureToday: number[];
  private readonly energyUsageLabels: string[];

  private readonly destroy$;

  public constructor(private readonly dsmr: DsmrService,
                     private readonly env: EnvironmentService) {
    this.destroy$ = new Subject();
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.doughnutPowerData = [];
    this.energyUsageLabels = [];
    this.lineEnergyUsageToday = [];
    this.lineTemperatureToday = [];
    this.energyLabels = [];
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public ngOnInit(): void {
    this.device = this.dsmr.getSelectedDevice();
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
    const device = this.dsmr.getSelectedDevice();

    return this.dsmr.getPowerData(device.id, todayStart, todayEnd, 'hour');
  }

  private loadEnvironmentToday() {
    const todayStart = OverviewPage.getStartToday();
    const todayEnd = OverviewPage.getEndToday();
    const device = this.dsmr.getSelectedDevice();

    return this.env.getEnvironmentData(device.id, todayStart, todayEnd, 'hour');
  }

  private clearGraph() {
    this.doughnutPowerData.length = 0;
    this.energyUsageLabels.length = 0;
    this.lineEnergyUsageToday.length = 0;
    this.lineTemperatureToday.length = 0;

    this.energyLabels = [];
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
  }

  private loadData() {
    return new Promise<void>((resolve, reject) => {
      const device = this.dsmr.getSelectedDevice();

      this.dsmr.getLatestData(device.id)
        .pipe(takeUntil(this.destroy$), mergeMap((resp: Response<MeterReading>) => {
          const data = resp.data;

          this.temperature = data.temperature.toFixed(2);
          this.powerUsage = data.powerUsage.toFixed(2);
          this.outsideAirTemperature = data.outsideAirTemperature.toFixed(2);
          this.powerProduction = data.powerProduction.toFixed(2);
          const gas = data.gasFlow * 1000;
          this.gasUsageToday = gas.toFixed(2);

          return this.loadPowerToday();
        }), mergeMap((resp: Response<EnergyDataPoint[]>) => {
          this.computePowerChart(resp.data);
          this.computeAndSetUsageToday(resp.data);

          return this.loadEnvironmentToday();
        })).subscribe((resp: Response<EnvironmentDataPoint[]>) => {
          resp.data.forEach(dp => {
          this.lineTemperatureToday.push(dp.insideTemperature);
        });

        this.refreshView();
        resolve();
      }, _ => {
        reject();
      });
    });
  }

  private computePowerChart(data: EnergyDataPoint[]) {
    const now = moment(new Date()).add(-12, 'hours');
    const production: number[] = [];
    const usage: number[] = [];
    const labels: string[] = [];

    data.forEach(dp => {
      const dpMoment = moment(dp.timestamp).local();

      if(dpMoment < now) {
        return;
      }

      production.push(dp.energyProduction);
      usage.push(dp.energyUsage);
      labels.push(OverviewPage.getHourMinutes(dp.timestamp));
    });

    this.energyLabels = labels;
    this.barChartPowerProduction = production;
    this.barChartPowerUsage = usage;
  }

  private refreshView() {
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

      if(this.device.hasGasSensor) {
        this.lineEnergyUsageToday.push(dp.gasFlow);
      } else {
        this.lineEnergyUsageToday.push(dp.energyUsage);
      }

      this.energyUsageLabels.push(OverviewPage.getHourMinutes(dp.timestamp));

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

    let labelName = 'Energy';
    let unit = 'kWh';

    if(this.device.hasGasSensor) {
      labelName = 'Gas';
      unit = 'L/min';
    }

    // @ts-ignore
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.energyUsageLabels,
        datasets: [
          {
            label: labelName,
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
            data: this.lineEnergyUsageToday,
            spanGaps: false,
            yAxisID: 'energy'
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
          energy: {
            position: 'left',
            type: 'linear',
            ticks: {
              callback: (tickValue, _) => `${tickValue}${unit}`
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
