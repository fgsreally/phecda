export class HttpException extends Error {
  error = true
  constructor(message: string, public status: number, public description = 'http exception') {
    super(message)
  }

  get data() {
    return { message: this.message, description: this.description }
  }
}
