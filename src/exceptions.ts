class Exception extends Error {
  public status: number;

  public message: string;

  constructor(status: number, message: object) {
    super(JSON.stringify(message));
    this.status = status;
    this.message = JSON.stringify(message);
  }
}

export default Exception;
