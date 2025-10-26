import React from 'react'
import './Rewards.css'
import rewards from '../Data/FitPointRewards'
import streakRewards from '../Data/StreakRewards'
import { useState, useEffect } from 'react'
import axios from 'axios'

const Rewards = ({ user, setUser }) => {
    const API=import.meta.env.API

    const [activeReward, setActiveReward] = useState("fitpointsReward")
    const [claimedStreakRewards, setClaimedStreakRewards] = useState([])
    useEffect(() => {
        if (user && user.claimedStreakRewards) {
            setClaimedStreakRewards(user.claimedStreakRewards);
        }
    }, [user]);
    const handleClick = async (item) => {
        if (item.fitPointsRequired <= user.fitPoints) {
            const token = localStorage.getItem('token')
            const res = await axios.put(`${API}/student/updaterewards`,
                item,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            console.log(res.data.message)

            setUser({ ...user, fitPoints: res.data.fitPoints })


            alert('you claimed a reward')
        }
        else {
            alert('you have insufficient fitPoints')
        }
    }
    const handleClick2 = async (item, index) => {
        if (item.streakDays <= user.streak) {
            const token = localStorage.getItem('token')
            const res = await axios.put(`${API}/student/updatestreakrewards`,
                { item, index },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            console.log(res.data.message)

            setUser({ ...user, fitPoints: res.data.fitPoints, claimedStreakRewards: res.data.claimedStreakRewards })
            // setClaimedStreakRewards(prev => [...prev, index]);
            setClaimedStreakRewards(res.data.claimedStreakRewards);


            alert('you claimed a reward')
        }
        else {
            alert('you have insufficient streaks')
        }
    }
    return (
        <>
            <div className='info'>
                <div className='div1'>
                    {/* <h1 >Reward Section</h1> */}
                </div>
                <div className='div2'>
                    <div style={{ color: 'white' }}><h3>FitPoints : {user.fitPoints}</h3></div>
                    <div style={{ color: 'white' }}><h3>Streak : {user.streak}</h3></div>
                </div>

            </div>
            <div className='div1'>
                <h1 >Reward Section</h1>                
            </div>
            <div className="rewardToggleContainer">
                <button
                    onClick={() => setActiveReward('fitpointsReward')}
                    className={activeReward === 'fitpointsReward' ? 'active' : ''}
                >
                    FitPoints Rewards
                </button>

                <button
                    onClick={() => setActiveReward('streakReward')}
                    className={activeReward === 'streakReward' ? 'active' : ''}
                >
                    Streak Rewards
                </button>
            </div>

            {
                activeReward === 'fitpointsReward' ? (
                    <div className="rewardsContainer">

                        {rewards.map((item, index) => (
                            <div className="rewardCard" key={index}>
                                {/* <img src={`/images/${item.image}`} alt={item.name} className="rewardImg" /> */}
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>

                                <span className="points">{item.fitPointsRequired} FitPoints </span>
                                <br />
                                <button onClick={() => { handleClick(item) }} className='rewardBut'>Claim</button>
                            </div>
                        ))}
                    </div>

                ) : activeReward === 'streakReward' ? (
                    <div className="rewardsContainer">

                        {streakRewards.map((item, index) => (
                            <div className="rewardCard" key={index}>
                                {/* <img src={`/images/${item.image}`} alt={item.name} className="rewardImg" /> */}
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>

                                <span className="points">{item.fitReward} FitPoints </span>
                                <br />
                                <button onClick={() => { handleClick2(item, index) }} className='rewardBut' disabled={claimedStreakRewards.includes(index)}>{claimedStreakRewards.includes(index) ? 'Claimed' : 'claim'}</button>
                            </div>
                        ))}
                    </div>
                ) : <>Loading...</>

            }


        </>
    )
}

export default Rewards
