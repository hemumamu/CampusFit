import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import './OverallLeaderboard.css'

const OverallLeaderboard = ({ user }) => {
  const API = import.meta.env.VITE_API
  const [overallUsers, setOverallUsers] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API}/student/overallusers`, { headers: { Authorization: `Bearer ${token}` } })
        setOverallUsers(res.data.users)
        console.log(res.data.message)
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()

  }, [user.fitPoints])
  return (
    <div className="leaderboard-flex-container">
      <div className="leaderboard-title">CampusFit Overall Leaderboard</div>
      <div className="leaderboard-rows">
        <div className="leaderboard-row header">
          <div className="rank-badge">#</div>
          <div className="lb-name">Name</div>
          <div className="lb-year">Year</div>
          <div className="lb-fitpoints">FitPoints</div>
          <div className="lb-streak">Streaks</div>
          <div className="lb-steps">Steps</div>
          <div className="lb-dept">Department</div>
        </div>
        {overallUsers.map((data, idx) => (
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
            <div className="lb-dept">{data.department}</div>
          </div>
        ))}
      </div>
    </div>


  )
}

export default OverallLeaderboard
