export class OrnnError extends Error {
  constructor(status: number, prefix: string, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = `${prefix}/${code}`;
  }

  code: string;
  status: number;
}
