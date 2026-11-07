import { BiSolidMoviePlay } from "react-icons/bi"
import { FaSearch, FaUserFriends, FaUser } from "react-icons/fa"
import { IoHomeSharp } from "react-icons/io5"
import { MdExplore } from "react-icons/md"
import { Link } from "react-router-dom"

const BottomNavbar = ({ currentUserId }) => {
  const linkClass =
    "flex h-11 w-12 items-center justify-center rounded-xl hover:bg-[#E9EFEB] hover:text-[#397E6D] dark:hover:bg-[#253A31] dark:hover:text-[#A9DCC8] transition-colors";

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around
        border-t border-[#D6DFD9] dark:border-[#344A43]
        bg-[#F6F7F4]/95 dark:bg-[#1D3028]/95
        px-2 py-2 text-[#78877F] dark:text-[#9EB1A4]
        backdrop-blur-md md:hidden"
    >
      <Link to="/" aria-label="Home" className={linkClass}>
        <IoHomeSharp className="h-5 w-5" />
      </Link>

      <Link to="/discover" aria-label="Search" className={linkClass}>
        <FaSearch className="h-5 w-5" />
      </Link>

      <Link to="/scenes" aria-label="Scenes" className={linkClass}>
        <BiSolidMoviePlay className="h-6 w-6" />
      </Link>

      <Link to="/my_friends" aria-label="Friends" className={linkClass}>
        <FaUserFriends className="h-5 w-5" />
      </Link>

      <Link
        to={`/profile/${currentUserId}`}
        aria-label="Profile"
        className={linkClass}
      >
        <FaUser className="h-5 w-5" />
      </Link>
    </nav>
  );
};


export default BottomNavbar;

