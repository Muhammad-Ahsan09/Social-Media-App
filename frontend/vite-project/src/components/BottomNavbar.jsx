import { FaSearch, FaUserFriends, FaUser } from "react-icons/fa"
import { IoHomeSharp } from "react-icons/io5"
import { MdExplore } from "react-icons/md"
import { Link } from "react-router-dom"


const BottomNavbar = ({currentUserId}) => {
    return <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t md:hidden flex justify-around py-3">

        <Link to="/">
            <IoHomeSharp />
        </Link>

        <Link to="/search">
            <FaSearch />
        </Link>

        <Link to="/explore">
            <MdExplore />
        </Link>

        <Link to="/friends">
            <FaUserFriends />
        </Link>

        <Link to={`/profile/${currentUserId}`}>
            <FaUser />
        </Link>

    </div>
}

export default BottomNavbar;

