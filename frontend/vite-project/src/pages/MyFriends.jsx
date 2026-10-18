import { useEffect, useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import TopNavbar from "../components/TopNavbar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyFriends = ({ setUser, currentUserId }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getFriends = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${BACKEND_URL}/api/friends/${currentUserId}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error("Unable to load your friends.");
        }

        const data = await res.json();

        setFriends(Array.isArray(data) ? data : data.result ?? []);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      getFriends();
    }
  }, [currentUserId]);

  return (
    <div className="min-h-screen bg-[#F5F7F3] text-[#294C46] transition-colors dark:bg-[#17251F] dark:text-[#E1EAE4]">
      <TopNavbar />

      <div className="flex min-h-[calc(100vh-64px)] flex-col md:flex-row">
        <LeftSidebar
          setUser={setUser}
          currentUserId={currentUserId}
        />

        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 md:px-8 md:py-10 md:pb-10">
          <div className="mx-auto max-w-3xl">
            {/* Heading */}
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  My Friends
                </h1>

                {!loading && !error && friends.length > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#DCE9DF] px-2 text-xs font-semibold text-[#397E6D] dark:bg-[#293D30] dark:text-[#A9DCC8]">
                    {friends.length}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-[#78877F] dark:text-[#9EB1A4]">
                The people who make your journey meaningful.
              </p>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D6E1D7] border-t-[#397E6D] dark:border-[#344A3E] dark:border-t-[#A9DCC8]" />
              </div>
            ) : error ? (
              /* Error state */
              <div className="rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900 dark:bg-[#203128]">
                <p className="font-medium text-red-600 dark:text-red-300">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFriends([]);
                    setError("");
                    setLoading(true);

                    fetch(`${BACKEND_URL}/api/friends/${currentUserId}`, {
                      credentials: "include",
                    })
                      .then(async (res) => {
                        if (!res.ok) {
                          throw new Error("Unable to load your friends.");
                        }
                        return res.json();
                      })
                      .then((data) => {
                        setFriends(
                          Array.isArray(data) ? data : data.result ?? []
                        );
                      })
                      .catch((err) => {
                        setError(err.message || "Something went wrong.");
                      })
                      .finally(() => setLoading(false));
                  }}
                  className="mt-4 rounded-xl bg-[#397E6D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6B5C]"
                >
                  Try again
                </button>
              </div>
            ) : friends.length === 0 ? (
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
                    <path d="M20 8v6M17 11h6" />
                  </svg>
                </div>

                <h2 className="text-lg font-semibold">
                  Your circle starts here
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#78877F] dark:text-[#9EB1A4]">
                  You haven't connected with anyone yet. Discover people,
                  reconnect with familiar faces, and start building your
                  circle.
                </p>

                <Link
                  to="/"
                  className="mt-6 rounded-xl bg-[#397E6D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6B5C]"
                >
                  Explore Solace
                </Link>
              </div>
            ) : (
              /* Friends list */
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#E0E7E0] bg-white p-4 shadow-sm transition hover:border-[#C5D8CA] sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-[#344A3E] dark:bg-[#203128] dark:hover:border-[#587866]"
                  >
                    {/* Profile */}
                    <Link
                      to={`/profile/${friend.id}`}
                      className="flex min-w-0 items-center gap-3 sm:gap-4"
                    >
                      <img
                        src={
                          friend.profile_pic_url ||
                          `https://i.pravatar.cc/150?u=${friend.id}`
                        }
                        alt={`${friend.full_name}'s profile`}
                        className="h-14 w-14 shrink-0 rounded-full border-2 border-[#E0EAE1] object-cover sm:h-16 sm:w-16 dark:border-[#40574C]"
                      />

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                          {friend.full_name}
                        </h2>
                        <p className="mt-1 text-xs text-[#78877F] dark:text-[#9EB1A4]">
                          Connected on Solace
                        </p>
                      </div>
                    </Link>

                    {/* Chat action */}
                    <Link
                      to={`/chats/${friend.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D6E1D7] bg-[#F5F8F4] px-4 py-2.5 text-sm font-semibold text-[#397E6D] transition hover:border-[#A9C6B5] hover:bg-[#E5EEE6] active:scale-[0.98] dark:border-[#40574C] dark:bg-[#293D30] dark:text-[#A9DCC8] dark:hover:bg-[#344A3E]"
                    >
                      <IoChatbubbleEllipsesOutline className="h-5 w-5" />
                      Open chat
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default MyFriends;
