console.time('cold-start')

const express = require('express')
const router = express.Router()

const app = express()

app.use(express.json())

router.post('/hello', (req, res) => {
  res.json(req.body)
})

app.use(router)

app.listen(process.env.PORT, () => {
  console.timeEnd('cold-start')
  console.info(`Express listening on port ${process.env.PORT}`)
})
