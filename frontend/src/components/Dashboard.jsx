import React from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { useState } from 'react'
import './Dashboard.css'
import { useNavigate } from 'react-router-dom'
import dailyTasks from '../Data/DailyTasks.js'
import Tasks from './Tasks.jsx'
import Rewards from './Rewards.jsx'
import MyRewards from './MyRewards.jsx'
import LeaderBoard from './LeaderBoard.jsx'
import GoogleFitConnect from './GoogleFitConnect.jsx'
import OverallLeaderboard from './OverallLeaderboard.jsx'

const Dashboard = () => {
    const API = import.meta.env.VITE_API
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [active, setActive] = useState('dashboard');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    navigate('/signin');
                    return;
                }

                const res = await axios.get(`${API}/student/dashboard`,
                    { headers: { Authorization: `Bearer ${token}` } })
                console.log(res.data.message)
                setUser(res.data.user)
            } catch (error) {
                console.error('Dashboard fetch error:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/signin');
                }
            }
        }
        fetchData();
    }, [navigate])

    const handleClick = () => {
        localStorage.removeItem('token')

        alert('Logging out successfully')
        navigate('/')
    }



    const getStepsDisplay = (steps) => {
        if (steps >= 10000) return { color: '#4CAF50', emoji: '🔥' }; // Green for goal achieved
        if (steps >= 5000) return { color: '#FF9800', emoji: '⚡' };  // Orange for halfway
        return { color: '#2196F3', emoji: '👟' }; // Blue for getting started
    }

    return (
        <div >
            <nav className='dashNav'>

                <div className='nav1'>
                    <h2>CampusFit</h2>
                </div>

                <div className='nav2'>
                    <div >
                        <h3 onClick={() => { setActive('dashboard') }}
                            style={{ cursor: 'pointer', color: active === 'dashboard' ? '#37db5e' : 'inherit' }}>
                            DashBoard
                        </h3>
                    </div>
                    <div >
                        <h3 onClick={() => { setActive('tasks') }}
                            style={{ cursor: 'pointer', color: active === 'tasks' ? '#37db5e' : 'inherit' }}>
                            Tasks
                        </h3>
                    </div>
                    <div >
                        <h3 onClick={() => { setActive('rewards') }}
                            style={{ cursor: 'pointer', color: active === 'rewards' ? '#37db5e' : 'inherit' }}>
                            Rewards
                        </h3>
                    </div>
                    <div >
                        <h3 onClick={() => { setActive('myrewards') }}
                            style={{ cursor: 'pointer', color: active === 'myrewards' ? '#37db5e' : 'inherit' }}>
                            Coupons
                        </h3>
                    </div>
                    <select
                        style={{
                            background: "rgb(86, 87, 87)",
                            color: "#fff",
                            padding: "6px 5px",
                            borderRadius: "7px",
                            marginRight: "1px",
                            cursor: "pointer"
                        }}
                        value={active.startsWith('leaderboard') ? active : ""}
                        onChange={e => setActive(e.target.value)}
                    >
                        <option value="" disabled>Leaderboard</option>
                        <option value="leaderboard"
                            style={{ color: active === 'leaderboard' ? '#37db5e' : '', cursor: 'pointer' }}>
                            Department LeaderBoard
                        </option>
                        <option value="overallleaderboard"
                            style={{ color: active === 'overallleaderboard' ? '#37db5e' : '', cursor: 'pointer' }}>
                            Overall LeaderBoard
                        </option>
                    </select>

                    <button type="submit" onClick={handleClick}>Logout</button>
                </div>
            </nav>

            {user ? (
                <>
                    {active === 'dashboard' &&
                        <div className='detailsDiv'>
                            <div className='dd1'>
                                <div className='name'>
                                    <h2 style={{ color: '#37db5e' }}>Hello, {user.name}!</h2>
                                    <h3>Welcome to Campus Fit</h3>
                                    <p><strong>Department:</strong> {user.department}</p>
                                    <div className='googleconnect'>
                                        <GoogleFitConnect user={user} setUser={setUser} />
                                    </div>
                                </div>

                            </div>

                            <div className='dd2'>
                                <div className="fitpoints">
                                    <h2>FitPoints: {user.fitPoints}</h2>
                                    {user.steps > 0 && (
                                        <div style={{
                                            color: getStepsDisplay(user.steps).color,
                                            fontSize: '1.1em',
                                            marginTop: '10px'
                                        }}>

                                        </div>
                                    )}
                                </div>
                                <div className='fitpoints'>
                                    <h2>🔥 Streaks: {user.streak}</h2>

                                </div>
                                <div className='fitpoints'>
                                    <h2>Pushups: {user.pushups}</h2>

                                </div>
                                <div className='fitpoints'>
                                    <h2>Squats: {user.squats}</h2>

                                </div>

                            </div>




                            {/* <div className='dd1'>
                                <div className='name'>
                                    <h2 style={{ color: '#37db5e' }}>Hello, {user.name}!</h2>
                                    <h3>Welcome to Campus Fit</h3>
                                    <p><strong>Department:</strong> {user.department}</p>
                                </div>
                                <div className="fitpoints">
                                    <h2>FitPoints: {user.fitPoints}</h2>
                                    {user.steps > 0 && (
                                        <div style={{
                                            color: getStepsDisplay(user.steps).color,
                                            fontSize: '1.1em',
                                            marginTop: '10px'
                                        }}>

                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='dd2'>
                                <div className='name'>
                                    <GoogleFitConnect user={user} setUser={setUser} />
                                </div>
                                <div className='fitpoints'>
                                    <h2>🔥 Streaks: {user.streak}</h2>

                                </div>
                            </div>
                            <div className='dd2'>
                                <div className='name'>

                                </div>
                                <div className='fitpoints'>
                                    <h2>Pushups: {user.pushups}</h2>

                                </div>
                            </div>
                            <div className='dd2'>
                                <div className='name'>

                                </div>
                                <div className='fitpoints'>
                                    <h2>Squats: {user.squats}</h2>

                                </div>
                            </div>

 */}

                        </div>
                    }
                    {active === 'tasks' && <Tasks user={user} setUser={setUser} />}
                    {active === 'rewards' && <Rewards user={user} setUser={setUser} />}
                    {active === 'myrewards' && <MyRewards user={user} setUser={setUser} />}
                    {active === 'leaderboard' && <LeaderBoard user={user} setUser={setUser} />}
                    {active === 'overallleaderboard' && <OverallLeaderboard user={user} />}
                </>
            ) : (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <h4>Loading your fitness journey...</h4>
                </div>
            )}
        </div>
    );
}

export default Dashboard


