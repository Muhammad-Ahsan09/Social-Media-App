import { useState } from "react";
import CreatePost from "./CreatePost";
import { IoMoon, IoSunny } from "react-icons/io5";
import { Link } from "react-router-dom";
import { FaRegPlusSquare, FaBookOpen } from "react-icons/fa";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const TopNavbar = ({ setUser }) => {

    const [darkMode, setDarkMode] = useState(false)

    const [selectedSection, setSelectedSection] = useState(0)
    const [create, setCreate] = useState(false)
    const [posting, setPosting] = useState(false)




    const handleLogout = async (e) => {
        e.preventDefault()

        await fetch(BACKEND_URL + "/api/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        })

        setUser(false)
        // navigate("/login")


    }

    return (
        <div className="md:hidden fixed top-0 left-0 w-full h-14
        bg-[#F6F7F4] dark:bg-[#1D3028]
        border-b border-[#D6DFD9] dark:border-[#344A43]
        flex items-center justify-between px-4 z-50
        text-[#294C46] dark:text-[#E1EAE4]
        transition-colors duration-200">

            {/* App Name / Create Menu / Journeys */}
            <div className="flex items-center gap-2">

                {/* Create Menu */}
                <div
                    className={`${selectedSection === 6 ? "font-bold" : ""
                        } relative flex items-center justify-center
        cursor-pointer rounded-xl
        hover:bg-[#E9EFEB] dark:hover:bg-[#253A31]
        transition-all duration-200 w-10 h-10`}
                    onClick={() => {
                        setSelectedSection(6);
                        setCreate(!create);
                    }}
                >
                    <FaRegPlusSquare className="w-5 h-5 text-[#397E6D] dark:text-[#A9DCC8]" />

                    {/* Keep your existing Create Dropdown here */}
                    {/* ... */}
                </div>

                {/* Journeys Link */}
                <Link
                    to="/journeys"
                    onClick={() => setCreate(false)}
                    className="flex items-center gap-2 h-10 px-3
        rounded-xl text-sm font-medium
        text-[#397E6D] dark:text-[#A9DCC8]
        hover:bg-[#E9EFEB] dark:hover:bg-[#253A31]
        transition-all duration-200"
                >
                    <FaBookOpen className="w-[18px] h-[18px]" />
                    <span>Journeys</span>
                </Link>

            </div>

            {/* Theme Toggle and Logout */}
            <div className="flex items-center gap-2">

                <button
                    type="button"
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={() => {
                        document.body.classList.toggle("dark");
                        setDarkMode(!darkMode);
                    }}
                    className="flex h-9 w-9 items-center justify-center
                rounded-xl border border-[#D6DFD9]
                bg-[#EEF2EE] text-[#536E62]
                hover:bg-[#DFEAE2] hover:text-[#294C46]
                dark:border-[#40574C] dark:bg-[#253A31]
                dark:text-[#C4D9CC] dark:hover:bg-[#344B40]
                transition-all duration-200"
                >
                    {darkMode ? (
                        <IoSunny className="h-[18px] w-[18px]" />
                    ) : (
                        <IoMoon className="h-[18px] w-[18px]" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="h-9 px-3 rounded-xl
                bg-[#DCE9E0] text-[#294C46]
                hover:bg-[#CDDED2]
                dark:bg-[#2B4035] dark:text-[#D5E8DC]
                dark:hover:bg-[#344B40]
                border border-transparent dark:border-[#40574C]
                text-sm font-medium transition-all duration-200"
                >
                    Logout
                </button>
            </div>

            {/* Create Post Modal */}
            {posting && (
                <div
                    className="fixed inset-0 bg-[#17251F]/55
                backdrop-blur-sm z-[100]
                flex justify-center items-center p-3"
                    onClick={() => setPosting(false)}
                >
                    <div
                        className="bg-[#F6F7F4] dark:bg-[#1D3028]
                    text-[#294C46] dark:text-[#E1EAE4]
                    border border-[#D6DFD9] dark:border-[#40574C]
                    rounded-2xl shadow-2xl
                    w-full max-w-lg min-h-[400px]
                    max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CreatePost setPosting={setPosting} />
                    </div>
                </div>
            )}
        </div>
    );

};

export default TopNavbar