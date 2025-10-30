import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import mongoose from 'mongoose'
import RegisterRoute from './routes/RegisterRoute.js'
import cors from 'cors'
import startCronJobs from './Scheduling.js'
import tranporter from './mailer.js'


const app = express()
app.use(express.json())
app.use(cors())
// console.log(process.env.MONGO_URL)

const PORT = process.env.PORT || 4000;
const conn =await mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('database connected successfully')
    }).catch((err) => {
        console.log(err)
    })

app.use('/student',RegisterRoute)


app.get('/', (req, res) => {
    res.send('this is get request')
    console.log('this is get')
})

startCronJobs()

app.listen(PORT, () => {
    console.log('server is running')
})