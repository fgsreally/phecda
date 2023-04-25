export class HttpException extends Error {
  constructor(public message: string, public status: number, public description = 'Http exception') {
    super(message)
  }

  get data() {
    return { message: this.message, description: this.description, status: this.status, error: true }
  }
}

// export class BaseException extends Error {
//   constructor(public message: string, public description = 'Base exception') {
//     super(message)
//   }

//   get data() {
//     return { message: this.message, description: this.description, status: this.status, error: true }
//   }
// }
