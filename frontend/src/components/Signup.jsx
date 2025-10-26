import react from 'react'
import { useState } from 'react';
import axios from 'axios'
import './Signup.css'
import { useNavigate,Link } from 'react-router-dom';
function Signup() {
    const  navigate=useNavigate()
    const [form, setForm] = useState({ name: "", email: "", password: "" ,department:"",year:""})
    const handleFeild = (e) => {

        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        await axios.post('http://localhost:3000/student/register', form)
            .then((res) => {
                alert(res.data.message)
                setForm({name:"",email:"",password:"",department:"",year:""})
                navigate('/signin')
               
                // console.log('request sent')
            }).catch((err) => {
                console.log(err)
                alert(err.response.data.message)
            })


    }


    return (
        <>
         <div className='main-Div'>
            
            <form onSubmit={handleSubmit} method='post' className='form'>
                <h1>Registration Form </h1>
                <label htmlFor="name">Username :</label>  
                <input type="text" placeholder='Username' name='name' value={form.name} onChange={handleFeild} />
                <label htmlFor="email">Email :</label>  
                <input type="email" placeholder='Email' name='email' value={form.email} onChange={handleFeild} />
                <label htmlFor="password">Password :</label>  
                <input type="password" placeholder='Password' name='password' value={form.password} onChange={handleFeild} />
                <label htmlFor="department" >Department :</label>
                <select name="department" id="" value={form.department} onChange={handleFeild}>
                    
                    <option value="">None</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="ALLIED">ALLIED</option>

                </select>
                <label htmlFor="year">Year :</label>  
                <select name="year" id="" value={form.year} onChange={handleFeild}>
                    <option value="">None</option>
                    <option value="1">1 </option>
                    <option value="2">2 </option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
                <button type="submit">Submit</button>
                <h4>Already have an account!  <Link to='/signin'> SignIn</Link></h4>
            </form>
         </div>
        </>
    )
}
export default Signup;