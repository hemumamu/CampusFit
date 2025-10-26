import { React, useState, useEffect } from 'react'
import dailyTasks from '../Data/DailyTasks'
import axios from 'axios'
import './Tasks.css'
import PushUpCounter from './PushUpCounter.jsx'
import { useNavigate } from 'react-router-dom'
import SquatCounter from './SquatCounter.jsx'

const Tasks = ({ user, setUser }) => {
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

            const res1 = await axios.get('http://localhost:3000/student/getData',
                { headers: { Authorization: `Bearer ${token}` } }

            )
            const steps = res1.data.steps
            const pushups = res1.data.pushups
            const squats = res1.data.squats

            console.log(steps);

            if ((dailyTasks[index].type === 'walking' && steps >= dailyTasks[index].target) || (dailyTasks[index].type == 'pushups' && pushups >= dailyTasks[index].target) || (dailyTasks[index].type == 'squats' && squats >= dailyTasks[index].target)) {
                const res = await axios.put('http://localhost:3000/student/updatepoints',
                    { points, taskIndex: index, dailyTasks }, { headers: { Authorization: `Bearer ${token}` } }

                )
                const updatedFitpoints = user.fitPoints + points
                setUser({ ...user, fitPoints: res.data.fitPoints, completedTasks: res.data.completedTasks })
                setCompletedTasks(res.data.completedTasks);
                alert(`You earned ${points} FitPoints!`);
            }


            else {
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
                <div className='div1'>
                    {/* <h1 >Reward Section</h1> */}
                </div>
                <div className='div2'>
                    <div style={{ color: 'white' }}><h3>Pushups : {user.pushups}</h3></div>
                    <div style={{ color: 'white' }}><h3>Squats : {user.squats}</h3></div>
                </div>

            </div>
             <div className='div1'>
                <h1 >Tasks Section</h1>
            </div>
            <div className='main'>

                <div className='taskssection'>
                    
                    
                    {
                        dailyTasks.map((data, index) => (
                            <div className='taskcard' key={index}>
                                <div>
                                    <h4>{data.title}</h4>
                                    <h4>{data.type} :{data.target} {data.unit}</h4>
                                    <h4>FitPoints : {data.fitPoints}</h4>
                                </div>
                                <div>
                                    <div className='tasksDiv'>
                                        {
                                            data.unit == 'steps' ?
                                                <button onClick={() => handleClick(data.fitPoints, index)}
                                                    disabled={completedTasks.includes(index)} >
                                                    {completedTasks.includes(index) ? 'Claimed' : 'Claim'}
                                                </button>
                                                : data.type == 'pushups' ? (<><button onClick={() => { navigate('/pushups') }}>Complete</button>
                                                    <button onClick={() => handleClick(data.fitPoints, index)} disabled={completedTasks.includes(index)}>{completedTasks.includes(index) ? 'Claimed' : 'Claim'}</button></>)
                                                    : data.type == 'squats' ? <><button onClick={() => { navigate('/squats') }}>Complete</button>
                                                        <button onClick={() => handleClick(data.fitPoints, index)} disabled={completedTasks.includes(index)}>{completedTasks.includes(index) ? 'Claimed' : 'Claim'}</button></> : null
                                        }

                                    </div>

                                </div>
                            </div>

                        ))

                    }
                </div>

            </div>
        </>

    )
}

export default Tasks
