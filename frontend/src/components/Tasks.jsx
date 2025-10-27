import { React, useState, useEffect } from 'react'
import dailyTasks from '../Data/DailyTasks'
import axios from 'axios'
import './Tasks.css'
import { useNavigate } from 'react-router-dom'

const Tasks = ({ user, setUser }) => {
    const API = import.meta.env.VITE_API
    const navigate = useNavigate()
    const [completedTasks, setCompletedTasks] = useState([]);

    useEffect(() => {
        if (user && user.completedTasks) {
            setCompletedTasks(user.completedTasks);
        }
    }, [user]);

    const handleClick = async (points, index) => {
        try {
            const token = localStorage.getItem('token')
            const res1 = await axios.get(`${API}/student/getData`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const steps = res1.data.steps
            const pushups = res1.data.pushups
            const squats = res1.data.squats

            if ((dailyTasks[index].type === 'walking' && steps >= dailyTasks[index].target) || 
                (dailyTasks[index].type == 'pushups' && pushups >= dailyTasks[index].target) || 
                (dailyTasks[index].type == 'squats' && squats >= dailyTasks[index].target)) {
                const res = await axios.put(`${API}/student/updatepoints`,
                    { points, taskIndex: index, dailyTasks }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                setUser({ ...user, fitPoints: res.data.fitPoints, completedTasks: res.data.completedTasks })
                setCompletedTasks(res.data.completedTasks);
                alert(`You earned ${points} FitPoints!`);
            } else {
                alert('You have not completed the task yet!')
            }
        } catch (err) {
            console.error('Error updating points:', err);
            alert('Something went wrong! Please try again.');
        }
    }

    return (
        <>
            <div className='info'>
                <div className='infoRight'>
                    <div className='statBox'>
                        <h3>💪 Pushups : {user?.pushups || 0}</h3>
                    </div>
                    <div className='statBox'>
                        <h3>🦵 Squats : {user?.squats || 0}</h3>
                    </div>
                </div>
            </div>

                <div className='infoLeft' style={{textAlign:'center'}}>
                    <h2>Tasks Section</h2>
                </div>
            <div className='main'>
                <div className='taskssection'>
                    {dailyTasks.map((data, index) => (
                        <div className='taskcard' key={index}>
                            <div className='taskInfo'>
                                <h4 className='taskTitle'>{data.title}</h4>
                                <p className='taskDetails'>{data.type}: {data.target} {data.unit}</p>
                                <p className='taskPoints'>FitPoints: {data.fitPoints}</p>
                            </div>
                            <div className='tasksDiv'>
                                {data.unit == 'steps' ? (
                                    <button 
                                        onClick={() => handleClick(data.fitPoints, index)}
                                        disabled={completedTasks.includes(index)}
                                    >
                                        {completedTasks.includes(index) ? 'Claimed' : 'Claim'}
                                    </button>
                                ) : data.type == 'pushups' ? (
                                    <>
                                        <button onClick={() => navigate('/pushups')}>Complete</button>
                                        <button 
                                            onClick={() => handleClick(data.fitPoints, index)} 
                                            disabled={completedTasks.includes(index)}
                                        >
                                            {completedTasks.includes(index) ? 'Claimed' : 'Claim'}
                                        </button>
                                    </>
                                ) : data.type == 'squats' ? (
                                    <>
                                        <button onClick={() => navigate('/squats')}>Complete</button>
                                        <button 
                                            onClick={() => handleClick(data.fitPoints, index)} 
                                            disabled={completedTasks.includes(index)}
                                        >
                                            {completedTasks.includes(index) ? 'Claimed' : 'Claim'}
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Tasks
