import { Suspense, lazy } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { createContext, useEffect, useState } from "react"

const Home = lazy(() => import("./pages/Home"))
const Signup = lazy(() => import("./pages/Signup"))
const Login = lazy(() => import("./pages/Login"))
const MyProfilePage = lazy(() => import("./pages/MyProfilePage"))
const FriendRequests = lazy(() => import("./pages/FriendRequests"))
const MyFriends = lazy(() => import("./pages/MyFriends"))
const Chat = lazy(() => import("./pages/Chat"))
const SearchPage = lazy(() => import("./pages/SearchPage"))
const PostDetail = lazy(() => import("./pages/PostDetail"))
const Explore = lazy(() => import("./pages/Explore"))



// import Signup from "./pages/Signup"
// import Login from "./pages/Login"
// import { createContext, useEffect, useState } from "react"
// import MyProfilePage from "./pages/MyProfilePage"
// import FriendRequests from "./pages/FriendRequests"
// import MyFriends from "./pages/MyFriends"
// import Chat from "./pages/Chat"
// import SearchPage from "./pages/SearchPage"
// import PostDetail from "./pages/PostDetail"
// import Explore from "./pages/Explore"


function App() {

  const [user, setUser] = useState()

  

  useEffect(() => {
    const getUserStatus = async () => {
      const res = await fetch("http://localhost:8000/api/issignedin", {
        credentials: "include"
      })
      
      const data = await res.json()
      setUser(data)
      
      console.log("User:", data)
    }

    getUserStatus()

  }, [])
  
  
  return <BrowserRouter>
          <Routes>
            <Route path="/signup" element={ !user ? <Suspense fallback={<div>Loading...</div>}> <Signup setUser={setUser}/></Suspense> : <Navigate to={`/${user.id}`}/> }/>
            <Route path="/login" element={ !user ? <Suspense fallback={<div>Loading...</div>}> <Login setUser={setUser} /></Suspense> : <Navigate to={`/${user.id}`}/>}/>
            <Route path="/:userid" element={ user ? <Suspense fallback={<div>Loading...</div>}>  <Home setUser={setUser} currentUserId={user.id} /> </Suspense> : <Navigate to="/signup"/>}/>
            <Route path="/profile/:userid" element={ user ?<Suspense fallback={<div>Loading...</div>}>  <MyProfilePage setUser={setUser} currentUserId={user.id} /></Suspense>  : <Navigate to="/signup"/>}  />
            <Route path="/friend_requests" element={user ? <Suspense fallback={<div>Loading...</div>}> <FriendRequests setUser={setUser} currentUserId={user.id}/> </Suspense>: <Navigate to="/signup"/>}/>
            <Route path="/my_friends" element={user ? <Suspense fallback={<div>Loading...</div>}>  <MyFriends  setUser={setUser} currentUserId={user.id}/> </Suspense> : <Navigate to="/login" />} />
            <Route path="chats/:friend_id" element={user ? <Suspense fallback={<div>Loading...</div>}>  <Chat setUser={setUser} currentUserId={user.id}/> </Suspense> : <Navigate to={"/login"}/>}/>
            <Route path="/search" element={ user ?<Suspense fallback={<div>Loading...</div>}>  <SearchPage  setUser={setUser} currentUserId={user.id}/></Suspense> : <Navigate to="/login" />} />
            <Route path="/posts/:post_id" element={ user ?<Suspense fallback={<div>Loading...</div>}>  <PostDetail setUser={setUser} currentUserId={user.id} /></Suspense> : <Navigate to="/login"/> } />
            <Route path="/explore" element={user ?<Suspense fallback={<div>Loading...</div>}>  <Explore setUser={setUser} currentUserId={user.id} /> </Suspense>: <Navigate to="/login" />}/>
          </Routes>
        </BrowserRouter>
  // <Home/>
}

export default App
