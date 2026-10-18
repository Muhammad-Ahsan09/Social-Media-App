import { useEffect, useState } from "react"
import LeftSidebar from "../components/LeftSidebar"
import { FaRegCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { Link } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL




const FriendRequests = ({currentUserId}) => {

    const [requests, setRequests] = useState([])
    useEffect(() => {
        const getFriendRequests = async () => {
            const res = await fetch(BACKEND_URL + `/api/friend_requests/${currentUserId}`)
            const data = await res.json()

            setRequests(data)

        }

        getFriendRequests()
    }, [])

    const handleAcceptFriendRequest = async (e, requestUserId) => {

        const newRequests = requests.map((request) => request.id != requestUserId)
        setRequests(newRequests)
        console.log(requests)
        
        const res = await fetch(BACKEND_URL + `/api/friend_request/${requestUserId}/${currentUserId}`, {
            method: "PATCH"
        })

        const data = await res.json()
        console.log(data)
    }
return (
  <>
    <div className="min-h-screen bg-[#F5F7F3] text-[#294C46] transition-colors dark:bg-[#17251F] dark:text-[#E1EAE4]">
      <div className="flex min-h-screen flex-col md:flex-row">
        <LeftSidebar currentUserId={currentUserId} />

        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 md:px-8 md:py-10 md:pb-10">
          {/* Page heading */}
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Friend Requests
                </h1>

                {requests.length > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#DCE9DF] px-2 text-xs font-semibold text-[#397E6D] dark:bg-[#293D30] dark:text-[#A9DCC8]">
                    {requests.length}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-[#78877F] dark:text-[#9EB1A4]">
                Connect with people and grow your circle.
              </p>
            </div>

            {/* Requests list */}
            {requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#E0E7E0] bg-white p-4 shadow-sm transition hover:border-[#C5D8CA] sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-[#344A3E] dark:bg-[#203128] dark:hover:border-[#587866]"
                  >
                    {/* User information */}
                    <Link
                      to={`/profile/${request.id}`}
                      className="flex min-w-0 items-center gap-3 sm:gap-4"
                    >
                      <img
                        src={request.profile_pic_url}
                        alt={`${request.full_name}'s profile`}
                        className="h-14 w-14 shrink-0 rounded-full border-2 border-[#E0EAE1] object-cover sm:h-16 sm:w-16 dark:border-[#40574C]"
                      />

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                          {request.full_name}
                        </h2>

                        <p className="mt-1 text-xs text-[#78877F] dark:text-[#9EB1A4]">
                          Wants to connect with you
                        </p>
                      </div>
                    </Link>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <button
                        type="button"
                        onClick={(e) =>
                          handleAcceptFriendRequest(e, request.id)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#397E6D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6B5C] active:scale-[0.98] sm:flex-none"
                      >
                        <FaRegCheckCircle className="h-4 w-4" />
                        Accept
                      </button>

                      <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E0E7E0] bg-[#F8FAF7] px-4 py-2.5 text-sm font-semibold text-[#64766A] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.98] sm:flex-none dark:border-[#40574C] dark:bg-[#26382E] dark:text-[#C4D9CC] dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                      >
                        <RxCrossCircled className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D6E1D7] bg-white/60 px-6 py-12 text-center dark:border-[#344A3E] dark:bg-[#203128]/50">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5EEE6] text-[#397E6D] dark:bg-[#293D30] dark:text-[#A9DCC8]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                    <path d="m17 11 2 2 4-4" />
                  </svg>
                </div>

                <h2 className="text-lg font-semibold">
                  You're all caught up
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-6 text-[#78877F] dark:text-[#9EB1A4]">
                  No friend requests for now. When someone wants to connect,
                  you'll find their request here.
                </p>

                <Link
                  to="/"
                  className="mt-6 rounded-xl border border-[#D6E1D7] bg-[#F5F8F4] px-5 py-2.5 text-sm font-semibold text-[#397E6D] transition hover:bg-[#E5EEE6] dark:border-[#40574C] dark:bg-[#293D30] dark:text-[#A9DCC8] dark:hover:bg-[#344A3E]"
                >
                  Back to home
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNavbar />
    </div>
  </>
);

}

export default FriendRequests