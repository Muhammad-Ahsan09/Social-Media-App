import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {

  const [email, setEmail] = useState("")
  const [fullName, setFullname] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    

    if(!fullName) {
      toast.error("Please provide Full Name")
      return
    }

    if(!username){
      toast.error("Please provide a username")
      return
    }

    if(password.length < 6){

      toast.error("Password must be atleast 6 character")
      return;
    }

    const res = await fetch("http://localhost:8000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify({
        email,
        full_name: fullName,
        username, 
        password})
    })

    const user = await res.json()

    if(!res.ok) {
      toast.error("an error occurred")
    }
    
    else{
      navigate("/login")
    }



  }

  return <>
    <form className=" flex h-screen justify-center items-center " onSubmit={(e) => {handleFormSubmit(e)}}>
      <div className="border-2 p-10">
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold">INSTAGRAM</h1>
        </div>
        
        <div className="text-gray-400 font-semibold text-lg">Sign up to see photos and videos <p className="flex justify-center ">from your friends.</p> </div>
        
        {/* email field */}

        <div className="mt-7">
          <input type="email" name="email" value={email} onChange={(e) => {setEmail(e.target.value)}}
          className="bg-slate-100 h-12 w-72 pl-5 border-2 rounded" placeholder="someone@example.com"/>
        </div>

        {/* full name field */}
        <div className="mt-3">
          <input type="text" name="name" value={fullName} onChange={(e) => {setFullname(e.target.value)}}
          className="bg-slate-100 h-12 w-72 pl-5 border-2 rounded" placeholder="Full Name"/>
        </div>

        {/* username field */}
        <div className="mt-3">
          <input type="text" name="username" value={username} onChange={(e) => {setUsername(e.target.value)}}
           className="bg-slate-100 h-12 w-72 pl-5 border-2 rounded" placeholder="username"/>
        </div>

        {/* password field */}
        <div className="mt-3">
          <input type="password" name="password" value={password} onChange={(e) => {setPassword(e.target.value)}}
          className="bg-slate-100 h-12 w-72 pl-5 border-2 rounded" placeholder="Password"/>
        </div>

        <div>
          <button className="bg-blue-400 w-72 mt-5 rounded h-8 text-white" type="submit">Sign up</button>
        </div>

        <div className="text-gray-400 mt-5">
          By signing up you agree to our Terms, Data <p className="flex justify-center">policy and Cookie policy</p>
        </div>

        <p className="text-gray-400 mt-5 flex justify-center">
          Already have an account? <span className="text-blue-400"><Link to="/login"> Login</Link></span>
        </p>
      </div>
    </form>

    <Toaster/>
  </>
}

export default Signup;