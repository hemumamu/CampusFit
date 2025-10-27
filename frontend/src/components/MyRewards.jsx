import React from 'react'
import './MyRewards.css'
import { useState, useEffect } from 'react'
import axios from 'axios'

const MyRewards = ({ user, setUser }) => {
    const API = import.meta.env.VITE_API
    const [myRewards, setMyRewards] = useState([])
    const token = localStorage.getItem('token')

    useEffect(() => {
        const dataFetch = async () => {
            try {
                const res = await axios.get(`${API}/student/myRewards`,
                    { headers: { Authorization: `Bearer ${token}` } })
                setMyRewards(res.data.fitRewards)
            } catch (err) {
                console.error('Error fetching rewards:', err)
            }
        }
        dataFetch()
    }, [token])

    const handleReward = async (index) => {
        try {
            const res = await axios.put(
                `${API}/student/updatemyRewards`, 
                { index }, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const updatedrewards = [...myRewards]
            updatedrewards[index] = res.data.reward
            setMyRewards(updatedrewards)
        } catch (err) {
            console.error('Error claiming reward:', err)
        }
    }

    return (
        <div className='myRewardsContainer'>
            <div className='myRewardsHeader'>
                <h1>Your Rewards & Coupons</h1>
            </div>

            {myRewards.length === 0 ? (
                <div className='noRewards'>
                    <p>You have no rewards yet...</p>
                    <p className='subtext'>Complete tasks and earn FitPoints to unlock rewards!</p>
                </div>
            ) : (
                <div className='yourReward'>
                    {myRewards.map((data, index) => (
                        <div className='reward' key={index}>
                            <h3>{data.name}</h3>
                            <p className='description'>{data.description}</p>
                            {data.isclaimed ? (
                                <div className='couponBox'>
                                    <p className='couponText'>{data.coupon}</p>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleReward(index)} 
                                    className='rewardBut'
                                >
                                    Claim Coupon
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className='rewardNote'>
                <h4>Note: Coupons expire within 24 hours after claiming</h4>
            </div>
        </div>
    )
}

export default MyRewards
