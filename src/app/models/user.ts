import {Device} from './device';

export class User {
  public id: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public timestamp: Date;
  public devices: Device[];
}
