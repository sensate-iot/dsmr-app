export class Response<TValue> {
  public id: string;
  public errors: string[];
  public data: TValue;
}
