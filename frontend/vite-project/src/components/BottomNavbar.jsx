import { BiSolidMoviePlay } from "react-icons/bi"
import { FaSearch, FaUserFriends, FaUser } from "react-icons/fa"
import { IoHomeSharp } from "react-icons/io5"
import { MdExplore } from "react-icons/md"
import { Link } from "react-router-dom"


const BottomNavbar = ({ currentUserId }) => {

    return (
        <div
            className="fixed bottom-0 left-0 w-full z-50 md:hidden
        flex items-center justify-around px-2 py-2
        bg-[#F6F7F4]/95 dark:bg-[#1D3028]/95
        backdrop-blur-md
        border-t border-[#D6DFD9] dark:border-[#344A43]
        text-[#78877F] dark:text-[#9EB1A4]
        transition-colors duration-200"
        >
            <Link
                to="/"
                aria-label="Home"
                className="flex h-11 w-12 items-center justify-center rounded-xl
            hover:bg-[#E9EFEB] hover:text-[#397E6D]
            dark:hover:bg-[#253A31] dark:hover:text-[#A9DCC8]
            transition-all duration-200"
            >
                <IoHomeSharp className="h-5 w-5" />
            </Link>

            <Link
                to="/discover"
                aria-label="Search"
                className="flex h-11 w-12 items-center justify-center rounded-xl
            hover:bg-[#E9EFEB] hover:text-[#397E6D]
            dark:hover:bg-[#253A31] dark:hover:text-[#A9DCC8]
            transition-all duration-200"
            >
                <FaSearch className="h-[18px] w-[18px]" />
            </Link>

            {/* Scenes */}
            <Link
                to="/scenes"
                aria-label="Scenes"
               className="flex h-11 w-12 items-center justify-center rounded-xl
                hover:bg-[#E9EFEB] hover:text-[#397E6D]
                dark:hover:bg-[#253A31] dark:hover:text-[#A9DCC8]
                transition-all duration-200"
            >
                <BiSolidMoviePlay className="h-[20px] w-[20px] shrink-0" />
            </Link>

            {/* <Link
                to="/explore"
                aria-label="Explore"
                className="flex h-11 w-12 items-center justify-center rounded-xl
                hover:bg-[#E9EFEB] hover:text-[#397E6D]
                dark:hover:bg-[#253A31] dark:hover:text-[#A9DCC8]
                transition-all duration-200"
            >
                <MdExplore className="h-6 w-6" />
            </Link> */}

            <Link
                to="/my_friends"
                aria-label="Friends"
                className="flex h-11 w-12 items-center justify-center rounded-xl
            hover:bg-[#E9EFEB] hover:text-[#397E6D]
            dark:hover:bg-[#253A31] dark:hover:text-[#A9DCC8]
            transition-all duration-200"
            >
                <FaUserFriends className="h-5 w-5" />
            </Link>

            <Link
                to={`/profile/${currentUserId}`}
                aria-label="Profile"
                className="flex h-11 w-12 items-center justify-center rounded-xl
                hover:bg-[#E9EFEB] hover:text-[#397E6D]
                dark:hover:bg-[#253A31] dark:hover:text-[#A9DCC8]
                transition-all duration-200"
            >
                <FaUser className="h-[18px] w-[18px]" />
            </Link>
        </div>
    );

}

export default BottomNavbar;

