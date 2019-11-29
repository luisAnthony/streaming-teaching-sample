export class ID_USER {
  constructor(
    public id: string,
    public displayname: string,
    public email?: string,
    public ip?: string,
    public lat?: number,
    public lng?: number
  ) { }
}