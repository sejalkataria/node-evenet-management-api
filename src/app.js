const express = require('express')
require('./db/mongoose')
const userRouter = require('./routes/user')
const eventRouter = require('./routes/event')

const app = express()
app.use(express.json())
app.use(userRouter)
app.use(eventRouter)

module.exports = app