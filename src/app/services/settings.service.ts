import { Injectable } from '@angular/core';
import {PriceInfo, Settings} from '../models/settings';
import set = Reflect.set;

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public constructor() { }

  public getPrices() {
    const settings = this.getSettings();

    if(settings?.prices == null) {
      const prices = new PriceInfo();

      prices.powerUsage = 0.22758;
      prices.powerProduction = 0.07;
      prices.gas = 0.779;

      return prices;
    }

    return settings.prices;
  }

  public setPrices(prices: PriceInfo) {
    let settings = this.getSettings();

    if(settings == null) {
      settings = new Settings();
    }

    settings.prices = prices;
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  private getSettings(): Settings {
    const json = localStorage.getItem('settings');

    if(json == null) {
      return null;
    }

    return JSON.parse(json);
  }
}
