import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Response} from "../models/response";
import {EnergyDataPoint} from "../models/energydatapoint";
import {EnvironmentDataPoint} from "../models/environmentdatapoint";

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  public constructor(private readonly http: HttpClient) { }

  public getEnvironmentData(id: number, start: Date, end: Date, granularity: string) {
    const startDate = start.toISOString();
    const endDate = end.toISOString();
    const url = `${environment.dsmrApiHost}/aggregates/environment/${id}?granularity=${granularity}&start=${startDate}&end=${endDate}`;

    return this.http.get<Response<EnvironmentDataPoint[]>>(url);
  }
}
