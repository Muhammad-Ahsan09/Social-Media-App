import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

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

    const res = await fetch(BACKEND_URL + "/api/auth/signup", {
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

return (
  <>
    <main className="relative flex min-h-screen items-center justify-center bg-[#E9EFEB] px-4 py-10 text-[#294C46]">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[#A9DCC8]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#78C9CD]/10 blur-3xl" />

      <form
        onSubmit={handleFormSubmit}
        className="relative w-full max-w-[420px] rounded-[24px] border border-[#D6DFD9] bg-[#F6F7F4] px-6 py-9 shadow-[0_12px_40px_-24px_rgba(41,76,70,0.22)] sm:px-10 sm:py-10"
      >
        {/* Logo and brand */}
        <div className="mb-9 flex flex-col items-center">
          <div className="mb-4 flex h-[62px] w-[62px] items-center justify-center rounded-[19px] bg-gradient-to-br from-[#A9DCC8] to-[#78C9CD]">
            <svg
              viewBox="0 0 100 100"
              className="h-12 w-12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Solace logo"
              role="img"
            >
              <circle cx="68" cy="19" r="12" fill="#173D3A" />
              <path
                d="M66 32 C49 37 25 42 34 51 C39 56 65 58 60 68 C56 76 34 80 22 91 H59 C78 87 91 69 79 59 C68 50 43 49 46 43 C49 38 59 34 66 32Z"
                fill="#173D3A"
              />
            </svg>
          </div>

          <h1 className="text-[25px] font-bold tracking-[0.22em] text-[#294C46]">
            SOLACE
          </h1>

          <p className="mt-2 text-center text-sm text-[#78877F]">
            A little space for every chapter of you.
          </p>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h2 className="text-[23px] font-semibold tracking-tight text-[#294C46]">
            Create your account
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#78877F]">
            Your moments, your memories, your journey.
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[13px] font-medium text-[#435D53]"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-[49px] w-full rounded-xl border border-[#D6DFD9] bg-[#EEF2EE] px-4 text-sm text-[#294C46] outline-none transition placeholder:text-[#929F97] focus:border-[#78BFA7] focus:bg-[#F9FAF8] focus:ring-2 focus:ring-[#A9DCC8]/30"
          />
        </div>

        {/* Full name */}
        <div className="mt-4 space-y-2">
          <label
            htmlFor="name"
            className="text-[13px] font-medium text-[#435D53]"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Your name"
            className="h-[49px] w-full rounded-xl border border-[#D6DFD9] bg-[#EEF2EE] px-4 text-sm text-[#294C46] outline-none transition placeholder:text-[#929F97] focus:border-[#78BFA7] focus:bg-[#F9FAF8] focus:ring-2 focus:ring-[#A9DCC8]/30"
          />
        </div>

        {/* Username */}
        <div className="mt-4 space-y-2">
          <label
            htmlFor="username"
            className="text-[13px] font-medium text-[#435D53]"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="h-[49px] w-full rounded-xl border border-[#D6DFD9] bg-[#EEF2EE] px-4 text-sm text-[#294C46] outline-none transition placeholder:text-[#929F97] focus:border-[#78BFA7] focus:bg-[#F9FAF8] focus:ring-2 focus:ring-[#A9DCC8]/30"
          />
        </div>

        {/* Password */}
        <div className="mt-4 space-y-2">
          <label
            htmlFor="password"
            className="text-[13px] font-medium text-[#435D53]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="h-[49px] w-full rounded-xl border border-[#D6DFD9] bg-[#EEF2EE] px-4 text-sm text-[#294C46] outline-none transition placeholder:text-[#929F97] focus:border-[#78BFA7] focus:bg-[#F9FAF8] focus:ring-2 focus:ring-[#A9DCC8]/30"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="mt-7 h-[50px] w-full rounded-xl bg-gradient-to-r from-[#A9DCC8] to-[#78C9CD] text-sm font-semibold text-[#193F39] transition duration-200 hover:brightness-[0.97] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#397E6D]"
        >
          Create account
        </button>

        {/* Terms */}
        <p className="mt-5 text-center text-[11px] leading-5 text-[#849188]">
          By joining Solace, you agree to our{" "}
          <Link
            to="/terms"
            className="text-[#536E62] underline decoration-[#BCCBC1] underline-offset-2 hover:text-[#397E6D]"
          >
            Terms
          </Link>
          {" "}and{" "}
          <Link
            to="/privacy"
            className="text-[#536E62] underline decoration-[#BCCBC1] underline-offset-2 hover:text-[#397E6D]"
          >
            Privacy Policy
          </Link>
          {" "}and Cookie Policy.
        </p>

        {/* Login */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-1.5 border-t border-[#DFE6E0] pt-6 text-sm">
          <span className="text-[#78877F]">
            Already have an account?
          </span>
          <Link
            to="/login"
            className="font-semibold text-[#397E6D] transition hover:text-[#245D50]"
          >
            Log in
          </Link>
        </div>
      </form>
    </main>

    <Toaster />
  </>
);
}

export default Signup;