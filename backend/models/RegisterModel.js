import mongoose from "mongoose";
const RegisterSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
    year:{
        type:Number,
        

    },
    fitPoints: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    completedTasks: {
        type: [Number],
        default: []
    },
    lastCompleted:{
        type:String,
        default:null
    }
    ,
    lastUpdated: {
        type: Date,
        default: new Date()
    },
    rewards: [
        {
            name: String,
            description: String,
            fitPointsRequired: Number,
            type:{
                type:String
            },
            coupon:{
                type:String,
                default:""
            },
            isclaimed:{
                type:Boolean,
                default:false
            },expiresAt:{
                type:Date,
                default:new Date()
                
                
            }
        }
    ],
    streakRewards: [
        {
            rewardName: String,
            description: String,
            streakDays: Number,
            type:{
                type:String
            },
            isclaimed:{
                type:Boolean,
                default:false
            }
        }
    ],
    claimedStreakRewards:{
        type:[Number],
        default:[]
    },
    department: {
        type: String,
        required: true
    },
    pushups:{
        type:Number,
        default:0

    },
    squats:{
        type:Number,
        default:0

    },
    steps: {
        type: Number,
        default: 0
    },
    






})
export const RegisterModel = mongoose.model('RegisterModel', RegisterSchema)