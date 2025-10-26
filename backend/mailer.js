
import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'


const tranporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.GMAIL_SERVICE,
        pass:process.env.GMAIL_PASS
    }
})
export default tranporter