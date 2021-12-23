import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {MeterReading} from '../models/meterreading';
import {Response} from '../models/response';
import {EnergyDataPoint} from '../models/energydatapoint';
import {Device} from '../models/device';
import {AuthenticationService} from './authentication.service';
import {GroupedPowerData} from '../models/groupedpowerdata';
import {EnergyUsage} from '../models/energyusage';
import { HourlyPowerAverage } from 'app/models/HourlyPowerAverage';

@Injectable({
  providedIn: 'root'
})
export class DsmrService {
  public constructor(private http: HttpClient,
                     private readonly auth: AuthenticationService) { }

  public getPowerData(id: number, start: Date, end: Date, granularity: string) {
    const startDate = start.toISOString();
    const endDate = end.toISOString();
    const url = `${environment.dsmrApiHost}/aggregates/power/${id}?granularity=${granularity}&start=${startDate}&end=${endDate}`;

    return this.http.get<Response<EnergyDataPoint[]>>(url);
  }

  public getAverageEnergyData(id: number, start: Date, end: Date) {
    const url = `${environment.dsmrApiHost}/aggregates/energy/${id}/average?start=${start.toISOString()}&end=${end.toISOString()}`;
    return this.http.get<Response<HourlyPowerAverage[]>>(url);
  }

  public getLatestData(id: number) {
    const url = `${environment.dsmrApiHost}/aggregates/latest/${id}`;
    return this.http.get<Response<MeterReading>>(url);
  }

  public getGroupedPowerData(id: number) {
    const url = `${environment.dsmrApiHost}/aggregates/power/${id}/hour`;
    return this.http.get<Response<GroupedPowerData[]>>(url);
  }

  public getGroupedPowerDataBetween(id: number, start: Date, end: Date) {
    const startDate = start.toISOString();
    const endDate = end.toISOString();
    const url = `${environment.dsmrApiHost}/aggregates/power/${id}/hour?start=${startDate}&end=${endDate}`;
    return this.http.get<Response<GroupedPowerData[]>>(url);
  }

  public getEnergyUsage(id: number, start: Date, end: Date) {
    const startDate = start.toISOString();
    const endDate = end.toISOString();
    const url = `${environment.dsmrApiHost}/aggregates/energy/${id}?start=${startDate}&end=${endDate}`;
    return this.http.get<Response<EnergyUsage>>(url);
  }

  public getSelectedDevice() {
    const selected = DsmrService.getSelectedDeviceFromStorage();

    if(selected == null) {
      return this.getDefaultDevice();
    }

    return selected;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static getSelectedDeviceFromStorage(): Device {
    const data = localStorage.getItem('selectedDevice');

    if(data == null) {
      return null;
    }

    return JSON.parse(data);
  }

  private getDefaultDevice(): Device {
    const user = this.auth.getCurrentUser();

    if(user.devices.length === 0) {
      return null;
    }

    return user.devices[0];
  }
}
