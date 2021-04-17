import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {MeterReading} from '../models/meterreading';
import {Response} from '../models/response';
import {EnergyDataPoint} from '../models/energydatapoint';

@Injectable({
  providedIn: 'root'
})
export class DsmrService {
  public constructor(private http: HttpClient) { }

  public getPowerData(id: number, start: Date, end: Date, granularity: string) {
    const startDate = start.toISOString();
    const endDate = end.toISOString();
    const url = `${environment.dsmrApiHost}/aggregates/power/${id}?granularity=${granularity}&start=${startDate}&end=${endDate}`;

    return this.http.get<Response<EnergyDataPoint[]>>(url);
  }

  public getLatestData(id: number) {
    const url = `${environment.dsmrApiHost}/aggregates/latest/${id}`;
    return this.http.get<Response<MeterReading>>(url);
  }
}
