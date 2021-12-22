import { Injectable } from '@angular/core';
import { EnergyUsage } from 'app/models/energyusage';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class CostCalculatorService {
  public constructor(private readonly settings: SettingsService) { }

  public computeCostForEnergyUsage(usage: EnergyUsage) {
    const prices = this.settings.getPrices();
    let cost = 0;

    cost += prices.powerUsage * usage.energyUsage;
    cost += prices.gas * usage.gasUsage;
    cost -= prices.powerProduction * usage.energyProduction;

    return cost;
  }
}
