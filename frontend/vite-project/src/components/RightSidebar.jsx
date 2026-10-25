import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const RightSidebar = () => {

    const [user, setUser] = useState({})
    const [friendSuggestions, setFriendSuggestions] = useState([])
    const params = useParams()

    const userid = params.userid

    useEffect(() => {
        const getUserData = async () => {
            const res = await fetch(BACKEND_URL + `/api/users/${userid}`)
            setUser(await res.json())
        }

        const getFreindSuggestions = async () => {
            const res = await fetch(BACKEND_URL + `/api/friendsuggestions/${userid}`)
            setFriendSuggestions(await res.json())
        }

        getUserData()
        getFreindSuggestions()
    }, [])

return (
  <aside className="hidden pt-10 text-[#294C46] transition-colors duration-300 dark:text-[#E1EAE4] lg:block shrink-0 lg:pr-6">

    {/* Current user */}
    <div className="mb-8 rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] p-4 dark:border-[#344A43] dark:bg-[#1D3028]">

      <div className="flex items-center gap-3">
        <img
          src={user.profile_pic_url}
          alt={user.full_name}
          className="h-12 w-12 shrink-0 rounded-full border border-[#D6DFD9] object-cover dark:border-[#40574C]"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {user.full_name}
          </p>
          <p className="mt-1 text-xs text-[#89968D] dark:text-[#9EB1A4]">
            Your space
          </p>
        </div>

        <button
          type="button"
          className="text-xs font-semibold text-[#397E6D] transition hover:text-[#245D50] dark:text-[#A9DCC8] dark:hover:text-[#C8E9D8]"
        >
          Switch
        </button>
      </div>
    </div>

    {/* Suggestions heading */}
    <div className="mb-4 flex items-center justify-between px-1">
      <h2 className="text-[13px] font-semibold text-[#536E62] dark:text-[#C4D9CC]">
        People to discover
      </h2>

      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#89968D] dark:text-[#8FA69A]">
        Suggested
      </span>
    </div>

    {/* Friend suggestions */}
    <div className="flex flex-col gap-1">
      {friendSuggestions.map((suggestion, index) => (
        <div
          key={suggestion.id ?? index}
          className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors duration-200 hover:bg-[#E9EFEB] dark:hover:bg-[#253A31]"
        >
          <Link
            to={`/profile/${suggestion.id}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <img
              src={suggestion.profile_pic_url}
              alt={suggestion.full_name}
              className="h-10 w-10 shrink-0 rounded-full border border-[#D6DFD9] object-cover transition group-hover:border-[#A9DCC8] dark:border-[#40574C]"
            />

            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[#294C46] transition group-hover:text-[#397E6D] dark:text-[#E1EAE4] dark:group-hover:text-[#A9DCC8]">
                {suggestion.full_name}
              </p>

              <p className="mt-1 text-[11px] text-[#89968D] dark:text-[#9EB1A4]">
                Discover their journey
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#397E6D] transition hover:bg-[#DDEBE2] dark:text-[#A9DCC8] dark:hover:bg-[#30483B]"
          >
            Follow
          </button>
        </div>
      ))}
    </div>

    {/* Empty state */}
    {friendSuggestions.length === 0 && (
      <div className="rounded-xl border border-dashed border-[#D6DFD9] px-4 py-6 text-center dark:border-[#40574C]">
        <p className="text-sm font-medium text-[#536E62] dark:text-[#C4D9CC]">
          You're all caught up
        </p>
        <p className="mt-2 text-xs leading-5 text-[#89968D] dark:text-[#9EB1A4]">
          New people to discover will appear here.
        </p>
      </div>
    )}

    {/* Footer */}
    <div className="mt-8 border-t border-[#DFE6E0] px-2 pt-4 dark:border-[#344A43]">
      <p className="text-[10px] leading-5 text-[#9AA69E] dark:text-[#83988B]">
        A little space for every chapter of you.
      </p>
      <p className="mt-1 text-[10px] text-[#9AA69E] dark:text-[#83988B]">
        © Solace
      </p>
    </div>

  </aside>
);


}

export default RightSidebar