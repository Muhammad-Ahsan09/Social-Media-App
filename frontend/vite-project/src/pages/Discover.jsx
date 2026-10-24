
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import LeftSidebar from "../components/LeftSidebar";
import BottomNavbar from "../components/BottomNavbar";
import TopNavbar from "../components/TopNavbar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const cardCorners = [
    "rounded-[26px_26px_26px_12px]",
    "rounded-[20px_28px_14px_28px]",
    "rounded-[28px_16px_28px_28px]",
    "rounded-[16px_28px_24px_28px]",
    "rounded-[28px_24px_16px_28px]",
];

const Discover = ({ setUser, currentUserId }) => {
    const [search, setSearch] = useState("");

    // The default Discover feed
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search results
    const [searchPosts, setSearchPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");

    const isSearchMode = hasSearched;
    const displayedPosts = isSearchMode ? searchPosts : allPosts;

    // Fetch the default Discover feed
    useEffect(() => {
        const controller = new AbortController();

        const getPosts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${BACKEND_URL}/api/posts`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Unable to load posts.");
                }

                const data = await response.json();

                setAllPosts(Array.isArray(data) ? data : []);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError("Something went wrong while loading posts.");
                    console.error("Discover posts error:", err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        getPosts();

        return () => controller.abort();
    }, []);

    // Search for posts and people
    const handleSearch = async (event) => {
        event?.preventDefault();

        const query = search.trim();

        if (!query) {
            setHasSearched(false);
            setSearchPosts([]);
            setUsers([]);
            setSearchError("");
            return;
        }

        try {
            setSearchLoading(true);
            setSearchError("");
            setHasSearched(true);

            const response = await fetch(
                `${BACKEND_URL}/api/search/${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error("Unable to search right now.");
            }

            const data = await response.json();

            setSearchPosts(Array.isArray(data?.[0]) ? data[0] : []);
            setUsers(Array.isArray(data?.[1]) ? data[1] : []);
        } catch (err) {
            setSearchPosts([]);
            setUsers([]);
            setSearchError("Something went wrong while searching.");
            console.error("Discover search error:", err);
        } finally {
            setSearchLoading(false);
        }
    };

    const clearSearch = () => {
        setSearch("");
        setHasSearched(false);
        setSearchPosts([]);
        setUsers([]);
        setSearchError("");
    };

    return (
        <>
            <TopNavbar />

            <div className="flex min-h-screen flex-col bg-[#F7F8F5] pt-14 text-[#294C46] transition-colors dark:bg-gray-950 dark:text-gray-100 md:flex-row md:pt-0">
                <LeftSidebar
                    setUser={setUser}
                    currentUserId={currentUserId}
                />

                <main className="min-w-0 flex-1 px-3 pb-24 pt-5 sm:px-5 md:px-7 md:pb-8 md:pt-8 lg:px-9">

                    {/* Page heading */}
                    <div className="mb-5">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#82978C]">
                            Find your inspiration
                        </p>

                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Discover
                        </h1>

                        <p className="mt-2 max-w-md text-sm leading-6 text-[#75877E] dark:text-gray-400">
                            Explore moments, find people, and discover stories worth sharing.
                        </p>
                    </div>

                    {/* Search bar */}
                    <form
                        onSubmit={handleSearch}
                        className="sticky top-14 z-20 -mx-1 mb-7 bg-[#F7F8F5]/95 px-1 py-2 backdrop-blur-md dark:bg-gray-950/95 md:top-0"
                    >
                        <div className="flex max-w-2xl items-center rounded-2xl border border-[#D6DFD9] bg-white shadow-[0_8px_30px_-24px_rgba(41,76,70,0.25)] transition-colors focus-within:border-[#78BFA7] dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-[#78BFA7]">
                            <FaSearch className="ml-4 shrink-0 text-[#82978C]" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setSearch(value);

                                    if (!value.trim()) {
                                        setHasSearched(false);
                                        setSearchPosts([]);
                                        setUsers([]);
                                        setSearchError("");
                                    }
                                }}
                                placeholder="Search posts and people..."
                                aria-label="Search posts and people"
                                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#9AA69E] dark:text-gray-100 dark:placeholder:text-gray-500"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    aria-label="Clear search"
                                    className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#82978C] transition hover:bg-[#E9EFEB] dark:hover:bg-gray-800"
                                >
                                    <FaTimes />
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={!search.trim() || searchLoading}
                                aria-label="Search"
                                className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#294C46] text-white transition hover:bg-[#38675C] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#A7C6B4] dark:text-gray-900"
                            >
                                <FaSearch />
                            </button>
                        </div>
                    </form>

                    {/* Search status */}
                    {isSearchMode && (
                        <div className="mb-5">
                            <p className="text-sm text-[#75877E] dark:text-gray-400">
                                Results for{" "}
                                <span className="font-semibold text-[#294C46] dark:text-gray-200">
                                    "{search.trim()}"
                                </span>
                            </p>
                        </div>
                    )}

                    {/* People results */}
                    {isSearchMode && !searchLoading && !searchError && users.length > 0 && (
                        <section className="mb-8" aria-label="People results">
                            <h2 className="mb-3 text-lg font-semibold">
                                People
                            </h2>

                            <div className="flex gap-4 overflow-x-auto pb-3">
                                {users.map((user) => (
                                    <Link
                                        key={user.id}
                                        to={`/profile/${user.id}`}
                                        className="flex w-28 shrink-0 flex-col items-center gap-2 rounded-2xl border border-[#E1E8E0] bg-white p-4 text-center transition hover:border-[#A9C7B4] hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                                    >
                                        <img
                                            src={user.profile_pic_url || "/default-avatar.png"}
                                            alt={`${user.full_name || "User"}'s profile`}
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src = "/default-avatar.png";
                                            }}
                                            className="h-14 w-14 rounded-full border border-[#D6DFD9] object-cover dark:border-gray-700"
                                        />

                                        <span className="w-full truncate text-sm font-medium">
                                            {user.full_name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Posts heading */}
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">
                            {isSearchMode ? "Posts" : "Explore posts"}
                        </h2>

                        {!isSearchMode && (
                            <span className="text-xs text-[#82978C]">
                                Made for you to discover
                            </span>
                        )}
                    </div>

                    {/* Loading skeletons */}
                    {(loading || searchLoading) ? (
                        <div
                            className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5"
                            aria-label="Loading posts"
                        >
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="mb-4 break-inside-avoid animate-pulse"
                                >
                                    <div
                                        className={`rounded-[24px] bg-[#E7EBE5] dark:bg-gray-800 ${index % 3 === 0
                                                ? "h-64"
                                                : index % 3 === 1
                                                    ? "h-44"
                                                    : "h-52"
                                            }`}
                                    />
                                    <div className="mt-3 h-3 w-2/3 rounded-full bg-[#E7EBE5] dark:bg-gray-800" />
                                </div>
                            ))}
                        </div>
                    ) : error && !isSearchMode ? (
                        <div className="rounded-[28px] border border-[#E2E8E0] bg-white px-5 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
                            <p className="text-sm text-[#75877E] dark:text-gray-300">
                                {error}
                            </p>

                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 rounded-full bg-[#294C46] px-5 py-2 text-sm font-medium text-white hover:bg-[#38675C]"
                            >
                                Try again
                            </button>
                        </div>
                    ) : searchError ? (
                        <div className="rounded-[28px] border border-dashed border-[#D8E1D6] px-5 py-12 text-center dark:border-gray-700">
                            <p className="text-sm text-red-500">{searchError}</p>
                            <button
                                onClick={handleSearch}
                                className="mt-4 rounded-full bg-[#294C46] px-5 py-2 text-sm font-medium text-white hover:bg-[#38675C]"
                            >
                                Try again
                            </button>
                        </div>
                    ) : displayedPosts.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D8E1D6] px-5 text-center dark:border-gray-700">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EEE7] text-[#42675A] dark:bg-gray-800 dark:text-[#B4D0BE]">
                                <FaSearch size={22} />
                            </div>

                            <h2 className="text-lg font-medium">
                                {isSearchMode
                                    ? "No posts found"
                                    : "Nothing to discover yet"}
                            </h2>

                            <p className="mt-2 max-w-sm text-sm text-[#75877E] dark:text-gray-400">
                                {isSearchMode
                                    ? "Try another search term or check the spelling."
                                    : "New posts will appear here as your community shares their stories."}
                            </p>

                            {isSearchMode && (
                                <button
                                    onClick={clearSearch}
                                    className="mt-4 rounded-full bg-[#294C46] px-5 py-2 text-sm font-medium text-white hover:bg-[#38675C]"
                                >
                                    Back to Discover
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Pinterest-style masonry feed */
                        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5 xl:columns-5">
                            {displayedPosts.map((post, index) => (
                                <article
                                    key={post.id ?? post._id}
                                    className="group mb-4 break-inside-avoid sm:mb-5"
                                >
                                    <Link
                                        to={`/posts/${post.id ?? post._id}`}
                                        aria-label={`View post ${index + 1}`}
                                        className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#719987] focus-visible:ring-offset-4 dark:focus-visible:ring-offset-gray-950"
                                    >
                                        <div
                                            className={`relative isolate overflow-hidden bg-[#E9EDE7] dark:bg-gray-800 ${cardCorners[index % cardCorners.length]
                                                }`}
                                        >
                                            {post.resource_type === "video" ? (
                                                <video
                                                    src={post.imageUrl}
                                                    muted
                                                    loop
                                                    playsInline
                                                    preload="metadata"
                                                    aria-label="Discover video"
                                                    className="block h-auto max-h-[560px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                                                />
                                            ) : (
                                                <img
                                                    src={post.imageUrl}
                                                    alt={
                                                        post.caption ||
                                                        post.description ||
                                                        "Community post"
                                                    }
                                                    loading="lazy"
                                                    className="block h-auto max-h-[560px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                                                />
                                            )}

                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            {post.resource_type === "video" && (
                                                <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="15"
                                                        height="15"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="m8 5 12 7-12 7z" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>

                                        {(post.caption || post.description) && (
                                            <p className="mt-2 truncate px-1 text-sm font-medium leading-5 text-[#354F45] dark:text-gray-200">
                                                {post.description}
                                            </p>
                                        )}
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <BottomNavbar currentUserId={currentUserId} />
        </>
    );
};

export default Discover;
