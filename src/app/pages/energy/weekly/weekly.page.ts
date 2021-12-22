import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DsmrService} from '../../../services/dsmr.service';
import { Chart } from 'chart.js';
import {EnergyDataPoint} from '../../../models/energydatapoint';
import {SettingsService} from '../../../services/settings.service';
import {Response} from '../../../models/response';
import {mergeMap} from 'rxjs/operators';
import {GroupedPowerData} from '../../../models/groupedpowerdata';
import {Device} from '../../../models/device';
import { HourlyPowerAverage } from 'app/models/HourlyPowerAverage';

@Component({
  selector: 'app-weekly',
  templateUrl: './weekly.page.html',
  styleUrls: ['./weekly.page.scss'],
})
export class WeeklyPage implements OnInit, AfterViewInit {
  @ViewChild('lineCanvas') lineCanvas: ElementRef;

  public costLabels: string[];
  public costValues: number[];
  public gasUsageToday: string;
  public credit: string;
  public cost: string;
  public powerUsage: string;
  public powerProduction: string;
  public netEnergyUsage: string;

  public groupedEnergyUsage: number[];
  public groupedEnergyProduction: number[];
  public groupedLabels: string[];

  public barChartPowerUsage: number[];
  public barChartPowerProduction: number[];
  public labels: string[];
  public device: Device;

  private readonly gasLabels: string[];
  private lineChart: Chart;

  private readonly lineGasUsage: number[];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  public constructor(private readonly dsmr: DsmrService,
                     private readonly settings: SettingsService) {
    this.lineGasUsage = [];
    this.labels = [];
    this.gasLabels = [];
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.groupedEnergyProduction = [];
    this.groupedEnergyUsage = [];
    this.groupedLabels = [];
    this.costLabels = [];
    this.costValues = [];
  }

  public ngOnInit() {
    this.device = this.dsmr.getSelectedDevice();
  }

  public ngAfterViewInit(): void {
    this.loadGraphs();
    this.loadData().then(() => { });
  }

  public refresh(event: any): void {
    this.clearGraph();
    this.loadData().then(() => {
      event.target.complete();
    });
  }

  private refreshView() {
    this.lineChart.update();
  }

  private clearGraph() {
    this.lineGasUsage.length = 0;
    this.gasLabels.length = 0;
    this.costValues.length = 0;
    this.costLabels.length = 0;

    this.labels = [];
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.groupedEnergyProduction = [];
    this.groupedEnergyUsage = [];
    this.groupedLabels = [];
  }

  private loadData() {
    return new Promise<void>((resolve, reject) => {
      const startDate = WeeklyPage.getStartLastWeek();
      const endDate = WeeklyPage.getEndToday();
      const device = this.dsmr.getSelectedDevice();

      this.dsmr.getPowerData(device.id, startDate, endDate, 'day').pipe(mergeMap((result: Response<EnergyDataPoint[]>) => {
        this.computeCards(result.data);
        this.computeCharts(result.data);
        this.computeCostChart(result.data);

        return this.dsmr.getAverageEnergyData(device.id, WeeklyPage.getStartLastWeek(), WeeklyPage.getEndToday());
      }), mergeMap((result: Response<HourlyPowerAverage[]>) => {
        this.computeEnergyAveragesThisWeek(result.data);
        return this.dsmr.getAverageEnergyData(device.id, WeeklyPage.getStartLastMonth(), WeeklyPage.getEndLastWeek());
      })).subscribe((result: Response<HourlyPowerAverage[]>) => {
        this.computeEnergyAveragesThisMonth(result.data);
        this.refreshView();
        resolve();
      }, _ => {
        reject();
      });
    });
  }

  private computeEnergyAveragesThisMonth(data: HourlyPowerAverage[]) {
    const resultsLastMonth: number[] = [];

    data.forEach(x => {
      if(x.hour.getHours() < 6 || x.hour.getHours() > 23) {
        return;
      }

      resultsLastMonth.push(x.averagePowerUsage);
    });

    this.groupedEnergyProduction = resultsLastMonth;
  }

  private computeEnergyAveragesThisWeek(data: HourlyPowerAverage[]) {
    const resultsThisWeek: number[] = [];
    const labels: string[] = [];

    data.forEach(x => {
      if(x.hour.getHours() < 6 || x.hour.getHours() > 23) {
        return;
      }

      resultsThisWeek.push(x.averagePowerUsage);
      labels.push(`${x.hour.getHours()}:00`);
    });

    this.groupedLabels = labels;
    this.groupedEnergyUsage = resultsThisWeek;
  }

  private computeGroupedChart(data: GroupedPowerData[]) {
    const usage: number [] = [];
    const production: number[] = [];
    const labels: string[] = [];

    data.forEach(x => {
      if (x.hour < 6 || x.hour > 22) {
        return;
      }

      production.push(x.production / 1000);
      usage.push(x.usage / 1000);

      const hour = WeeklyPage.padNumer(x.hour, 2);
      labels.push(`${hour}:00`);
    });

    this.groupedLabels = labels;
    this.groupedEnergyProduction = production;
    this.groupedEnergyUsage = usage;
  }

  private computeCharts(data: EnergyDataPoint[]) {
    const usage: number[] = [];
    const production: number[] = [];
    const labels: string[] = [];

    data.forEach(dp => {
      production.push(dp.energyProduction / 1000);
      usage.push(dp.energyUsage / 1000);
      this.lineGasUsage.push(dp.gasFlow);

      const day = WeeklyPage.weekDays[dp.timestamp.getDay()];
      labels.push(day);
      this.gasLabels.push(day);
    });

    this.barChartPowerUsage = usage;
    this.barChartPowerProduction = production;
    this.labels = labels;
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

    const netEnergy = usage - production;
    this.netEnergyUsage = netEnergy.toFixed(2);
    this.powerUsage = usage.toFixed(2);
    this.powerProduction = production.toFixed(2);
    this.gasUsageToday = gasUsage.toFixed(2);
    this.cost = this.computeCost(usage, production, gasUsage).toFixed(2);
  }

  private computeTariff() {
  }

  private computeCost(usage: number, production: number, gas: number) {
    const prices = this.settings.getPrices();
    let cost = 0;

    cost += prices.powerUsage * usage;
    cost += prices.gas * gas;
    cost -= prices.powerProduction * production;

    return cost;
  }

  private computeCostChart(data: EnergyDataPoint[]) {
    const prices = this.settings.getPrices();
    const labels: string[] = [];
    const values: number[] = [];

    data.forEach(x => {
      let cost = x.energyUsage / 1000 * prices.powerUsage;
      cost -= x.energyProduction / 1000 * prices.powerProduction;
      cost += x.gasFlow * prices.gas;

      labels.push(WeeklyPage.weekDays[x.timestamp.getDay()]);
      values.push(cost);
    });

    this.costLabels = labels;
    this.costValues = values;
  }

  private loadGraphs() {
    // @ts-ignore
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.gasLabels,
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
  private static getEndLastWeek() {
    const endLastWeek = new Date();

    endLastWeek.setHours(23, 59, 59);
    endLastWeek.setMilliseconds(0);
    endLastWeek.setDate(endLastWeek.getDate() - 7);
    return endLastWeek;
  }

    // eslint-disable-next-line @typescript-eslint/member-ordering
  private static getStartLastMonth() {
    const lastMonth = new Date();

    lastMonth.setHours(0,0,0);
    lastMonth.setMilliseconds(0);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(lastMonth.getDate() - 7);
    return lastMonth;
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
