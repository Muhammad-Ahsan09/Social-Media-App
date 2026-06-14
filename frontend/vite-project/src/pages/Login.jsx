import { useState } from "react"
import {Link, Navigate, useNavigate, useSearchParams} from "react-router-dom"
import toast, { Toaster } from 'react-hot-toast';

const Login = ({setUser}) => {

  const navigate = useNavigate()


  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch("https://social-media-app-five-rust.vercel.app/api/auth/login", {
      method: "POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify({
        email,
        password
      }),
      credentials: "include"

    })

    const data = await res.json()
    if(res.ok){
      
      setUser(data)
      
    }
    else{
      toast.error(data.message)
    }



  }

  return <>
    <form className=" flex h-screen justify-center items-center " onSubmit={(e) => {handleFormSubmit(e)}}>
      <div className="border-2 p-10">
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold">INSTAGRAM</h1>
        </div>
        
        <div className="text-gray-400 font-semibold text-lg">Login up to see photos and videos <p className="flex justify-center ">from your friends.</p> </div>
        
        {/* email field */}

        <div className="mt-7">
          <input type="email" name="email" onChange={(e) => {setEmail(e.target.value)}}
          className="bg-slate-100 h-12 w-72 pl-5 border-2 rounded dark:bg-black" placeholder="someone@example.com"/>
        </div>


        {/* password field */}
        <div className="mt-3">
          <input type="password" name="password" onChange={(e) => {setPassword(e.target.value)}}
           className="bg-slate-100 h-12 w-72 pl-5 border-2 rounded dark:bg-black" placeholder="Password"/>
        </div>

        <div>
          <button type="submit" className="bg-blue-400 w-72 mt-5 rounded h-8 text-white">Sign in</button>
        </div>

        {/* <p className="text-gray-400 mt-5">
          By signing up you agree to our Terms, Data <p className="flex justify-center">policy and Cookie policy</p>
        </p> */}
        <p className="text-gray-400 mt-5">
        Don't have an account? <span className="text-blue-400"><Link to="/signup"> Sign up</Link></span>
        </p>
      </div>

      <Toaster />
    </form>
  </>
}

export default Login;