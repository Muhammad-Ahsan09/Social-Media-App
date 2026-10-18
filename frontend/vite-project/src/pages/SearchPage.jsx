import { useEffect, useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import { FaRegHeart, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoIosHeart } from "react-icons/io";
import { IoChatbubbleOutline } from "react-icons/io5";
import { TbLocationShare } from "react-icons/tb";
import BottomNavbar from "../components/BottomNavbar";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
import { useMemo } from "react";
import LazyImage from "../components/Image";


const SearchPage = ({ setUser, currentUserId }) => {

    const [search, setSearch] = useState("")
    const [posts, setPosts] = useState([])
    const [likedPostsId, setLikedPostsId] = useState([])
    const [users, setUsers] = useState([])

    useEffect(() => {
        const getLikedPosts = async () => {
            const res = await fetch(`${BACKEND_URL}/api/liked_posts/${currentUserId}`)
            let data = await res.json()

            data = data.map((post) => post.id)
            setLikedPostsId(data)
        }
        getLikedPosts()
    }, [])


    const handleSearch = async () => {
        if (search.length === "") {
            return;
        }
        const res = await fetch(`${BACKEND_URL}/api/search/${search}`)
        const data = await res.json()

        setPosts(data[0])
        setUsers(data[1])
    }

    const handleLikePost = async (postid) => {
        setLikedPostsId([...likedPostsId, postid]);
        await fetch(`${BACKEND_URL}/api/posts/like/${postid}/${currentUserId}`, {
            method: "PATCH"
        });
    };

    const handleUnlikePost = async (postid) => {
        setLikedPostsId(likedPostsId.filter((id) => id != postid));
        await fetch(`${BACKEND_URL}/api/posts/unlike/${postid}/${currentUserId}`, {
            method: "PATCH"
        });
    };



// ---- Put these ABOVE your `return` (inside the component) ----

const likedSet = useMemo(() => new Set(likedPostsId), [likedPostsId]);

const actionBtn =
    "flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#E9EFEB] active:scale-90 dark:hover:bg-[#30483B]";
const actionIcon = "h-[21px] w-[21px] text-[#536E62] dark:text-[#C4D9CC]";

const hasQuery = search.trim().length > 0;

// ---- Replace your whole `return` with this ----

return (
    <>
        <div className="flex flex-col md:flex-row">
            <LeftSidebar setUser={setUser} currentUserId={currentUserId} />

            <div className="w-full px-4 pb-32 pt-4 text-[#294C46] sm:px-6 md:w-5/6 md:pb-40 md:pr-8 dark:text-[#E1EAE4]">

                {/* Search bar */}
                <div className="sticky top-0 z-10 -mx-1 bg-white/80 px-1 pb-4 pt-1 backdrop-blur dark:bg-black/60">
                    <div className="flex max-w-[620px] items-center rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] pr-2 shadow-[0_8px_30px_-24px_rgba(41,76,70,0.25)] transition-colors duration-300 focus-within:border-[#78BFA7] dark:border-[#344A43] dark:bg-[#1D3028] dark:focus-within:border-[#78BFA7]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                            aria-label="Search posts and people"
                            placeholder="Search posts and people..."
                            className="h-12 w-full bg-transparent px-4 text-sm text-[#294C46] outline-none placeholder:text-[#9AA69E] dark:text-[#E1EAE4] dark:placeholder:text-[#83988B]"
                        />

                        <button
                            type="button"
                            aria-label="Search"
                            onClick={handleSearch}
                            className={actionBtn}
                        >
                            <FaSearch className={actionIcon} />
                        </button>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,620px)_minmax(0,1fr)] lg:gap-10">

                    {/* ===== Posts column ===== */}
                    <section aria-label="Post results">
                        {posts.length > 0 ? (
                            posts.map((post, index) => (
                                <article
                                    key={post.id ?? index}
                                    className="mb-8 w-full overflow-hidden rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] shadow-[0_8px_30px_-24px_rgba(41,76,70,0.25)] transition-colors duration-300 dark:border-[#344A43] dark:bg-[#1D3028] dark:text-[#E1EAE4] sm:mb-10"
                                >

                                    {/* Post header */}
                                    <div className="flex items-center justify-between px-4 py-4 sm:px-5">
                                        <Link
                                            to={`/profile/${post.user_id}`}
                                            className="group flex min-w-0 items-center gap-3"
                                        >
                                            <img
                                                src={post.profile_pic_url}
                                                alt={`${post.full_name}'s profile`}
                                                className="h-11 w-11 shrink-0 rounded-full border border-[#D6DFD9] object-cover transition group-hover:border-[#78BFA7] dark:border-[#40574C]"
                                            />

                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold text-[#294C46] transition group-hover:text-[#397E6D] dark:text-[#E1EAE4] dark:group-hover:text-[#A9DCC8]">
                                                    {post.full_name}
                                                </h3>
                                                <p className="mt-0.5 text-xs text-[#89968D] dark:text-[#9EB1A4]">
                                                    Shared a moment
                                                </p>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Post media */}
                                    <div className="overflow-hidden bg-[#E9EFEB] dark:bg-[#17251F]">
                                        {post.resource_type === "video" ? (
                                            <video
                                                src={post.imageUrl}
                                                controls
                                                muted
                                                loop
                                                playsInline
                                                className="block max-h-[65vh] w-full object-contain"
                                            />
                                        ) : (
                                            <Link
                                                to={`/posts/${post.id}`}
                                                className="flex h-[65vh] min-h-[250px] max-h-[600px] w-full items-center justify-center overflow-hidden bg-[#E9EFEB] dark:bg-[#17251F]"
                                            >
                                                <LazyImage
                                                    src={post.imageUrl}
                                                    alt={post.description || `Post by ${post.full_name}`}
                                                    height="100%"
                                                />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 px-3 pt-3 sm:px-4">
                                        <button
                                            type="button"
                                            aria-label={likedSet.has(post.id) ? "Unlike post" : "Like post"}
                                            onClick={() =>
                                                likedSet.has(post.id)
                                                    ? handleUnlikePost(post.id)
                                                    : handleLikePost(post.id)
                                            }
                                            className={actionBtn}
                                        >
                                            {likedSet.has(post.id) ? (
                                                <IoIosHeart className="h-6 w-6 text-[#C96D70]" />
                                            ) : (
                                                <FaRegHeart className={actionIcon} />
                                            )}
                                        </button>

                                        <Link
                                            to={`/posts/${post.id}`}
                                            aria-label="View comments"
                                            className={actionBtn}
                                        >
                                            <IoChatbubbleOutline className={actionIcon} />
                                        </Link>

                                        <button
                                            type="button"
                                            aria-label="Share post"
                                            onClick={() => {
                                                const url = `${window.location.origin}/posts/${post.id}`;
                                                if (navigator.share) {
                                                    navigator
                                                        .share({ title: `Post by ${post.full_name}`, url })
                                                        .catch(() => { });
                                                } else {
                                                    navigator.clipboard?.writeText(url);
                                                }
                                            }}
                                            className={actionBtn}
                                        >
                                            <TbLocationShare className={actionIcon} />
                                        </button>
                                    </div>

                                    {/* Likes */}
                                    <div className="px-4 pt-1">
                                        <p className="text-[13px] font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                                            {post.likes} {post.likes === 1 ? "like" : "likes"}
                                        </p>
                                    </div>

                                    {/* Caption */}
                                    <div className="px-4 pb-1 pt-2">
                                        <p className="line-clamp-2 break-words text-[13px] leading-6 text-[#536E62] dark:text-[#C4D9CC]">
                                            <Link
                                                to={`/profile/${post.user_id}`}
                                                className="mr-2 font-semibold text-[#294C46] hover:text-[#397E6D] dark:text-[#E1EAE4] dark:hover:text-[#A9DCC8]"
                                            >
                                                {post.full_name}
                                            </Link>

                                            {post.description}
                                        </p>
                                    </div>

                                    {/* Comments link */}
                                    <div className="px-4 pb-3 pt-1">
                                        <Link
                                            to={`/posts/${post.id}`}
                                            className="text-xs text-[#89968D] transition hover:text-[#397E6D] dark:text-[#9EB1A4] dark:hover:text-[#A9DCC8]"
                                        >
                                            View all comments
                                        </Link>
                                    </div>
                                </article>
                            ))
                        ) : (
                            hasQuery && (
                                <div className="rounded-2xl border border-dashed border-[#D6DFD9] bg-[#F6F7F4] px-6 py-12 text-center dark:border-[#344A43] dark:bg-[#1D3028]">
                                    <h2 className="text-sm font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                                        No posts found
                                    </h2>
                                    <p className="mt-1 text-xs text-[#89968D] dark:text-[#9EB1A4]">
                                        Try a different word or check the spelling.
                                    </p>
                                </div>
                            )
                        )}
                    </section>

                    {/* ===== People column ===== */}
                    <section aria-label="People results" className="min-w-0 lg:max-w-[420px]">
                        {users.length > 0 ? (
                            <div className="overflow-hidden rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] shadow-[0_8px_30px_-24px_rgba(41,76,70,0.25)] transition-colors duration-300 dark:border-[#344A43] dark:bg-[#1D3028]">
                                <h2 className="px-4 pb-2 pt-4 text-sm font-semibold text-[#294C46] sm:px-5 dark:text-[#E1EAE4]">
                                    People
                                </h2>

                                <ul>
                                    {users.map((user) => (
                                        <li
                                            key={user.id}
                                            className="mx-4 border-t border-[#DFE6E0] first:border-t-0 dark:border-[#344A43] sm:mx-5"
                                        >
                                            <Link
                                                to={`/profile/${user.id}`}
                                                className="group flex min-w-0 items-center gap-3 py-3"
                                            >
                                                <img
                                                    src={user.profile_pic_url}
                                                    alt={`${user.full_name}'s profile`}
                                                    className="h-11 w-11 shrink-0 rounded-full border border-[#D6DFD9] object-cover transition group-hover:border-[#78BFA7] dark:border-[#40574C]"
                                                />
                                                <h3 className="truncate text-sm font-semibold text-[#294C46] transition group-hover:text-[#397E6D] dark:text-[#E1EAE4] dark:group-hover:text-[#A9DCC8]">
                                                    {user.full_name}
                                                </h3>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            hasQuery && (
                                <div className="rounded-2xl border border-dashed border-[#D6DFD9] bg-[#F6F7F4] px-6 py-12 text-center dark:border-[#344A43] dark:bg-[#1D3028]">
                                    <h2 className="text-sm font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                                        No people found
                                    </h2>
                                    <p className="mt-1 text-xs text-[#89968D] dark:text-[#9EB1A4]">
                                        Try searching by full name.
                                    </p>
                                </div>
                            )
                        )}
                    </section>
                </div>
            </div>
        </div>

        <BottomNavbar currentUserId={currentUserId} />
    </>
);

}

export default SearchPage;