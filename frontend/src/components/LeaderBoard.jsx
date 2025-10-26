import React from 'react'
import './LeaderBoard.css'
import axios from 'axios'
import { useState, useEffect } from 'react'

const LeaderBoard = ({ user, setUser }) => {
    const API = import.meta.env.VITE_API
    const [leaderboardusers, setLeaderboardusers] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token')
            const res = await axios.get(`${API}/student/leaderboard`, { headers: { Authorization: `Bearer ${token}` } })
            setLeaderboardusers(res.data.users)
        }
        fetchData()

    }, [user.fitPoints])

    return (

        //         <div>
        //         <br /><br />
        //         <h1 style={{textAlign:'center'}}>{user.department} Department LeaderBoard</h1>
        //         <br /><br />
        //         {
        //             leaderboardusers.map((data,index)=>(
        //                 <div className='main' key={index}>
        //                     <h2>{index+1}</h2>
        //                     <div className='leaderboardCard'>
        //                         <div style={{fontSize:'25px',color:'white'}}>{data.name}</div>
        //                         <div>FitPoints : {data.fitPoints}</div>
        //                         <h5 style={{color:'white'}}>Streaks : {data.streak} </h5>
        //                         <h5 style={{color:'white'}}>Steps : {data.steps} </h5>
        //                     </div>


        //                   
        //                 </div>


        //             ))
        //         }
        //         
        //       
        //     </div>
        <div className="leaderboard-flex-container">
            <div className="leaderboard-title">{user.department} Department LeaderBoard</div>
            <div className="leaderboard-rows">
                <div className="leaderboard-row header">
                    <div className="rank-badge">#</div>
                    <div className="lb-name">Name</div>
                    <div className="lb-year">Year</div>
                    <div className="lb-fitpoints">FitPoints</div>
                    <div className="lb-streak">Streaks</div>
                    <div className="lb-steps">Steps</div>
                </div>
                {leaderboardusers.map((data, idx) => (
                    <div
                        key={idx}
                        className={`leaderboard-row rank-${idx + 1} ${user.name === data.name ? "lb-me" : ""}`}
                    >
                        <div className="rank-badge">{idx + 1}</div>
                        <div className="lb-name">{data.name}</div>
                        <div className="lb-year">{data.year}</div>
                        <div className="lb-fitpoints">{data.fitPoints}</div>
                        <div className="lb-streak">{data.streak}</div>
                        <div className="lb-steps">{data.steps}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LeaderBoard
