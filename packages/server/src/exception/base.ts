export class HttpException extends Error {
  constructor(public message: string, public status: number, public description = 'Http exception') {
    super(message)
  }

  get data() {
    return { message: this.message, description: this.description, status: this.status, error: true }
  }
}



export class RpcException extends Error {
  constructor(public message: string, public description = 'Rpc exception') {
    super(message)
  }

  get data() {
    return { message: this.message, description: this.description, error: true }
  }
}
