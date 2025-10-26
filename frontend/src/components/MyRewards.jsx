import React from 'react'
import './MyRewards.css'
import { useState, useEffect } from 'react'
import axios from 'axios'

const MyRewards = ({ user, setUser }) => {
    const [myRewards, setMyRewards] = useState([])
    const token = localStorage.getItem('token')
    useEffect(() => {
        const dataFetch = async () => {
            const res = await axios.get('http://localhost:3000/student/myRewards',
                { headers: { Authorization: `Bearer ${token}` } })
            // console.log(res.data.message);
            // console.log(res.data.fitRewards)
            setMyRewards(res.data.fitRewards)
        }
        dataFetch()


    }, [])
    const handleReward = async (index) => {
        try {
            const res = await axios.put('http://localhost:3000/student/updatemyRewards', { index }, { headers: { Authorization: `Bearer ${token}` } })
            const updatedrewards = [...myRewards]
            updatedrewards[index] = res.data.reward
            setMyRewards(updatedrewards)

            // alert(res.data.message)
        } catch (err) {
            console.log(err)
        }
    }


    return (
        <div>
                <div className='myRewards'>
                    <h1 style={{ textAlign: 'center' }}>Your Rewards</h1>
                </div>
            <div>
                

                {
                    (myRewards.length === 0) ?
                        <>
                            <p style={{ color: 'white' }}>You Have no Rewards...</p>
                        </> : <>
                            <div className='yourReward'>
                                {
                                    myRewards.map((data, index) => (
                                        <div className='reward' key={index}>
                                            <div>
                                                <h3>{data.name}</h3>
                                                <h5>{data.description}</h5>
                                                {
                                                    data.isclaimed ? (<p >{data.coupon}</p>) : (<button onClick={() => { handleReward(index) }} className='rewardBut'>Coupon</button>)
                                                }
                                            </div>


                                        </div>
                                    ))
                                }

                            </div>
                        </>
                }

                <div className='myReward'>
                    <h4 style={{ textAlign: 'center',color:'#37db5e' }}>Note : If you claim the coupon it will expires within one day...</h4>
                </div>

            </div>

        </div>
    )
}

export default MyRewards
