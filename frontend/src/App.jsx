import react from 'react'
import Signup from './components/Signup';
import { Link, BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import PushUpCounter from './components/PushUpCounter';
import SquatCounter from './components/SquatCounter';
function App() {
  return (
    <>

      <BrowserRouter>
        

        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path='/signup' element={<Signup />}></Route>
          <Route path='/signin' element={<SignIn />}></Route>
          <Route path='/dashboard' element={<Dashboard />}></Route>
          <Route path='/pushups' element={<PushUpCounter/>}></Route>
          <Route path='/squats' element={<SquatCounter/>}></Route>
        </Routes>

      </BrowserRouter>




    </>
  )
}
export default App;