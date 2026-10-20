import { useState } from "react";
import { IoHomeSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { MdExplore } from "react-icons/md";
import { BiSolidMoviePlay } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa6";
import { FaRegPlusSquare } from "react-icons/fa";
import CreatePost from "./CreatePost";
import { Link, useLocation } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { FaUserFriends } from "react-icons/fa";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL




const LeftSidebar = ({ setUser, currentUserId }) => {

  const [darkMode, setDarkMode] = useState(false)
  const location = useLocation();

  const [selectedSection, setSelectedSection] = useState(null);
  const [create, setCreate] = useState(false)

  const [posting, setPosting] = useState(false)



  const handleLogout = async (e) => {
    e.preventDefault()

    const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })

    const data = await res.json()

    if(data.success) {
      setUser(false)
    }

  }

  return (
    <aside className="hidden md:flex md:w-1/5 md:min-w-[220px] md:max-w-[280px] flex-col border-r border-[#D6DFD9] bg-[#F6F7F4] text-[#294C46] transition-colors duration-300 dark:border-[#344A43] dark:bg-[#182823] dark:text-[#E1EAE4]">

      {/* Brand and theme toggle */}
      <div className="flex items-center justify-between px-6 pt-9 pb-8">
        <h1 className="text-[22px] font-bold tracking-[0.2em] text-[#294C46] dark:text-[#D5E9DF]">
          SOLACE
        </h1>

        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => {
            document.body.classList.toggle("dark");
            setDarkMode(!darkMode);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D6DFD9] bg-[#EEF2EE] text-[#536E62] transition-all duration-200 hover:bg-[#DFEAE2] hover:text-[#294C46] dark:border-[#40574C] dark:bg-[#253A31] dark:text-[#C4D9CC] dark:hover:bg-[#344B40]"
        >
          {darkMode ? (
            <IoSunny className="h-[18px] w-[18px]" />
          ) : (
            <IoMoon className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89968D] dark:text-[#8FA69A]">
          Your space
        </p>

        <div className="flex flex-col gap-1.5">

          {/* Home */}
          <Link
            to={`/${currentUserId}`}
            onClick={() => setSelectedSection(0)}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] transition-all duration-200 ${selectedSection === 0
              ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
              : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
              }`}
          >
            <IoHomeSharp className="h-[19px] w-[19px] shrink-0" />
            <span>Home</span>
          </Link>

          {/* Search */}
          <Link
            to="/search"
            onClick={() => setSelectedSection(1)}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] transition-all duration-200 ${selectedSection === 1
              ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
              : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
              }`}
          >
            <FaSearch className="h-[18px] w-[18px] shrink-0" />
            <span>Search</span>
          </Link>

          {/* Explore */}
          <Link
            to="/explore"
            onClick={() => setSelectedSection(2)}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] transition-all duration-200 ${selectedSection === 2
              ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
              : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
              }`}
          >
            <MdExplore className="h-[20px] w-[20px] shrink-0" />
            <span>Explore</span>
          </Link>

          {/* Journeys */}
          <Link
            to="/journeys"
            onClick={() => setSelectedSection(9)}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] transition-all duration-200 ${selectedSection === 9
                ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
                : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
              }`}
          >
            <FaBookOpen className="h-[19px] w-[19px] shrink-0" />
            <span>Journeys</span>
          </Link>

          {/* Scenes */}
          <button
            type="button"
            onClick={() => setSelectedSection(3)}
            className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] transition-all duration-200 ${selectedSection === 3
              ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
              : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
              }`}
          >
            <BiSolidMoviePlay className="h-[20px] w-[20px] shrink-0" />
            <span>Scenes</span>
          </button>

          {/* Friends */}
          <Link
            to="/my_friends"
            onClick={() => setSelectedSection(4)}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] transition-all duration-200 ${selectedSection === 4
              ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
              : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
              }`}
          >
            <FaUserFriends className="h-[20px] w-[20px] shrink-0" />
            <span>Friends</span>
          </Link>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => setSelectedSection(5)}
            className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] transition-all duration-200 ${selectedSection === 5
              ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
              : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
              }`}
          >
            <FaRegHeart className="h-[20px] w-[20px] shrink-0" />
            <span>Notifications</span>
          </button>

          {/* Create */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSelectedSection(6);
                setCreate(!create);
              }}
              className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] transition-all duration-200 ${selectedSection === 6 || create
                ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
                : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
                }`}
            >
              <FaRegPlusSquare className="h-[19px] w-[19px] shrink-0" />
              <span>Create</span>
              <span className="ml-auto text-[11px] text-[#89968D]">
                {create ? "−" : "+"}
              </span>
            </button>

            {create && (
              <div className="ml-3 mt-1 overflow-hidden rounded-xl border border-[#D6DFD9] bg-[#F6F7F4] p-1 shadow-sm dark:border-[#40574C] dark:bg-[#20342B]">
                <button
                  type="button"
                  onClick={() => {
                    setPosting(true);
                    setCreate(false);
                  }}
                  className="h-10 w-full rounded-lg px-4 text-left text-[13px] text-[#536E62] transition hover:bg-[#E9EFEB] dark:text-[#C4D9CC] dark:hover:bg-[#30483B]"
                >
                  Create a post
                </button>

                <button
                  type="button"
                  onClick={() => setCreate(false)}
                  className="h-10 w-full rounded-lg px-4 text-left text-[13px] text-[#536E62] transition hover:bg-[#E9EFEB] dark:text-[#C4D9CC] dark:hover:bg-[#30483B]"
                >
                  AI
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal section */}
        <div className="mb-3 mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89968D] dark:text-[#8FA69A]">
          Personal
        </div>

        <div className="flex flex-col gap-1.5">

          {/* Profile */}
          <Link
            to={`/profile/${currentUserId}`}
            onClick={() => setSelectedSection(7)}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] transition-all duration-200 ${selectedSection === 7
              ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
              : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
              }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DDEBE2] text-[11px] font-bold text-[#397E6D] dark:bg-[#40594A] dark:text-[#D5E9DF]">
              P
            </span>
            <span>Profile</span>
          </Link>

          {/* Friend requests */}
          <Link
            to="/friend_requests"
            onClick={() => setSelectedSection(8)}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] transition-all duration-200 ${selectedSection === 8
              ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#30483B] dark:text-[#E0F0E5]"
              : "text-[#64766B] hover:bg-[#E9EFEB] dark:text-[#B3C6B9] dark:hover:bg-[#253A31]"
              }`}
          >
            <FaUserFriends className="h-[20px] w-[20px] shrink-0" />
            <span>Requests</span>
          </Link>
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto border-t border-[#DFE6E0] p-4 dark:border-[#344A43]">
        <button
          type="button"
          onClick={(e) => handleLogout(e)}
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] text-[#78877F] transition-all duration-200 hover:bg-[#F0E4E1] hover:text-[#9D5148] dark:text-[#B3C6B9] dark:hover:bg-[#3B2927] dark:hover:text-[#E6A59C]"
        >
          <BiLogOut className="h-[20px] w-[20px] shrink-0" />
          <span>Log out</span>
        </button>
      </div>

      {/* Create post modal */}
      {posting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#20342B]/30 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] p-5 shadow-[0_20px_60px_-20px_rgba(41,76,70,0.3)] dark:border-[#40574C] dark:bg-[#20342B]">
            <CreatePost setPosting={setPosting} />
          </div>
        </div>
      )}
    </aside>
  );

}

export default LeftSidebar;