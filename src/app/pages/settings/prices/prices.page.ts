import { Component, OnInit } from '@angular/core';
import {SettingsService} from '../../../services/settings.service';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.page.html',
  styleUrls: ['./prices.page.scss'],
})
export class PricesPage implements OnInit {
  public eUsagePrice: number;
  public eProductionPrice: number;
  public gasUsagePrice: number;

  public constructor(private readonly settings: SettingsService) { }

  public ngOnInit() {
    const prices = this.settings.getPrices();

    this.gasUsagePrice = prices.gas;
    this.eProductionPrice = prices.powerProduction;
    this.eUsagePrice = prices.powerUsage;
  }

  public onUpdate(value: string, update: number) {
    const prices = this.settings.getPrices();

    prices[value] = update;
    this.settings.setPrices(prices);
  }
}
