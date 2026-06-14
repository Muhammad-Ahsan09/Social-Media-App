import { useState } from "react";
import { IoHomeSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { MdExplore } from "react-icons/md";
import { BiSolidMoviePlay } from "react-icons/bi";
import { LuMessageCircle } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa6";
import { FaRegPlusSquare } from "react-icons/fa";
import { FaGripLines } from "react-icons/fa";
import CreatePost from "./CreatePost";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { FaUserFriends } from "react-icons/fa";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";




const LeftSidebar = ({setUser, currentUserId}) => {
    
    const [darkMode, setDarkMode] = useState(false)

    const params = useParams()
    const userid = params.userid



    const [selectedSection, setSelectedSection] = useState(0)
    const [create, setCreate] = useState(false)

    const [posting, setPosting] = useState(false)



    const handleLogout = async (e) => {
        e.preventDefault()

        await fetch("https://social-media-app-five-rust.vercel.app/api/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            credentials: "include"
        })

        setUser(false)
        // navigate("/login")

        
    }

    return <div className="hidden md:block md:w-1/5 border-r-2 border-gray-300 dark:border-gray-700 transition-all pt-9 sticky top-0 h-screen overflow-hidden">
        
        
        <div className="flex justify-center">
            <div className="mr-5 mt-1 text-2xl">
                <button onClick={() => {document.body.classList.toggle('dark'); setDarkMode(!darkMode)}}>
                    {
                        darkMode ? < IoSunny className=""/> : <IoMoon/>
                    }
                    
                </button>
            </div>
            <h1 className="font-bold text-2xl">GET SOCIAL</h1>
        </div>

        <div className="flex justify-center mt-6">
            <div className="w-full flex flex-col items-center ">

                
                    <div className={ ` ${selectedSection === 0 ? "font-bold" : ""} mt-3 flex items-center pl-2  cursor-pointer rounded
                        hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`}  onClick={() => {setSelectedSection(0)}}>
                            <Link to={`/${currentUserId}`} className="flex">
                                <IoHomeSharp className="mr-5 w-6 h-6"/> 
                                <h1>Home</h1>
                            </Link>
                    </div>
                

                <div className={` ${selectedSection === 1 ? "font-bold" : "" } mt-3 flex items-center pl-2 cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`} onClick={() => {setSelectedSection(1)}}>
                        <Link to="/search" className="flex">
                            <FaSearch className="mr-5 w-6 h-6"/> 
                            <h1>Search</h1>
                        </Link>
                </div>

                <div className={`${selectedSection === 2 ? "font-bold" : "" } mt-3 flex items-center pl-2  cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`} onClick={() => {setSelectedSection(2)}}>
                        <Link to="/explore" className="flex">
                            <MdExplore className="mr-5 w-6 h-6"/>
                            <h1>Explore</h1>
                        </Link>
                </div>

                <div className={`${selectedSection === 3 ? "font-bold": "" } mt-3 flex items-center pl-2 cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`} onClick={() => {setSelectedSection(3)}}>
                        <BiSolidMoviePlay className="mr-5 w-6 h-6"/> 
                        <h1>Reels</h1>
                </div>

                <div className={`${selectedSection === 4 ? "font-bold" : "" } mt-3 flex items-center pl-2 cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`} onClick={() => {setSelectedSection(4)}}>

                        <Link to="/my_friends" className="flex">
                            {/* <LuMessageCircle className="mr-5 w-6 h-6"/>  */}
                            <FaUserFriends className="mr-5 w-6 h-6 "/>
                            <h1>Friends</h1>
                        
                            {/* <h1>Messages</h1> */}
                        </Link>
                </div>

                <div className={`${selectedSection === 5 ? "font-bold" : "" } mt-3 flex items-center pl-2  cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`}onClick={() => {setSelectedSection(5)}}>
                        <FaRegHeart className="mr-5 w-6 h-6"/> 
                       
                        <h1>Notifications</h1>

                </div>

                <div className={`${selectedSection === 6 ? "font-bold" : "" } mt-3 flex items-center pl-2 cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`} onClick={() => {setSelectedSection(6); create ? setCreate(false) : setCreate(true)}} >
                        <FaRegPlusSquare className="mr-5 min-w-6 min-h-6"/> 
                        <h1>Create</h1>

                        <div className={`${create ? "" : "hidden" } absolute mt-28 -ml-3 dark:bg-gray-800 
                         rounded-md border bg-white h-20 w-4/5  transition-all shadow-md `}  >
                            <p className="hover:bg-slate-300 dark:hover:bg-gray-700
                            h-10 w-full pl-3 pt-2 border-b font-normal rounded-md"
                            onClick={() => {setPosting(true)}}>
                                Post
                            </p>

                            <p className="hover:bg-slate-300 h-10 w-full pl-3 pt-2 font-normal rounded-md dark:hover:bg-gray-700">
                                AI
                            </p>
                        </div>
                </div>

                <div className={` ${selectedSection === 7 ? "bg-slate-300" : "" } mt-3 flex items-center pl-2 font-semibold cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`} onClick={() => {setSelectedSection(7)}}>
                        
                        <Link to={`/profile/${currentUserId}`}>
                             <h1>Profile</h1>
                        </Link>
                </div>

                
                <div className={`${selectedSection === 8 ? "bg-slate-300" : "" } mt-3 flex items-center pl-2 font-semibold cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`} onClick={() => {setSelectedSection(8)}}>
                        <Link to={`/friend_requests`} className="flex">
                            <FaUserFriends className="mr-5 w-6 h-6 "/>
                            <h1>Requests</h1>
                        </Link>
                </div>
                

                {/* <div className={`${selectedSection === 1 ? "bg-slate-300" : "" } mt-3 flex items-center pl-2 font-semibold cursor-pointer rounded
                    hover:bg-slate-300 transition-all duration-200 w-3/4 h-9`} onClick={() => {setSelectedSection(9)}}>
                        <FaGripLines className="mr-5 w-6 h-6"/>
                        <h1>More</h1>
                </div> */}



                

                <div className={`${selectedSection === 5 ? "bg-slate-300" : "" } mt-3 flex items-center pl-2 font-semibold cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`} onClick={(e) => {handleLogout(e)}}>
                        <BiLogOut className="mr-5 w-6 h-6" />
                       
                        <h1>Logout</h1>
                </div>

                {
                    posting && <div className="fixed shadow-lg  bg-white left-1/2 
                    rounded-md w-1/3 h-2/3 -translate-x-1/2 transition-all">
                        <CreatePost setPosting={setPosting}/>
                        </div>
                }

                

                
            </div>
        </div>

    </div>
}

export default LeftSidebar;