export class HttpException extends Error {
  constructor(public message: string, public status: number, public description = 'http exception') {
    super(message)
  }

  get data() {
    return { message: this.message, description: this.description, status: this.status, error: true }
  }
}
