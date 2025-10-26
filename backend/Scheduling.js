import cron from 'node-cron'
import { RegisterModel } from './models/RegisterModel.js'
import tranporter from './mailer.js'
import rewards from '../frontend/src/Data/FitPointRewards.js'


const streakMail=async(name,streak,email)=>{
    await tranporter.sendMail({
        from:process.env.EMAIL,
        to:email,
        subject:'CampusFit League',
        html:`
        <h3>Hey ${name} , </h3>
        <h4>Your current streak is ${streak}</h4>
        <p>complete today tasks , and win more fitPoints and more rewards</p>
        <P>Your Friends are in the better position in the LeaderBoard... come login and complete tasks to gain Streak</p>
        `


    })
    

}

cron.schedule('0 0 * * *',async()=>{
    try{
        const yesterDay=new Date();
        yesterDay.setDate(yesterDay.getDate()-1)
        const yesterDayStr=yesterDay.toDateString()
        const users=await RegisterModel.find()
        
        for(const user of users){
            if(user.lastCompleted!==yesterDayStr){
                user.streak=0
                await user.save()
            }
        }
        await RegisterModel.updateMany({},{$set:{steps:0,pushups:0,squats:0,completedTasks:[]}})
        console.log('details reset')

    }catch(err){
        console.log(err);
    }
})



cron.schedule('0 9 * * *',async()=>{
    try{
        const users=await RegisterModel.find({streak:{$lt:1}})
        for(const user of users){

            await streakMail(user.name,user.streak,user.email)
            console.log(`email sent to ${user.name}`)

        }
        console.log('All remainders sent!')

    }catch(err){
        console.log(err)

    }


}, { timezone: "Asia/Kolkata" })

cron.schedule('*/10 * * * *',async()=>{
    try{
        const res =await RegisterModel.updateMany(
            {},
            {$pull:{rewards:{expiresAt:{$lt:new Date()}}}}
        )
        // console.log(res)
        if(res.modifiedCount>0){
            console.log(`expirred rewards removed from ${res.modifiedCount} users`)
        }else{
            console.log('no rewards are expired')
        }
       
        
    }catch(err){
        console.log(err)
    }
})
export default function startCronJobs(){
    console.log('your schedules are working');

};