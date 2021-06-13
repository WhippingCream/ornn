export class OrnnError extends Error {
  constructor(prefix: string, code: string, message: string) {
    super(message);
    this.code = `${prefix}/${code}`;
  }

  code: string;
}
