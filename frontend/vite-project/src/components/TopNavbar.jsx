import { useState } from "react";
import { FaRegPlusSquare } from "react-icons/fa";
import CreatePost from "./CreatePost";

const TopNavbar = ({setUser}) => {

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
    return (
        <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-white dark:bg-black border-b dark:border-gray-800 flex items-center justify-between px-4 z-50">

            {/* App Name */}
            <div className="font-bold text-lg">
            <div className={`${selectedSection === 6 ? "font-bold" : "" } mt-3 flex items-center pl-2 cursor-pointer rounded
                    hover:bg-slate-300 dark:hover:bg-slate-800 transition-all duration-200 w-3/4 h-9`} onClick={() => {setSelectedSection(6); create ? setCreate(false) : setCreate(true)}} >
                        <FaRegPlusSquare className="mr-5 min-w-6 min-h-6"/> 
                        

                        <div className={`${create ? "" : "hidden"} absolute top-12 left-0
                                dark:bg-gray-800 bg-white border rounded-md
                                w-40 shadow-md z-50`}>
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
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="bg-slate-200 dark:bg-gray-800 px-3 py-1 rounded text-sm font-medium"
            >
                Logout
            </button>

            {
    posting &&
    <div
        className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center"
        onClick={() => setPosting(false)}
    >
        <div
            className="
                bg-white dark:bg-gray-900
                rounded-md shadow-lg
                w-[95%]
                max-w-lg
                min-h-[400px]
                max-h-[90vh]
                overflow-y-auto
            "
            onClick={(e) => e.stopPropagation()}
        >
            <CreatePost setPosting={setPosting} />
        </div>
    </div>
}

        </div>
    );
}; 

export default TopNavbar