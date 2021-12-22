import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DsmrService} from '../../services/dsmr.service';
import {SettingsService} from '../../services/settings.service';
import {mergeMap} from 'rxjs/operators';
import {EnergyDataPoint} from '../../models/energydatapoint';
import {HistoricData} from '../../models/historicdata';
import {GroupedPowerData} from '../../models/groupedpowerdata';
import {EnergyUsage} from '../../models/energyusage';
import {Device} from '../../models/device';
import {Response} from '../../models/response';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit, AfterViewInit {
  public gasUsageMonthly: string;
  public cost: string;
  public powerUsage: string;
  public netEnergyUsage: string;
  public powerProduction: string;
  public costLabels: string[];
  public costValues: number[];
  public barChartPowerUsage: number[];
  public barChartPowerProduction: number[];
  public barGasUsage: number[];
  public labels: string[];
  public selectedMonth: number;

  public groupedEnergyUsage: number[];
  public groupedEnergyProduction: number[];
  public groupedLabels: string[];

  public device: Device;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public fullMonths = ['January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static months = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
    'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

  public constructor(private readonly dsmr: DsmrService,
                     private readonly settings: SettingsService) {
    this.barGasUsage = [];
    this.labels = [];
    this.barChartPowerProduction = [];
    this.barChartPowerUsage = [];
    this.costLabels = [];
    this.costValues = [];
    this.groupedEnergyProduction = [];
    this.groupedEnergyUsage = [];
    this.groupedLabels = [];
  }

  public ngOnInit() {
    const now = new Date();
    this.device = this.dsmr.getSelectedDevice();
    this.selectedMonth = now.getMonth() - 1;
  }

  public ngAfterViewInit(): void {
    this.loadData().then();
  }

  public refresh(event: any): void {
    this.internalRefresh().then(() => {
      event.target.complete();
    });
  }

  public async onValueChanged(event: any) {
    this.selectedMonth = event.detail.value;
    await this.internalRefresh();
  }

  private internalRefresh() {
    this.clearGraph();
    return this.loadData();
  }

  private clearGraph() {
    this.costValues.length = 0;
    this.costLabels.length = 0;

    this.labels = [];
    this.barGasUsage = [];
    this.groupedEnergyProduction = [];
    this.groupedEnergyUsage = [];
    this.groupedLabels = [];
  }

  private loadData() {
    return new Promise<void>((resolve, reject) => {
      const startDate = this.getFirstOfMonth();
      const endDate = this.getEndOfMonth();
      const device = this.dsmr.getSelectedDevice();

      this.dsmr.getPowerData(device.id, startDate, endDate, 'day').pipe(mergeMap((result: Response<EnergyDataPoint[]>) => {
        this.computeCostChart(result.data);
        return this.dsmr.getEnergyUsage(device.id, startDate, endDate);
      }), mergeMap((result: Response<EnergyUsage>) => {
        this.computeCards(result.data);
        return this.dsmr.getGroupedPowerDataBetween(device.id, startDate, endDate);
      }), mergeMap((result: Response<GroupedPowerData[]>) => {
        this.computeGroupedChart(result.data);

        const firstMonthDate = ReportsPage.addMonths(startDate, -3);
        return this.dsmr.getPowerData(device.id, firstMonthDate, endDate, 'day');
      })).subscribe((result: Response<EnergyDataPoint[]>) => {
        this.computeOverviewCharts(result.data);

        resolve();
      }, _ => {
        reject();
      });
    });
  }

  private computeOverviewCharts(data: EnergyDataPoint[]) {
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
      labels.push(ReportsPage.months[key]);
    });

    if(this.device.hasSolarCells) {
      this.barChartPowerProduction = powerProduction;
    }

    this.barChartPowerUsage = powerUsage;
    this.barGasUsage = gasUsage;
    this.labels = labels;
  }

  private computeCards(data: EnergyUsage) {
    if(data == null) {
      this.setNullCards();
      return;
    }

    const usage = data.energyUsage - data.energyProduction;
    this.netEnergyUsage = usage.toFixed(2);
    this.powerUsage = data.energyUsage.toFixed(2);
    this.powerProduction = data.energyProduction.toFixed(2);
    this.gasUsageMonthly = data.gasUsage?.toFixed(2);
    this.cost = this.computeCost(data).toFixed(2);
  }

  private setNullCards() {
    this.netEnergyUsage = '0';
    this.powerUsage = '0';
    this.powerProduction = '0';
    this.gasUsageMonthly = '0';
    this.cost = '0';
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
      labels.push(`${ReportsPage.padNumer(x.timestamp.getDate(), 2)}-${ReportsPage.padNumer(x.timestamp.getMonth() + 1, 2)}`);
    });

    this.costLabels = labels;
    this.costValues = values;
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

      const hour = ReportsPage.padNumer(x.hour, 2);
      labels.push(`${hour}:00`);
    });

    this.groupedLabels = labels;

    if(this.device.hasSolarCells) {
      this.groupedEnergyProduction = production;
    }

    this.groupedEnergyUsage = usage;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private getFirstOfMonth() {
    const todayStart = new Date();

    todayStart.setHours(0,0,0, 0);
    todayStart.setDate(1);
    todayStart.setMonth(this.selectedMonth);

    return todayStart;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private getEndOfMonth() {
    const today = new Date();
    const end = new Date(today.getFullYear(), this.selectedMonth + 1, 0);

    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
    end.setMilliseconds(999);

    return end;
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
