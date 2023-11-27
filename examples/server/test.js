console.log('test')
process.on('SIGINT', () => {
  console.log(1111)
})

process.on('beforeExit', () => {
  console.log(22)
})

process.on('exit', () => {
  console.log(22)
})
const express = require('express')

const app = express()

app.listen(3046)
