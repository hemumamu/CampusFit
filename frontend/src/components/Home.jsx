import React from 'react'
import { BrowserRouter, Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
    return (
        <div>


            <nav >
                <div className='navdiv1'>
                    <h2 >CampusFit</h2>
                </div>
                <div className='navdiv2'>
                    <div><Link to="/signup" className='but'><h3>SignUp</h3></Link></div>
                    <div><Link to="/signin" className='but'><h3>SignIn</h3></Link></div>
                </div>
            </nav>
            <div className='imgDiv'>
                <div className='desc'>
                    <h2 style={{color:'#4CAF50'}}>Welcome to CampusFit League – Where Fitness Meets Fun!</h2>
                    <br />
                    <h3>A gamified fitness platform designed exclusively for students to stay active, compete with friends, and earn exciting rewards!</h3>

                </div>

            </div>
            <div className="about">
                <div className='a1'>
                    <h1 style={{color:'#4CAF50'}}>About CampusFit</h1>
                    <br />
                    <br />
                    <h3>CampusFit League transforms your everyday fitness activities into a thrilling campus challenge.
                        Track your steps, complete daily fitness tasks, join team challenges, and climb the leaderboard to prove you’re the fittest on campus!
                        The more you move, the more FitPoints you earn — redeem them for real rewards like canteen coupons, event passes, and more!

                        Whether it’s walking between classes, doing yoga in the morning, or a friendly push-up competition — every move counts here.</h3>
                    <br /><br />
                    <h2 style={{color:'#4CAF50'}}>Call Of Action</h2>
                    <br />
                    <h3>🏃‍♂️ Take the Challenge. Earn FitPoints. Rule the Leaderboard!</h3>
                    <h3>👉 Login or Register now and start your CampusFit journey today!</h3>

                        
                </div>
                <div>

                </div>
            </div>



        </div>
    )
}

export default Home
