import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DsmrService} from '../../../services/dsmr.service';
import {SettingsService} from '../../../services/settings.service';
import {EnergyDataPoint} from '../../../models/energydatapoint';
import {mergeMap} from 'rxjs/operators';
import {HistoricData} from '../../../models/historicdata';
import {EnergyUsage} from "../../../models/energyusage";

@Component({
  selector: 'app-monthly',
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
})
export class MonthlyPage implements OnInit, AfterViewInit {

  public gasUsageMonthly: string;
  public cost: string;
  public powerUsage: string;
  public powerProduction: string;
  public costLabels: string[];
  public costValues: number[];
  public barChartPowerUsage: number[];
  public barChartPowerProduction: number[];
  public barGasUsage: number[];
  public labels: string[];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static months = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
    'Jun', 'Jul', 'Sept', 'Oct', 'Nov', 'Dec'];

  public constructor(private readonly dsmr: DsmrService,
                     private readonly settings: SettingsService) {
    this.barGasUsage = [];
    this.labels = [];
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.costLabels = [];
    this.costValues = [];
  }

  public ngOnInit() {
  }

  public ngAfterViewInit(): void {
    this.loadData().then();
  }

  public refresh(event: any): void {
    this.clearGraph();
    this.loadData().then(() => {
      event.target.complete();
    });
  }

  private clearGraph() {
    this.costValues.length = 0;
    this.costLabels.length = 0;

    this.labels = [];
    this.barGasUsage = [];
  }

  private loadData() {
    return new Promise((resolve, reject) => {
      const startDate = MonthlyPage.getFirstOfMonth();
      const endDate = MonthlyPage.getEndToday();
      const device = this.dsmr.getSelectedDevice();

      this.dsmr.getPowerData(device.id, startDate, endDate, 'day')
        .pipe(mergeMap(result => {
          this.computeCostChart(result.data);
          const firstMonthDate = MonthlyPage.addMonths(startDate, -3);

          return this.dsmr.getPowerData(device.id, firstMonthDate, endDate, 'day');
        }), mergeMap(result => {
          this.computeCharts(result.data);
          return this.dsmr.getEnergyUsage(device.id, startDate, endDate);
        })).subscribe(result => {
          this.computeCards(result.data);
          resolve();
      }, _ => {
        reject();
      });
    });
  }

  private computeCharts(data: EnergyDataPoint[]) {
    const history = new Map<number, HistoricData>();

    data.forEach(dp => {
      const month = dp.timestamp.getMonth();

      if(!history.has(month)) {
        history.set(month, new HistoricData());
      }

      const entry = history.get(month);
      entry.gasUsage += dp.gasFlow;
      entry.powerProduction += dp.energyProduction / 1000;
      entry.powerUsage += dp.energyUsage/ 1000;
    });

    this.renderBarChart(history);
  }

  private renderBarChart(map: Map<number, HistoricData>) {
    const powerUsage: number[] = [];
    const powerProduction: number[] = [];
    const gasUsage: number[] = [];
    const labels: string[] = [];

    map.forEach((data, key) => {
      powerProduction.push(data.powerProduction);
      powerUsage.push(data.powerUsage);
      gasUsage.push(data.gasUsage);
      labels.push(MonthlyPage.months[key]);
    });

    this.labels = labels;
    this.barGasUsage = gasUsage;
    this.barChartPowerProduction = powerProduction;
    this.barChartPowerUsage = powerUsage;
  }

  private computeCards(data: EnergyUsage) {
    this.powerUsage = data.energyUsage.toFixed(2);
    this.powerProduction = data.energyProduction.toFixed(2);
    this.gasUsageMonthly = data.gasUsage?.toFixed(2);
    this.cost = this.computeCost(data).toFixed(2);
  }

  private computeCost(usage: EnergyUsage) {
    const prices = this.settings.getPrices();
    let cost = 0;

    cost += prices.powerUsage * usage.energyUsage;
    cost += prices.gas * usage.gasUsage;
    cost -= prices.powerProduction * usage.energyProduction;

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

      values.push(cost);
      labels.push(`${MonthlyPage.padNumer(x.timestamp.getDate(), 2)}-${MonthlyPage.padNumer(x.timestamp.getMonth(), 2)}`);
    });

    this.costLabels = labels;
    this.costValues = values;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static getFirstOfMonth() {
    const todayStart = new Date();

    todayStart.setHours(0,0,0, 0);
    todayStart.setDate(1);

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
  private static addMonths(date: Date, months: number) {
    const d = date.getDate();

    date.setMonth(date.getMonth() + months);

    if (date.getDate() !== d) {
      date.setDate(0);
    }
    return date;
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
