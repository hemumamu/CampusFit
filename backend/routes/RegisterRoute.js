import express from 'express'
import { RegisterModel } from '../models/RegisterModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import tranporter from '../mailer.js'
import cors from 'cors'
const app = express()
app.use(express.json())
app.use(cors())

const router = express.Router()


const secretKey = process.env.SECRET_KEY;
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, department, year } = req.body
        const exist = await RegisterModel.findOne({ email })
        if (exist) {
            return res.status(400).json({ message: "email already exist" })
        }
        const hasshedPass = await bcrypt.hash(password, 10)
        const details = await new RegisterModel({
            name,
            email,
            password: hasshedPass,
            department,
            year

        })
        res.status(200).json({ message: "Registration Successfull" })
        // await tranporter.sendMail({
        //     from: process.env.EMAIL,
        //     to: email,
        //     subject: 'CampusFit',
        //     text: `Thanks for the registration Mr / Ms  ${name} ...
        //         This is the first step to start your fitness journey in a gamified way 
        //         you can win exciting Rewards by redeeming your FitPoints..    

        //     `

        // })

        await details.save()
        console.log('data stored')


    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })

    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const detail = await RegisterModel.findOne({ email })
        if (!detail) {
            console.log('email doesnt exist')
            return res.status(400).json({ message: "Email doesnt exist" })
        }
        if (!(await bcrypt.compare(password, detail.password))) {
            console.log('incorrect password')
            return res.status(400).json({ message: "incorrect password" })
        }
        const token = jwt.sign({ id: detail.id }, secretKey, { expiresIn: '10d' })




        return res.json({ token, message: "Succesfully logined" })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "server error" })
    }

})
router.get('/dashboard', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No token" });
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, secretKey);
        const user = await RegisterModel.findById(decoded.id).select("-password")
        const toadyDate = new Date().toDateString()
        const userDate = new Date(user.lastUpdated).toDateString()
        if (toadyDate !== userDate) {
            user.completedTasks = []
            user.lastUpdated = new Date()
            await user.save()
        }
        res.json({ message: "data fetch successfully", user })

    } catch (err) {
        return res.status(500).json({ message: "server error" })

    }

})
router.put('/updatepoints', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1]
        if (!token) {
            return res.status(400).json({ message: "token missing" })
        }

        const decoded = jwt.verify(token, secretKey);
        const { points, taskIndex, dailyTasks } = req.body;
        const details = await RegisterModel.findById(decoded.id)
        if (details.completedTasks.includes(taskIndex)) {
            return res.status(400).json({ message: "task already completed" })
        }
        if (dailyTasks.length === details.completedTasks.length + 1) {
            details.streak += 1;
            details.lastCompleted = new Date().toDateString ();
        }

        details.fitPoints += points
        details.completedTasks.push(taskIndex);

        await details.save()
        res.json({ message: 'success', fitPoints: details.fitPoints, completedTasks: details.completedTasks, streak: details.streak })
    } catch (err) {
        console.log(err)
    }


})

router.put('/updaterewards', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, secretKey)
        const details = await RegisterModel.findById(decoded.id);
        if (!details) {
            return res.status(400).json({ message: "User not found" })
        }
        const item = req.body
        details.rewards.push(item)
        // console.log(item)
        const remaining = details.fitPoints - item.fitPointsRequired
        details.fitPoints = remaining
        res.json({ message: "successfully updated rewards", fitPoints: remaining, rewards: details.rewards })
        await details.save()
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "server error" })
    }

})
router.put('/updatestreakrewards', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, secretKey)
        const details = await RegisterModel.findById(decoded.id);
        if (!details) {
            return res.status(400).json({ message: "User not found" })
        }
        const {item,index} = req.body
        if (!item) {
            return res.status(400).json({ message: "No reward item provided" });
        }
        // console.log(item)
        item.isclaimed = true
         if (details.claimedStreakRewards.includes(index)) {
            return res.status(400).json({ message: "You already claimed this reward!" });
        }
        details.streakRewards.push(item)
        details.claimedStreakRewards.push(index)
        // console.log(item)
        details.fitPoints += item.fitReward
        await details.save()
        console.log('successfully updated fitpoints')
        console.log(details.claimedStreakRewards)
        return res.json({ message: "successfully updated fitpoints", fitPoints: details.fitPoints ,claimedStreakRewards:details.claimedStreakRewards})

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "server error" })

    }

})


router.get('/myRewards', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, secretKey)
        const details = await RegisterModel.findById(decoded.id);
        if (!details) {
            return res.status(400).json({ message: "User not found" })
        }
        const fitRewards =await details.rewards
       
        res.json({ message: "successfully data fetched", fitRewards });
        
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "sever error" })
    }

})

router.put('/updatemyRewards', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, secretKey)

        const details = await RegisterModel.findById(decoded.id);
        const coupon = Math.random().toString(36).substring(2, 8).toUpperCase()

        const index = await req.body.index
        console.log(index)
        const reward = details.rewards[index]
        const expire = new Date(Date.now() + 24 * 60 * 60 * 1000)
        reward.coupon = coupon
        reward.isclaimed = true
        reward.expiresAt = expire
        await details.save()
        res.json({ message: 'Coupon claimed', reward })
        // await tranporter.sendMail({
        //     to:process.env.EMAIL,
        //     from:process.env.EMAIL,
        //     subject:'Coupon claimed',
        //     text:`Coupon ( ${coupon} ) claimed by ${details.name} at  ${new Date().toLocaleTimeString()} on ${new Date().toDateString()}`
        // })
        console.log(reward.coupon)

    } catch (err) {
        console.log(err)
    }

})

router.get('/leaderboard', async (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, secretKey)
    const user = await RegisterModel.findById(decoded.id)
    const todayDate = new Date().toDateString();
    const userDate = new Date(user.lastUpdated).toDateString();
    if (todayDate !== userDate) {
        await RegisterModel.updateMany(
            {},
            {
                steps: 0,
                lastUpdated: new Date()
            }
        );
        console.log("Reset all users' steps for new day");
    }

    const users = await RegisterModel.find({ department: user.department }).sort({ streak: -1 }).limit(100);
    res.json({ message: "users sent successfully", users });

})

router.get('/overallusers', async (req, res) => {
    try {
        const users = await RegisterModel.find({ streak: { $exists: true } }).sort({ streak: -1 }).select("-password")
        res.json({ message: 'users details sent', users })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'server error' })
    }


})

////////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/updateActivity", async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, secretKey)
        const user = await RegisterModel.findById(decoded.id)
        const { steps } = req.body;


        if (!user) return res.status(404).json({ msg: "User not found" });

        user.steps = steps;
        console.log('steps')


        await user.save();
        res.json({ message: "Activity updated", user });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

router.get("/getData", async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, secretKey)
        const user = await RegisterModel.findById(decoded.id)
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json({ message: "Steps fetched", steps: user.steps, pushups: user.pushups, squats: user.squats, dailyTasks: user.dailyTasks });

    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

router.put('/updatePushups', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, secretKey);
        const user = await RegisterModel.findById(decoded.id)
        if (!user) {
            return res.status(400).json({ message: "user is not found" })
        }
        const pushups = req.body.count
        user.pushups += pushups;
        await user.save()
        res.json({ message: "Pushups updated successfully" });
        console.log('pushups saved')

    } catch (err) {
        console.log(err)
    }
})

router.put('/updatesquats', async (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader.split(' ')[1]
    const decoded = await jwt.verify(token, secretKey)
    const user = await RegisterModel.findById(decoded.id)
    if (!user) {
        return res.status(400).json({ message: 'user is not found' })
    }
    const squats = req.body.count
    user.squats += squats
    await user.save()
    res.json({ message: 'squats updated successfully' })
})

export default router;


