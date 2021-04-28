import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DsmrService} from '../../../services/dsmr.service';
import {Chart} from 'chart.js';
import {SettingsService} from '../../../services/settings.service';
import {EnergyDataPoint} from '../../../models/energydatapoint';
import {mergeMap} from 'rxjs/operators';

class HistoricData {
  public gasUsage: number;
  public powerProduction: number;
  public powerUsage: number;

  public constructor() {
    this.gasUsage = 0;
    this.powerProduction = 0;
    this.powerUsage = 0;
  }
}

@Component({
  selector: 'app-monthly',
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
})
export class MonthlyPage implements OnInit, AfterViewInit {
  @ViewChild('gasCanvas') gasCanvas: ElementRef;

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

  private gasChart: Chart;

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
    this.gasChart.data.datasets[0].data = this.barGasUsage;
    this.gasChart.data.labels = this.labels;
    this.gasChart.update();
  }

  private clearGraph() {
    this.costValues.length = 0;
    this.costLabels.length = 0;

    this.gasChart.data.datasets[0].data = [];
    this.gasChart.data.labels = [];
    this.gasChart.update();
  }

  private loadData() {
    return new Promise((resolve, reject) => {
      const startDate = MonthlyPage.getFirstOfMonth();
      const endDate = MonthlyPage.getEndToday();
      const device = this.dsmr.getSelectedDevice();

      this.dsmr.getPowerData(device.id, startDate, endDate, 'day')
        .pipe(mergeMap(result => {
          this.computeCards(result.data);
          this.computeCostChart(result.data);
          const firstMonthDate = MonthlyPage.addMonths(startDate, -3);

          return this.dsmr.getPowerData(device.id, firstMonthDate, endDate, 'day');
        })).subscribe(result => {
          this.computeCharts(result.data);
          this.refreshView();

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

    this.barChartPowerProduction = powerProduction;
    this.barChartPowerUsage = powerUsage;
    this.barGasUsage = gasUsage;
    this.labels = labels;
  }

  private computeCards(data: EnergyDataPoint[]) {
    let usage = 0;
    let production = 0;
    let gas = 0;

    data.forEach(dp => {
      usage += dp.energyUsage / 1000;
      production += dp.energyProduction / 1000;
      gas += dp.gasFlow;
    });

    this.powerUsage = usage.toFixed(2);
    this.powerProduction = production.toFixed(2);
    this.gasUsageMonthly = gas.toFixed(2);
    this.cost = this.computeCost(usage, production, gas).toFixed(2);
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

      values.push(cost);
      labels.push(`${MonthlyPage.padNumer(x.timestamp.getDate(), 2)}-${MonthlyPage.padNumer(x.timestamp.getMonth(), 2)}`);
    });

    this.costLabels = labels;
    this.costValues = values;
  }

  private loadGraphs() {
    this.gasChart = new Chart(this.gasCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [
          {
            yAxisID: 'gas',
            label: 'Gas Usage',
            data: this.barGasUsage,
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
