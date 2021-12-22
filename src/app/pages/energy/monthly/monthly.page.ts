import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DsmrService} from '../../../services/dsmr.service';
import {SettingsService} from '../../../services/settings.service';
import {EnergyDataPoint} from '../../../models/energydatapoint';
import {mergeMap} from 'rxjs/operators';
import {HistoricData} from '../../../models/historicdata';
import {EnergyUsage} from '../../../models/energyusage';
import {Device} from '../../../models/device';
import {Response} from '../../../models/response';
import { CostCalculatorService } from 'app/services/cost-calculator.service';

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
  public netEnergyUsage: string;
  public energyUsagePerDay: string;
  public averageCostPerDay: string;
  public costLabels: string[];
  public costValues: number[];
  public barChartPowerUsage: number[];
  public barChartPowerProduction: number[];
  public barGasUsage: number[];
  public labels: string[];
  public device: Device;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static months = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
    'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

  public constructor(private readonly dsmr: DsmrService,
                     private readonly costCalculator: CostCalculatorService,
                     private readonly settings: SettingsService) {
    this.barGasUsage = [];
    this.labels = [];
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.costLabels = [];
    this.costValues = [];
  }

  public ngOnInit() {
    this.device = this.dsmr.getSelectedDevice();
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
    return new Promise<void>((resolve, reject) => {
      const startDate = MonthlyPage.getFirstOfMonth();
      const endDate = MonthlyPage.getEndToday();
      const device = this.dsmr.getSelectedDevice();

      this.dsmr.getPowerData(device.id, startDate, endDate, 'day')
        .pipe(mergeMap((result: Response<EnergyDataPoint[]>) => {
          this.computeCostChart(result.data);
          return this.dsmr.getEnergyUsage(device.id, startDate, endDate);
        }),mergeMap((result: Response<EnergyUsage>) => {
          this.computeCards(result.data);
          const firstMonthDate = MonthlyPage.addMonths(startDate, -3);

          return this.dsmr.getPowerData(device.id, firstMonthDate, endDate, 'day');
        })).subscribe((result: Response<EnergyDataPoint[]>) => {
          this.computeCharts(result.data);
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

    if(this.device.hasSolarCells) {
      this.barChartPowerProduction = powerProduction;
    }

    this.barChartPowerUsage = powerUsage;
  }

  private computeCards(data: EnergyUsage) {
    const netUsage = data.energyUsage - data.energyProduction;
    const today = new Date();

    this.netEnergyUsage = netUsage.toFixed(2);
    this.powerUsage = data.energyUsage.toFixed(2);
    this.powerProduction = data.energyProduction.toFixed(2);
    this.gasUsageMonthly = data.gasUsage?.toFixed(2);
    this.cost = this.costCalculator.computeCostForEnergyUsage(data).toFixed(2);
    this.energyUsagePerDay = (netUsage / today.getDate()).toFixed(2);
  }

  private computeCostChart(data: EnergyDataPoint[]) {
    const prices = this.settings.getPrices();
    const labels: string[] = [];
    const values: number[] = [];
    let average = 0;

    data.forEach(x => {
      let cost = x.energyUsage / 1000 * prices.powerUsage;
      cost -= x.energyProduction / 1000 * prices.powerProduction;
      cost += x.gasFlow * prices.gas;

      average += cost;
      values.push(cost);
      labels.push(`${MonthlyPage.padNumer(x.timestamp.getDate(), 2)}-${MonthlyPage.padNumer(x.timestamp.getMonth(), 2)}`);
    });

    average /= data.length;
    this.averageCostPerDay = average.toFixed(2);
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
