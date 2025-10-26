






















///////////////////////////////////////////

import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate,Link } from 'react-router-dom'
import './SignIn.css'


const SignIn = () => {
    const API=import.meta.env.API
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: "", password: "" })
    useEffect(() => {
        setForm({ email: "", password: "" })
    }, [])


    const handleFeild = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post(`${API}/student/login`, form)

            alert(res.data.message)
            localStorage.setItem('token', res.data.token)

            navigate('/dashboard')
        } catch (err) {
            alert(err.response.data.message)
        }




    }

    return (
        <div className='signinDiv'>
            <form method="post" onSubmit={handleSubmit} className='inputform'>
                <h2>Login Form</h2>
                <label htmlFor="email">Email :</label>  
                <input type="email" placeholder='email' value={form.email} name='email' onChange={handleFeild} />
                <label htmlFor="password">Password :</label>  
                <input type="password" placeholder='password' value={form.password} name='password' onChange={handleFeild} />
                <button type="submit">Submit</button>
                <br />
                <h4>Create an account!  <Link to='/signup'>SignUp</Link></h4>
            </form>

        </div>
    )
}

export default SignIn
